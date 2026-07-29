import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Coin from "@/public/coin.png";
import Image from "next/image";

export function CoinCard({ title, price, description, onClick }) {
  return (
    <Card className="p-6 border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md flex flex-col items-center justify-between">
      <div className="flex flex-col items-center space-y-4 w-full">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <div className="h-14 w-14 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center">
          <Image src={Coin} alt="coin" height={32} width={32} />
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-black text-foreground">&#8377;{price}</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[160px] leading-relaxed">{description}</p>
        </div>
      </div>
      <Button className="w-full mt-6 bg-brand text-brand-foreground hover:bg-brand/90 font-semibold h-10" onClick={onClick}>
        Buy Now
      </Button>
    </Card>
  );
}
