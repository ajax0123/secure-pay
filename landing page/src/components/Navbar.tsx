import React from 'react';
import { motion } from 'motion/react';
import { Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">SecurePay</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Security</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => window.location.href = 'http://localhost:5173/login'}>Login</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full px-6" onClick={() => window.location.href = 'http://localhost:5173/signup'}>Get Started</Button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border px-4 pt-2 pb-6 space-y-1"
        >
          <a href="#features" className="block px-3 py-2 text-base font-medium text-muted-foreground">Features</a>
          <a href="#security" className="block px-3 py-2 text-base font-medium text-muted-foreground">Security</a>
          <div className="pt-4 flex flex-col gap-2">
            <Button variant="ghost" className="w-full justify-start rounded-full" onClick={() => window.location.href = 'http://localhost:5173/login'}>Login</Button>
            <Button className="w-full bg-primary rounded-full" onClick={() => window.location.href = 'http://localhost:5173/signup'}>Get Started</Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};
