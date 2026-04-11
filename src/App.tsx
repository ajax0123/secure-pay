/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WalletPreview } from './components/WalletPreview';
import { SecurityLayers } from './components/SecurityLayers';
import { TransactionFlow } from './components/TransactionFlow';
import { FeaturesGrid } from './components/FeaturesGrid';
import { TrustSection } from './components/TrustSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <main>
        <Hero />
        <WalletPreview />
        <SecurityLayers />
        <TransactionFlow />
        <FeaturesGrid />
        <TrustSection />
        <FinalCTA />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
