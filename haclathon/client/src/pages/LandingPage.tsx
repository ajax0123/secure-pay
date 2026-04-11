import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { WalletPreview } from '@/components/WalletPreview';
import { SecurityLayers } from '@/components/SecurityLayers';
import { TransactionFlow } from '@/components/TransactionFlow';
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { TrustSection } from '@/components/TrustSection';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

export const LandingPage = () => {
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
    </div>
  );
};
