import { HeroSection } from "./pages/HeroSection";
import { FeaturesSection } from "./pages/FeaturesSection";
import { CTASection } from "./pages/CTASection";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import HowItWork from "./pages/HowItWork";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div>
      <Header/>
      </div>
      <HeroSection/>
      <FeaturesSection/>
      <CTASection/>
      <HowItWork/>
      <Footer/>
    </div>
  );
}
