'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/product/page-header';
import { Button } from '@/components/ui/button';
import { Search, Upload, Filter, Grid2X2, List } from 'lucide-react';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { CategoryFilter, DocumentCategory } from '@/components/documents/CategoryChips';
import { EmptyState } from '@/components/product/empty-state';

// Mock data
const mockDocuments = [
  { id: '1', title: 'Q3 Environmental Audit.pdf', category: 'Compliance' as DocumentCategory, status: 'verified' as const, date: 'Oct 24, 2023', size: '2.4 MB' },
  { id: '2', title: 'Site Alpha Safety Protocol v2.docx', category: 'Safety' as DocumentCategory, status: 'pending' as const, date: 'Oct 23, 2023', size: '1.1 MB' },
  { id: '3', title: 'Geological Survey - Sector 7.pdf', category: 'Geological' as DocumentCategory, status: 'verified' as const, date: 'Oct 20, 2023', size: '14.5 MB' },
  { id: '4', title: 'Equipment Maintenance Log_Oct.xlsx', category: 'Maintenance' as DocumentCategory, status: 'flagged' as const, date: 'Oct 19, 2023', size: '4.2 MB' },
  { id: '5', title: 'DGMS Regulation Update 2024.pdf', category: 'Compliance' as DocumentCategory, status: 'verified' as const, date: 'Oct 15, 2023', size: '8.9 MB' },
  { id: '6', title: 'Blast Pattern Analysis - Q3.pdf', category: 'Geological' as DocumentCategory, status: 'verified' as const, date: 'Oct 12, 2023', size: '22.1 MB' },
];

const categories: DocumentCategory[] = ['Safety', 'Compliance', 'Geological', 'Maintenance', 'Other'];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? doc.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      <PageHeader
        title="Documents Hub"
        description="Manage, search, and analyze your operational documents."
        actions={
          <Button className="gap-2">
            <Upload className="size-4" />
            Upload File
          </Button>
        }
        className="mb-6"
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by name or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            className="hidden lg:flex"
          />
          
          <Button variant="outline" size="sm" className="lg:hidden gap-2">
            <Filter className="size-4" />
            Filter
          </Button>

          <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/50 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Category Filter */}
      <div className="mb-6 lg:hidden overflow-x-auto pb-2 no-scrollbar">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          className="flex-nowrap"
        />
      </div>

      {/* Document Grid/List */}
      <div className="flex-1">
        {filteredDocs.length > 0 ? (
          <div
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredDocs.map((doc) => (
              <DocumentCard key={doc.id} {...doc} />
            ))}
          </div>
        ) : (
          <div className="pt-12">
            <EmptyState
              icon={Search}
              title="No documents found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}" in ${selectedCategory || 'all categories'}.`
                  : "You haven't uploaded any documents yet."
              }
              action={
                searchQuery
                  ? { label: 'Clear Search', onClick: () => setSearchQuery('') }
                  : { label: 'Upload Document' }
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
