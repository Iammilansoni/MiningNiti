import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#05030A]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        
        <div className="max-w-[800px] mx-auto px-6">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#947AFC] mb-4">Legal & Compliance</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Privacy Policy</h1>
          <p className="text-white/50 mb-12">Last updated: May 29, 2026</p>

          <div className="prose prose-invert prose-p:text-white/60 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-bold prose-a:text-[#947AFC] max-w-none">
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 mb-10">
              <h3 className="text-lg font-bold text-white mt-0 mb-2">Our Zero-Training Guarantee</h3>
              <p className="text-sm text-white/60 m-0">
                MiningNiti is an enterprise AI infrastructure company. <strong>We do not use your operational data, documents, or queries to train our foundational models.</strong> Your data remains strictly within your isolated tenant or on-premise deployment.
              </p>
            </div>

            <h2>1. Information We Collect</h2>
            <p>
              When you deploy MiningNiti, the system processes operational documents, including safety logs, geological reports, employee shift records, and regulatory filings. Depending on your deployment model (SaaS vs. On-Premise), the nature of our access to this data varies fundamentally:
            </p>
            <ul>
              <li><strong>On-Premise / VPC Deployments:</strong> We collect zero operational data. All processing, including OCR and LLM inference, occurs within your firewalled environment. We only collect anonymized telemetry (CPU/GPU utilization, error crash logs) if explicitly enabled by your administrators.</li>
              <li><strong>Managed SaaS:</strong> We temporarily process your documents to extract text and build vector embeddings. These embeddings are stored in single-tenant isolated databases encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
            </ul>

            <h2>2. How We Use Information</h2>
            <p>
              We use the telemetry and account information collected to:
            </p>
            <ul>
              <li>Provide, maintain, and improve the MiningNiti platform infrastructure.</li>
              <li>Process transactions and send related information, including invoices and confirmations.</li>
              <li>Send technical notices, security alerts, and administrative messages.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
            </ul>

            <h2>3. Security & Certifications</h2>
            <p>
              MiningNiti maintains SOC 2 Type II compliance and adheres to ISO 27001 standards for information security management. Access to production environments is strictly gated via hardware security keys, zero-trust network architecture, and mandatory multi-party approval for infrastructure changes.
            </p>

            <h2>4. Data Retention and Deletion</h2>
            <p>
              For SaaS customers, if you terminate your contract, all vector embeddings, extracted text, and uploaded documents are permanently wiped from our systems within 14 days, accompanied by a cryptographic certificate of destruction.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data handling practices, please contact our security team directly at <a href="mailto:security@miningniti.com">security@miningniti.com</a>.
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
