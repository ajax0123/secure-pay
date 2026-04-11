import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Download, Shield, ShieldOff, CheckCircle2, Lock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const WalletPreview = () => {
  const [isFrozen, setIsFrozen] = React.useState(false);
  const [balance, setBalance] = React.useState(142500);
  const [riskValue, setRiskValue] = React.useState(12);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isFrozen) {
        setBalance(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5));
        setRiskValue(prev => Math.max(5, Math.min(30, prev + (Math.random() > 0.5 ? 1 : -1) * 1)));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isFrozen]);

  const data = [
    { name: 'Safe', value: 100 - riskValue },
    { name: 'Risk', value: riskValue },
  ];
  const COLORS = ['var(--success)', 'var(--secondary)'];

  return (
    <section className="py-20 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Interactive Wallet Experience</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the power of real-time security. Toggle the security lock to see how SecurePay protects your assets instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            whileHover={{ y: -5 }}
            className="relative"
          >
            <Card className={`p-8 border-border transition-all duration-500 rounded-3xl ${isFrozen ? 'bg-destructive/5' : 'bg-card'}`}>
              <div className="flex justify-between items-center mb-10">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-success/5 text-success border-success/10 gap-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> KYC Verified
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 gap-1 rounded-full">
                    <Lock className="w-3 h-3" /> AES-256
                  </Badge>
                </div>
                <Button 
                  variant={isFrozen ? "destructive" : "outline"} 
                  size="sm"
                  onClick={() => setIsFrozen(!isFrozen)}
                  className="gap-2 rounded-full"
                >
                  {isFrozen ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  {isFrozen ? "Unfreeze Account" : "Freeze Account"}
                </Button>
              </div>

              <div className="text-center mb-10">
                <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                <div className="text-5xl font-bold tracking-tighter">
                  ₹ {balance.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <Button disabled={isFrozen} className="bg-primary hover:bg-primary/90 gap-2 h-12">
                  <Send className="w-4 h-4" /> Send
                </Button>
                <Button disabled={isFrozen} variant="outline" className="gap-2 h-12 border-border">
                  <Download className="w-4 h-4" /> Receive
                </Button>
              </div>

              <AnimatePresence>
                {isFrozen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-20"
                  >
                    <div className="bg-destructive text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
                      <Lock className="w-5 h-5" /> ACCOUNT FROZEN
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <Card className="p-6 bg-card/30 border-border">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Risk Score: {riskValue}/100</h4>
                  <p className="text-sm text-muted-foreground">
                    Your account is currently in the <span className="text-success font-bold">Safe Zone</span>. No suspicious activity detected in the last 24 hours.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Active Sessions</p>
                <p className="text-2xl font-bold">02</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Security Score</p>
                <p className="text-2xl font-bold text-success">98%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
