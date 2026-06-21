'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  Search, Sparkles, FileText, AlertTriangle, Shield, Tag, BookOpen,
  ChevronRight, Clock, Loader2, X, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const EXAMPLE_QUERIES = [
  'ventilation requirements underground mines',
  'emergency evacuation procedures',
  'MSHA equipment inspection frequency',
  'coal dust suppression methods',
  'PPE requirements for blasting',
  'water infusion gas drainage',
];

const CATEGORY_FILTERS = [
  { value: '', label: 'All Categories' },
  { value: 'safety_protocol', label: 'Safety Protocols' },
  { value: 'equipment_manual', label: 'Equipment Manuals' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'incident_report', label: 'Incident Reports' },
  { value: 'geological', label: 'Geological' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'training', label: 'Training' },
  { value: 'permits', label: 'Permits' },
  { value: 'maintenance', label: 'Maintenance' },
];

interface SearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  file_name: string;
  category: string;
  safety_score: number | null;
  chunk_text: string;
  section_title: string | null;
  page_numbers: number[];
  page_label: string;
  relevance_score: number;
  relevance_percent: number;
}

function RelevanceBar({ score }: { score: number }) {
  const color = score >= 0.75 ? '#10b981' : score >= 0.5 ? '#f59e0b' : '#6366f1';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>{Math.round(score * 100)}%</span>
    </div>
  );
}

function ResultCard({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  const highlightText = (text: string, maxLen = 300) => {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
              {result.document_title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground">{result.file_name}</span>
              {result.category && (
                <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground capitalize font-medium">
                  {result.category.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <RelevanceBar score={result.relevance_score} />
          <span className="text-[10px] text-muted-foreground">{result.page_label}</span>
        </div>
      </div>

      {result.section_title && (
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-primary/60" />
          <span className="text-[11px] font-medium text-primary/80">{result.section_title}</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed">
        {highlightText(result.chunk_text)}
      </p>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span>View full document</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setLastQuery(q);

    try {
      const token = await getToken();
      const params = new URLSearchParams({ q });
      if (category) params.set('category', category);

      const res = await fetch(`${API_BASE}/api/v1/search?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Search failed: ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [getToken, category]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch(query);
  };

  const handleExample = (q: string) => {
    setQuery(q);
    doSearch(q);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setLastQuery('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Semantic Search</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Search across all your mining documents using natural language — powered by AI vector search.
        </p>
      </div>

      {/* Search Bar */}
      <div className="space-y-3 relative z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "ventilation requirements for underground coal mines"'
            className="w-full pl-12 pr-24 py-4 bg-background border border-border rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/60 transition-all shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            {query && (
              <button onClick={clearSearch} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              size="sm"
              onClick={() => doSearch(query)}
              disabled={!query.trim() || isSearching}
              className="gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  category === value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state / Examples */}
      {!hasSearched && (
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Try these example queries</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleExample(q)}
                className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/20 transition-all text-sm text-muted-foreground hover:text-foreground group"
              >
                <Search className="w-4 h-4 text-primary/40 group-hover:text-primary mb-2 transition-colors" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 relative z-10"
          >
            {/* Result stats */}
            {!isSearching && !error && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {results.length > 0
                    ? <><span className="font-semibold text-foreground">{results.length}</span> results for "{lastQuery}"</>
                    : `No results found for "${lastQuery}"`
                  }
                </p>
                {results.length > 0 && (
                  <span className="text-xs text-muted-foreground">Ranked by semantic relevance</span>
                )}
              </div>
            )}

            {/* Loading skeleton */}
            {isSearching && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-5 rounded-xl border border-border bg-card animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* No results */}
            {!isSearching && !error && results.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No relevant passages found.</p>
                <p className="text-sm mt-1">Try a different query or upload more documents.</p>
              </div>
            )}

            {/* Results list */}
            {!isSearching && !error && results.length > 0 && (
              <div className="space-y-3">
                {results.map((result) => (
                  <ResultCard
                    key={result.chunk_id}
                    result={result}
                    onClick={() => router.push(`/documents/${result.document_id}`)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
