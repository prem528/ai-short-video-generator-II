"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AOS from "aos";
import "aos/dist/aos.css";
import React from "react";

const tiers = [
  {
    name: "Starter",
    price: "₹ 29",
    description: "Perfect for individuals and small projects",
    features: [
      "5 AI-generated videos per month",
      "720p resolution",
      "Up to 1-minute video length",
      "Basic text-to-speech voices",
      "10 stock music tracks",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "₹ 99",
    description: "Ideal for content creators and small businesses",
    features: [
      "30 AI-generated videos per month",
      "1080p resolution",
      "Up to 5-minute video length",
      "Advanced text-to-speech voices",
      "50 stock music tracks",
      "Custom branding",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large-scale video production",
    features: [
      "Unlimited AI-generated videos",
      "4K resolution",
      "Unlimited video length",
      "Premium text-to-speech voices",
      "Unlimited stock music library",
      "Advanced editing tools",
      "API access",
      "Dedicated account manager",
      "24/7 phone and email support",
    ],
  },
];

export default function PricingSection() {
  React.useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section id="pricing" className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4">
          Choose Your AI Video Plan
        </h2>
        <p className="text-lg sm:text-xl text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
          Unleash your creativity with our AI-powered video generation
        </p>
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
          data-aos="zoom-out-up"
        >
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className="flex flex-col backdrop-blur-sm hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">
                  {tier.price}
                  <span className="text-base sm:text-lg font-normal">
                    {tier.name !== "Enterprise" ? "/month" : ""}
                  </span>
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button className="w-full bg-primary hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3">
                  {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}