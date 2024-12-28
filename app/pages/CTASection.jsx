'use client'

import { Button } from "@/components/ui/button";
import AOS from "aos";
import "aos/dist/aos.css";
import React  from "react";

export function CTASection() {
  React.useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section className="py-16"  data-aos="fade-up">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Create Amazing Videos?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are already using our platform to bring their ideas to life.
        </p>
        <Button 
          size="lg" 
          className="text-transparent animated-gradient  text-white font-semibold"
        >
          Start Creating Now
        </Button>
      </div>
    </section>
  );
}