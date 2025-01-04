import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2Icon } from "lucide-react";

const MonthlyEarningsChart = () => {
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMonthlyEarnings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/get-monthly-earnings");
      if (response.status === 200) {
        const sortedData = response.data.data.sort(
          (a, b) => new Date(a.month) - new Date(b.month)
        );
        setMonthlyEarnings(sortedData);
      } else {
        console.error("Failed to fetch monthly earnings.");
      }
    } catch (error) {
      console.error("Error fetching monthly earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyEarnings();
  }, []);

  return (
    <div className="mt-3" style={{ width: "100%", height: 400 }}>
      <h2 className="p-5 font-bold text-3xl text-primary">Monthly Earnings</h2>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2Icon className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer>
          <LineChart data={monthlyEarnings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlyEarningsChart;
