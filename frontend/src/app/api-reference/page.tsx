import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/footer';
import { Terminal, Code2, Database } from 'lucide-react';

export default function ApiReferencePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      
      <main className="flex-1 pt-24 flex">
        
        {/* Left Sidebar (Desktop only) */}
        <aside className="w-[280px] hidden lg:block shrink-0 border-r border-white/[0.08] p-8 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-8">
            <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Getting Started</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><a href="#" className="text-[#947AFC] font-medium">Authentication</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Pagination</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Errors</a></li>
            </ul>
          </div>
          <div className="mb-8">
            <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Documents</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><a href="#" className="text-white hover:text-white transition-colors font-medium">Upload Document</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">List Documents</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Get Extraction Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Intelligence</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Semantic Query</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Run Compliance Check</a></li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-[900px] p-8 lg:p-16">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#947AFC] mb-4">REST API</p>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">API Reference</h1>
          <p className="text-white/50 text-lg mb-12">
            Build custom workflows, connect your ERP, or integrate MiningNiti's intelligence layer directly into your existing operational dashboards.
          </p>

          <div className="grid gap-16">
            
            {/* Endpoint 1 */}
            <div className="grid xl:grid-cols-[1fr_1.2fr] gap-8 items-start">
              <div className="prose prose-invert prose-p:text-white/60 prose-headings:text-white prose-a:text-[#947AFC]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 rounded bg-[#947AFC]/10 text-[#947AFC] text-xs font-mono font-bold">POST</span>
                  <span className="font-mono text-sm text-white">/v1/documents</span>
                </div>
                <h3 className="mt-0 text-xl">Upload Document</h3>
                <p className="text-sm">
                  Upload a PDF, Word document, or image for asynchronous parsing. Returns a job ID that can be polled for extraction status.
                </p>
                <h4 className="text-sm border-b border-white/[0.08] pb-2 mb-4">Parameters</h4>
                <div className="text-sm text-white/60 mb-2"><code className="text-white bg-white/[0.04] px-1.5 py-0.5 rounded">file</code> (binary) - Required</div>
                <div className="text-sm text-white/60 mb-2"><code className="text-white bg-white/[0.04] px-1.5 py-0.5 rounded">metadata</code> (json) - Optional site/zone tags</div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04] bg-[#0A0A0B]/40">
                  <Terminal className="size-4 text-white/40" />
                  <span className="text-xs font-mono text-white/40">cURL</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-[13px] font-mono leading-relaxed text-[#a8b1c2]">
                    <span className="text-[#c678dd]">curl</span> <span className="text-[#e5c07b]">-X</span> POST https://api.miningniti.com/v1/documents \<br/>
                    {'  '}<span className="text-[#e5c07b]">-H</span> <span className="text-[#98c379]">"Authorization: Bearer sk_live_..."</span> \<br/>
                    {'  '}<span className="text-[#e5c07b]">-F</span> <span className="text-[#98c379]">"file=@/path/to/audit_log.pdf"</span> \<br/>
                    {'  '}<span className="text-[#e5c07b]">-F</span> <span className="text-[#98c379]">'metadata=&#123;&quot;site&quot;: &quot;Zone_B&quot;&#125;'</span>
                  </pre>
                </div>
              </div>
            </div>

            <hr className="border-white/[0.04]" />

            {/* Endpoint 2 */}
            <div className="grid xl:grid-cols-[1fr_1.2fr] gap-8 items-start">
              <div className="prose prose-invert prose-p:text-white/60 prose-headings:text-white prose-a:text-[#947AFC]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 rounded bg-[#34D399]/10 text-[#34D399] text-xs font-mono font-bold">GET</span>
                  <span className="font-mono text-sm text-white">/v1/query</span>
                </div>
                <h3 className="mt-0 text-xl">Semantic Query</h3>
                <p className="text-sm">
                  Search across your indexed documents using natural language. Returns chunks of text with relevance scores and precise bounding box citations.
                </p>
                <h4 className="text-sm border-b border-white/[0.08] pb-2 mb-4">Parameters</h4>
                <div className="text-sm text-white/60 mb-2"><code className="text-white bg-white/[0.04] px-1.5 py-0.5 rounded">q</code> (string) - Required query</div>
                <div className="text-sm text-white/60 mb-2"><code className="text-white bg-white/[0.04] px-1.5 py-0.5 rounded">limit</code> (int) - Default 5</div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04] bg-[#0A0A0B]/40">
                  <Code2 className="size-4 text-white/40" />
                  <span className="text-xs font-mono text-white/40">Python</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-[13px] font-mono leading-relaxed text-[#a8b1c2]">
                    <span className="text-[#c678dd]">import</span> miningniti<br/><br/>
                    client = miningniti.<span className="text-[#e5c07b]">Client</span>(api_key=<span className="text-[#98c379]">"sk_live_..."</span>)<br/><br/>
                    results = client.intelligence.<span className="text-[#61afef]">query</span>(<br/>
                    {'    '}q=<span className="text-[#98c379]">"Show me all ventilation failures in Shaft B"</span>,<br/>
                    {'    '}filters={"{"}<span className="text-[#98c379]">"site"</span>: <span className="text-[#98c379]">"Shaft_B"</span>{"}"}<br/>
                    )<br/><br/>
                    <span className="text-[#c678dd]">for</span> match <span className="text-[#c678dd]">in</span> results:<br/>
                    {'    '}print(match.text, match.confidence_score)
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
