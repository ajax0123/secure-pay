import React from 'react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  Smartphone, 
  MessageSquare, 
  ShieldCheck,
  Activity,
  LayoutDashboard,
  ShieldAlert,
  FileText
} from 'lucide-react';

const features = [
  {
    title: "Instant Transfers",
    desc: "Send money globally in seconds with zero latency and complete security.",
    icon: Zap,
    color: "text-emerald-600"
  },
  {
    title: "Admin Control Panel",
    desc: "Centralized management for users, transactions, and security settings with granular permissions.",
    icon: LayoutDashboard,
    color: "text-emerald-600"
  },
  {
    title: "Real-Time Fraud Detection",
    desc: "Instant analysis of every transaction using behavioral biometrics and pattern recognition.",
    icon: ShieldAlert,
    color: "text-rose-600"
  },
  {
    title: "Payment Receipt",
    desc: "Automatically generated, cryptographically signed transaction receipts for every transfer.",
    icon: FileText,
    color: "text-amber-600"
  },
  {
    title: "Real-Time Monitoring",
    desc: "24/7 surveillance of system health and security events with automated alerting.",
    icon: Activity,
    color: "text-emerald-600"
  },
  {
    title: "Device Tracking",
    desc: "Intelligent device fingerprinting to prevent unauthorized access attempts.",
    icon: Smartphone,
    color: "text-emerald-600"
  },
  {
    title: "Dispute System",
    desc: "Built-in resolution center for fast and fair transaction disputes.",
    icon: MessageSquare,
    color: "text-rose-600"
  },
  {
    title: "Secure Sessions",
    desc: "Auto-expiring sessions with hardware-backed security key support.",
    icon: ShieldCheck,
    color: "text-indigo-600"
  }
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-24 bg-secondary/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Peace of Mind</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your digital assets with absolute confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-8 h-full bg-card/50 border-border hover:border-primary/50 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
