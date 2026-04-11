import React from 'react';
import { motion } from 'motion/react';
import { 
  Key, 
  Lock, 
  EyeOff, 
  BrainCircuit, 
  FileText, 
  Fingerprint, 
  ShieldAlert,
  Activity
} from 'lucide-react';

const layers = [
  {
    id: 1,
    title: "JWT Authentication",
    tech: "jsonwebtoken",
    desc: "Generates secure tokens after login to protect API routes and prevent unauthorized access to the system.",
    icon: Key,
    color: "text-emerald-600",
    bg: "bg-emerald-600/5"
  },
  {
    id: 2,
    title: "Password Hashing",
    tech: "bcrypt",
    desc: "Converts real passwords into secure hashes before storage, protecting credentials even in case of data leaks.",
    icon: Lock,
    color: "text-emerald-600",
    bg: "bg-emerald-600/5"
  },
  {
    id: 3,
    title: "Two-Factor Auth",
    tech: "OTP / 2FA",
    desc: "Adds an extra layer of security by requiring OTP verification during login or critical account changes.",
    icon: Fingerprint,
    color: "text-emerald-600",
    bg: "bg-emerald-600/5"
  },
  {
    id: 4,
    title: "Session Management",
    tech: "express-session",
    desc: "Securely maintains active user sessions and cookies to prevent hijacking and unauthorized reuse.",
    icon: Activity,
    color: "text-emerald-600",
    bg: "bg-emerald-600/5"
  },
  {
    id: 5,
    title: "Rate Limiting",
    tech: "express-rate-limit",
    desc: "Protects APIs and login endpoints from brute force attacks and DDoS by limiting requests per IP.",
    icon: ShieldAlert,
    color: "text-amber-600",
    bg: "bg-amber-600/5"
  },
  {
    id: 6,
    title: "HTTP Security",
    tech: "Helmet.js",
    desc: "Adds critical security headers like CSP and X-Frame-Options to protect against clickjacking and sniffing.",
    icon: FileText,
    color: "text-rose-600",
    bg: "bg-rose-600/5"
  },
  {
    id: 7,
    title: "Input Sanitization",
    tech: "XSS Protection",
    desc: "Cleans user input before processing to block malicious scripts and prevent injection attacks.",
    icon: EyeOff,
    color: "text-emerald-600",
    bg: "bg-emerald-600/5"
  }
];

export const SecurityLayers = () => {
  return (
    <section id="security" className="py-24 bg-secondary/20 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">7-Layer Security Architecture</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our defense-in-depth strategy ensures that your assets are protected by multiple redundant security protocols.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden lg:block" />

          <div className="space-y-12">
            {layers.map((layer, index) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="flex-1 lg:text-right w-full">
                  <div className={index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12 lg:text-left'}>
                    <h3 className="text-2xl font-bold mb-2">{layer.title}</h3>
                    <p className="text-primary text-sm font-mono mb-3">{layer.tech}</p>
                    <p className="text-muted-foreground">{layer.desc}</p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl ${layer.bg} flex items-center justify-center border border-white/5 shadow-lg group hover:scale-110 transition-transform duration-300`}>
                    <layer.icon className={`w-8 h-8 ${layer.color}`} />
                  </div>
                </div>

                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
