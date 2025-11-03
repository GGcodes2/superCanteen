import { useEffect, useState } from "react";
import API from "../api/axios";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta?.env?.VITE_SOCKET_URL || "https://supercanteen-backend.onrender.com";
const socket = io(SOCKET_URL);

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    return () => {
      socket.off("orderUpdated");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o._id} className="border p-3 rounded">
            <div className="font-medium">Order #{o._id}</div>
            <div>Status: {o.status}</div>
            <div>Total: ₹{o.totalAmount}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyOrders;
