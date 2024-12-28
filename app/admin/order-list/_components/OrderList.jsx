"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchOrders } from "./SearchOrders";

export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?search=${searchTerm}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const refreshOrders = () => {
    setSearchTerm(""); // Clear the search term
    setOrders([]); // Reset orders to ensure the UI re-renders
    fetchOrders(); // Fetch all orders
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-4">
      <SearchOrders
        onSearch={setSearchTerm}
        onReload={refreshOrders} // Pass the refresh function
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.amount / 100} INR</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  {new Date(order.created_at * 1000).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
