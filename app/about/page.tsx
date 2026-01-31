'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Target, Eye, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section, SectionHeader } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { teamMembers } from '@/lib/constants';

const milestones = [
  { year: '2023', title: 'SIH 2023 Winner', description: 'Won Smart India Hackathon for CMPDI problem statement' },
  { year: '2023', title: 'Development', description: 'Built AI-powered compliance chatbot with RAG technology' },
  { year: '2024', title: 'Launch', description: 'Deployed for CMPDI stakeholders and mining companies' },
];

const values = [
  {
    icon: Target,
    title: 'Mission',
    description: 'To empower mining companies to operate responsibly and efficiently, ensuring compliance with all legal and environmental standards.',
  },
  {
    icon: Eye,
    title: 'Vision',
    description: 'We envision a world where mining operations thrive without compromising the health of our planet, leading the way in sustainable practices.',
  },
  {
    icon: Users,
    title: 'Values',
    description: 'Innovation, integrity, and collaboration drive everything we do. We believe in making complex regulations accessible to everyone.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <Section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          
          <Container className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <Badge variant="glass" size="lg" className="mb-6">
                <Award className="h-4 w-4 text-accent mr-2" />
                SIH 2023 Winner
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Building the Future of{' '}
                <span className="text-gradient">Mining Compliance</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                MiningNiti was born from a vision to revolutionize how the mining industry 
                handles compliance and regulatory requirements through the power of AI.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { label: 'Team Members', value: '6' },
                { label: 'Awards Won', value: '1' },
                { label: 'Documents Indexed', value: '500+' },
                { label: 'Queries Answered', value: '1000+' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-border bg-card/50"
                >
                  <div className="text-3xl font-display font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </Container>
        </Section>

        {/* Story Section */}
        <Section className="bg-card/50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge variant="default" className="mb-4">Our Story</Badge>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  From Hackathon to Production
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    MiningNiti started as a problem statement at Smart India Hackathon 2023, 
                    presented by CMPDI (Coal Mining Planning & Design Institute). The challenge? 
                    Create an intelligent system that could answer complex mining compliance queries.
                  </p>
                  <p>
                    Our team of six passionate developers took on this challenge, combining 
                    cutting-edge AI technologies like RAG (Retrieval Augmented Generation), 
                    FAISS vector databases, and LangChain to create a solution that won the 
                    hackathon.
                  </p>
                  <p>
                    Today, MiningNiti serves as a 24/7 compliance assistant, helping mining 
                    stakeholders navigate the complex landscape of mining regulations, acts, 
                    and circulars with ease.
                  </p>
                </div>
              </motion.div>

              {/* Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative pl-12 pb-8 last:pb-0"
                  >
                    <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm text-primary font-medium mb-1">{milestone.year}</div>
                    <h3 className="font-semibold text-lg mb-1">{milestone.title}</h3>
                    <p className="text-muted-foreground text-sm">{milestone.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* Values Section */}
        <Section>
          <Container>
            <SectionHeader
              badge="Our Values"
              title="What Drives Us"
              subtitle="The principles that guide our work and shape our product."
            />

            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="feature" hover="glow" className="h-full">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-xl mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Team Section */}
        <Section id="team" className="bg-card/50">
          <Container>
            <SectionHeader
              badge="Our Team"
              title="Meet the Innovators"
              subtitle="The talented individuals behind MiningNiti."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="default" hover="lift" className="overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                      {member.skills && (
                        <div className="flex flex-wrap gap-1">
                          {member.skills.map((skill) => (
                            <Badge key={skill} variant="muted" size="sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section>
          <Container size="md" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Experience MiningNiti?
              </h2>
              <p className="text-muted-foreground mb-8">
                Start using our AI-powered compliance assistant today.
              </p>
              <Button asChild size="lg">
                <Link href="/chatting">
                  Start Chatting
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
