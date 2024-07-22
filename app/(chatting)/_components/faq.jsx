"use client";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { motion } from "framer-motion";

export default function Faq() {
  const defaultContent =
    "A: MiningNiti is a dedicated platform designed to assist stakeholders and customers in the mining industry. It provides 24/7 support through an AI-powered chatbot that can answer queries related to mining rules, acts, and circulars.";

    const defaultContent2 = 
    "A: You can access our services directly through our website. Simply click on the 'Start Chatting' button to begin interacting with our chatbot, which is available round the clock to assist you.";
    
    const defaultContent3 = "A: Absolutely! We value feedback from our users and are always looking to improve our services. Please feel free to contact us with your suggestions or feedback.";

    const defaultContent4 = "A: Yes, at MiningNiti, we prioritize data security. All personal information and query details are handled with strict confidentiality and in compliance with data protection regulations.";
  return (
    <section className="relative max-w-screen-xl mx-auto px-4 py-28 gap-12 md:px-8 flex flex-col justify-center items-center">
      <motion.div
        initial={{ y: 5, opacity: 0 }}
        whileInView={{
          y: 0,
          opacity: 1,
        }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="flex flex-col gap-3 justify-center items-center"
      >
        <h4 className="text-2xl font-bold sm:text-3xl bg-gradient-to-b from-foreground to-foreground/70 text-transparent bg-clip-text">
          FAQ
        </h4>
        <p className="max-w-xl text-foreground/80 text-center">
          Here are some of our frequently asked questions. If you have any other
          questions you’d like answered please feel free to email us.
        </p>
      </motion.div>
      <motion.div
        initial={{ y: 5, opacity: 0 }}
        whileInView={{
          y: 2,
          opacity: 1,
        }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1 }}
        className="max-w-2xl  w-full border border-foreground/50 rounded-md p-6"
      >
        <Accordion
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                height: "auto",
                transition: {
                  height: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    duration: 1,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 2,
                  },
                },
              },
              exit: {
                y: -50,
                opacity: 0,
                height: 0,
                transition: {
                  height: {
                    easings: "ease",
                    duration: 0.25,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 0.3,
                  },
                },
              },
            },
          }}
        >
          <AccordionItem key="1" aria-label="¿Why NextUI?" title="Q1:-  What is MiningNiti?">
            {defaultContent}
          </AccordionItem>
          <AccordionItem key="2" aria-label="¿Why NextUI?" title="Q2:- How can I access MiningNiti services?">
            {defaultContent2}
          </AccordionItem>
          <AccordionItem key="3" aria-label="¿Why NextUI?" title="Q6: Can MiningNiti help with compliance issues?">
            {defaultContent3}
            </AccordionItem>
            <AccordionItem key="4" aria-label="¿Why NextUI?" title="Q3- Is my data secure with MiningNiti?">
            {defaultContent4}
          </AccordionItem>
        </Accordion>
      </motion.div>
    </section>
  );
}