import { HeroSection } from "./pages/HeroSection";
import { FeaturesSection } from "./pages/FeaturesSection";
import { CTASection } from "./pages/CTASection";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import HowItWork from "./pages/HowItWork";
import AnimatedDemoSection from "./pages/AnimatedDemoSection";
import PricingSection from "./pages/PricingSection";
import BackgroundLayout from "./pages/BackgroundLayout";
 

export default function Home() {
  return (
    <BackgroundLayout>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <AnimatedDemoSection />
      <HowItWork />
      <PricingSection />
      <Footer />
    </BackgroundLayout>
  );
}
