import { OrderList } from "./_components/OrderList";

export default function Page() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Orders</h1>
      <OrderList />
    </div>
  );
}
