import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Coin from "@/public/coin.png";
import Image from "next/image";

export function CoinCard({ title, price, description, onClick }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        <Image src={Coin} alt="coin" height={30} width={30} />
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold">&#8377; {price}</h3>
          <p className="text-muted-foreground">{description}</p>
          <Button className="m-5" onClick={onClick}>
            Buy
          </Button>
        </div>
      </div>
    </Card>
  );
}
