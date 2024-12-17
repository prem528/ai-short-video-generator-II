import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export function FeatureCard({ icon, title, description }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-primary">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}