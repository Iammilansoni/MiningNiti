'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, Github, ExternalLink } from 'lucide-react';
import { Container, SectionHeader } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { teamMembers } from '@/lib/constants';

export function Team() {
  return (
    <section className="py-24 md:py-32 relative">
      <Container>
        <SectionHeader
          badge="Our Team"
          title="Meet the Innovators"
          subtitle="The talented team behind MiningNiti – winners of SIH 2023."
        />

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  
                  {/* Social Links (shown on hover) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    {member.linkedin && member.linkedin !== '#' && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                        aria-label={`${member.name}'s LinkedIn`}
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                      aria-label={`${member.name}'s GitHub`}
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                  
                  {/* Skills */}
                  {member.skills && (
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="muted" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
