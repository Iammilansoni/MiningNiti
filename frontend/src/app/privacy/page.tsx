import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-[800px] mx-auto px-6">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Privacy Policy</h1>
          <p className="text-white/50 mb-12">Last updated: July 2026</p>

          <div className="prose prose-invert prose-p:text-white/60 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-bold max-w-none">

            <h2>Overview</h2>
            <p>
              MiningNiti is an open-source AI-powered document intelligence platform built for the coal mining industry. It was developed as a Smart India Hackathon 2023 project and recognized by Coal India Limited &amp; CMPDI.
            </p>

            <h2>Data Processing</h2>
            <p>
              Documents uploaded to MiningNiti are processed to extract text, generate embeddings, and produce AI-generated summaries and analyses. All processing occurs on the deployed infrastructure (backend server and database).
            </p>

            <h2>Data Storage</h2>
            <p>
              Uploaded documents and their processed data are stored in the PostgreSQL database. Embeddings are stored using pgvector for semantic search functionality. Data is retained as long as the user maintains their account.
            </p>
            <ul>
              <li>Documents and extracted text are stored in the database</li>
              <li>Vector embeddings are generated and stored for search functionality</li>
              <li>Chat history and AI responses are stored per session</li>
            </ul>

            <h2>Third-Party Services</h2>
            <p>
              MiningNiti uses the following third-party services for authentication and AI processing:
            </p>
            <ul>
              <li><strong>Clerk</strong> — for user authentication and session management</li>
              <li><strong>Google Gemini / Groq / Mistral / Cerebras</strong> — for AI document analysis and chat responses</li>
            </ul>

            <h2>Data Deletion</h2>
            <p>
              Users can delete their documents and chat sessions at any time through the application interface. Deleted data is permanently removed from the database.
            </p>

            <h2>Open Source</h2>
            <p>
              MiningNiti is open-source under the MIT License. The source code is publicly available on GitHub. Self-hosted deployments are fully under the operator&apos;s control.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
