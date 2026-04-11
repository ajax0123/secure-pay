import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Key, Cpu, Shield, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, label: "USER ACTION", icon: User },
  { id: 2, label: "ENTER PIN", icon: Key },
  { id: 3, label: "AI SCAN", icon: Cpu },
  { id: 4, label: "RISK CHECK", icon: Shield },
  { id: 5, label: "FINAL RESULT", icon: CheckCircle2 },
];

export const TransactionFlow = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % (steps.length + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-[#E8F5EE] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-[#004D40]"
          >
            Seamless & Secure Flow
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#00695C] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
          >
            Watch how our AI engine analyzes every transaction in milliseconds to ensure your funds are always safe.
          </motion.p>
        </div>

        <div className="relative mt-32">
          {/* Connecting Line Base */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#004D40]/20 -translate-y-1/2 hidden md:block" />
          
          {/* Progress Line */}
          <motion.div 
            className="absolute top-1/2 left-0 h-1 bg-[#004D40] -translate-y-1/2 hidden md:block origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: activeStep / steps.length }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ width: '100%' }}
          />

          <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-4">
            {steps.map((step, index) => {
              const isActive = index < activeStep;
              const isCurrent = index === activeStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.2 : 1,
                      backgroundColor: isActive || isCurrent ? "#004D40" : "#FFFFFF",
                      borderColor: isActive || isCurrent ? "#004D40" : "#004D40",
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-xl relative`}
                  >
                    <step.icon className={`w-10 h-10 ${isActive || isCurrent ? 'text-white' : 'text-[#004D40]'}`} />
                    
                    {/* Pulsing effect for current step */}
                    {isCurrent && (
                      <motion.div
                        layoutId="pulse"
                        className="absolute inset-0 rounded-full bg-[#004D40]/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  
                  <div className="mt-6 text-center">
                    <motion.span 
                      animate={{ 
                        color: isActive || isCurrent ? "#004D40" : "#004D40/60",
                        fontWeight: isActive || isCurrent ? 800 : 600
                      }}
                      className="text-sm md:text-base tracking-widest uppercase block"
                    >
                      {step.label}
                    </motion.span>
                    
                    {/* Processing text for the last step */}
                    {index === steps.length - 1 && (
                      <AnimatePresence>
                        {activeStep >= steps.length - 1 && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-[10px] text-[#00695C] font-mono mt-2 block tracking-[0.2em]"
                          >
                            {activeStep === steps.length - 1 ? "PROCESSING..." : "VERIFIED"}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 p-10 rounded-[2rem] bg-white/50 backdrop-blur-sm border border-[#004D40]/10 text-center shadow-sm"
        >
          <div className="inline-flex items-center gap-6 text-sm md:text-base font-mono text-[#004D40] font-bold">
            <span className="flex h-3 w-3 rounded-full bg-[#004D40] animate-ping" />
            SYSTEM STATUS: SECURE • LATENCY: 142ms • AI CONFIDENCE: 99.9%
          </div>
        </motion.div>
      </div>
    </section>
  );
};
