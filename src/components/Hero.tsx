import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Wallet, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const Hero = () => {
  const [balance, setBalance] = React.useState(142500);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold mb-6">
              <ShieldCheck className="w-4 h-4" />
              Advanced Security Protocol
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Your Money. <br />
              <span className="text-primary">Fully Protected.</span> <br />
              Always.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Advanced security protocols, end-to-end encrypted wallets, and real-time security alerts for the modern digital economy.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-full">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard Preview */}
            <Card className="bg-card/50 backdrop-blur-xl border-border p-6 shadow-2xl relative z-10 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                  <h3 className="text-3xl font-bold">₹ {balance.toLocaleString()}.00</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Account Status</span>
                    <span className="text-xs font-bold text-success">VERIFIED</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
