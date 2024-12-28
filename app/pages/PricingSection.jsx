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
    <section id="pricing" className="py-16 px-20 bg-gray-200">
      <div className="container mx-auto px-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Choose Your AI Video Plan
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          Unleash your creativity with our AI-powered video generation
        </p>
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          data-aos="zoom-out-up"
        >
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className="flex flex-col bg-gray-800 text-white hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="text-center ">
                <CardTitle className="text-2xl font-bold">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-lg text-white">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-white">
                <p className="text-4xl font-bold text-center mb-6">
                  {tier.price}
                  <span className="text-lg font-normal text-gray-600">
                    {tier.name !== "Enterprise" ? "/month" : ""}
                  </span>
                </p>
                <ul className="space-y-3 text-white">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-blue-700 text-white">
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
