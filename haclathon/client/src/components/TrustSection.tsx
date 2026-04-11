import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Shield, Lock, Globe, CheckCircle2 } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
        <Shield className="w-[800px] h-[800px] text-primary/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Advanced Security Architecture</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by thousands of users and financial institutions worldwide. Your security is our absolute priority.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-3">End-to-End Encryption</h4>
            <p className="text-muted-foreground">
              All data is encrypted using AES-256-GCM before it ever leaves your device.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-3">Real-Time Monitoring</h4>
            <p className="text-muted-foreground">
              Our global network monitors for threats 24/7, providing instant protection.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-3">Zero Data Exposure</h4>
            <p className="text-muted-foreground">
              We never store your private keys or sensitive personal information in raw format.
            </p>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-xl">
            <ShieldCheck className="w-6 h-6" /> PCI COMPLIANT
          </div>
          <div className="flex items-center gap-2 font-bold text-xl">
            <CheckCircle2 className="w-6 h-6" /> ISO 27001
          </div>
          <div className="flex items-center gap-2 font-bold text-xl">
            <Lock className="w-6 h-6" /> SOC 2 TYPE II
          </div>
          <div className="flex items-center gap-2 font-bold text-xl">
            <ShieldAlert className="w-6 h-6" /> GDPR READY
          </div>
        </div>
      </div>
    </section>
  );
};
