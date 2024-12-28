import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React from "react";

function InfoCard({ header, amount, footer, sign }) {
  return (
    <div>
      <Card className="flex flex-col m-1 shadow-sm hover:shadow-lg">
        <CardHeader className="font-bold text-primary text-2xl">
          {header}
        </CardHeader>
        <CardContent className="text-2xl">
          {sign}
          {amount}
        </CardContent>
      </Card>
    </div>
  );
}

export default InfoCard;
