import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Create Amazing Videos?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are already using our platform to bring their ideas to life.
        </p>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
        >
          Start Creating Now
        </Button>
      </div>
    </section>
  );
}