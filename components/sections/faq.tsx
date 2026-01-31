'use client';

import { motion } from 'framer-motion';
import { Container, SectionHeader } from '@/components/ui/container';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { faqs } from '@/lib/constants';

export function FAQ() {
  return (
    <section className="py-24 md:py-32 relative">
      <Container size="md">
        <SectionHeader
          badge="FAQ"
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions about MiningNiti and our services."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-muted-foreground"
        >
          Still have questions?{' '}
          <a href="/contact" className="text-primary hover:underline">
            Contact us
          </a>
        </motion.p>
      </Container>
    </section>
  );
}
