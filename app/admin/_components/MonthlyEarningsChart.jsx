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

const MonthlyEarningsChart = () => {
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);

  const fetchMonthlyEarnings = async () => {
    try {
      const response = await axios.get("/api/get-monthly-earnings");
      if (response.status === 200) {
        setMonthlyEarnings(response.data.data);
      } else {
        console.error("Failed to fetch monthly earnings.");
      }
    } catch (error) {
      console.error("Error fetching monthly earnings:", error);
    }
  };

  useEffect(() => {
    fetchMonthlyEarnings();
  }, []);

  return (
    <div className="mt-3" style={{ width: "100%", height: 400 }}>
      <h2 className="p-5 font-bold text-3xl text-primary">Monthly Earnings</h2>
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
    </div>
  );
};

export default MonthlyEarningsChart;
