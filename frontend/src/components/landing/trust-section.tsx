'use client';

import { KeyRound, ShieldAlert, Network, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

/*
  This section used to claim "SOC 2 Type II Certified", "AES-256 encryption at
  rest and TLS 1.3 in transit", "DGMS Compliant" and "optional on-premise
  deployment or regional cloud hosting". None of those are true: there is no
  audit, no certification, no at-rest encryption layer, no regulator sign-off
  and no on-premise deployment. A fabricated security certification is the one
  claim on a page like this that a reader can check, and inventing it puts
  every other statement in doubt.

  What replaces it is the security work that actually exists in this repository
  and can be read in the source:
    * RS256-pinned Clerk JWT verification with a cached JWKS and an `azp`
      cross-tenant check — backend/app/core/security.py
    * a DNS-resolving SSRF guard on outbound document fetches, re-validating
      every redirect hop — backend/app/core/url_guard.py
    * prompt-injection filtering over the model input path —
      backend/app/services/guardrails.py
    * deny-by-default route protection — frontend/src/proxy.ts
    * a 120 req/min rate limit — backend/app/main.py

  Do not reinstate a certification, compliance or data-residency claim here
  without an actual audit report or contract behind it.
*/
export function TrustSection() {
  const trustSignals = [
    {
      icon: KeyRound,
      title: 'Pinned JWT verification',
      description:
        'Clerk session tokens are verified against a cached JWKS with the algorithm pinned to RS256, plus an authorized-party check so a token minted for another origin is rejected.'
    },
    {
      icon: ShieldAlert,
      title: 'Prompt-injection filtering',
      description:
        'Retrieved document text is screened against a compiled pattern set before it reaches the model, so instructions hidden inside an uploaded PDF are not executed.'
    },
    {
      icon: Network,
      title: 'SSRF-guarded fetches',
      description:
        'Any user-supplied document URL is resolved and every A/AAAA record checked for a public address before a request is made — redirects re-validated hop by hop, responses capped.'
    },
    {
      icon: Lock,
      title: 'Deny-by-default routing',
      description:
        'Public routes are enumerated and everything else requires a session, so a new page is protected the moment it is created. All traffic is served over HTTPS.'
    }
  ];

  return (
    <section className="py-24 bg-background" id="trust">
      <div className="mx-auto max-w-[var(--landing-max-width)] px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-heading-lg mb-4 text-foreground">Security engineering, not security badges</h2>
          <p className="text-body text-lg">
            This is a working project rather than an audited product, so here is what is
            actually implemented — each item is readable in the open source.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-xl border border-border bg-muted/20 flex flex-col items-center text-center hover:bg-muted/40 transition-colors"
            >
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <signal.icon className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{signal.title}</h3>
              <p className="text-sm text-muted-foreground">{signal.description}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground/70 max-w-2xl mx-auto">
          No third-party security audit or compliance certification has been carried out on
          this project, and none is claimed.
        </p>
      </div>
    </section>
  );
}
