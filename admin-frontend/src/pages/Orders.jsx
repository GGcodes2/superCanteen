import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Add this import
import API from "../api/axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate(); // 👈 React Router navigation hook

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/all");
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();

    socket.on("orderCreated", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    return () => socket.disconnect();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "preparing":
        return "bg-blue-100 text-blue-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-200 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* ✅ Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          📦 Orders Dashboard
        </h2>

        {/* 🧭 Button to go to Menu Updates */}
        <button
          onClick={() => navigate("/menu-updates")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          🍽️ Go to Menu Updates
        </button>
      </div>

      {/* ✅ Orders Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((o) => (
                <tr
                  key={o._id}
                  className="border-b hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-3 text-gray-700 font-medium">{o._id}</td>
                  <td className="p-3 text-gray-600">{o.user?.email || "N/A"}</td>
                  <td className="p-3 text-gray-600">
                    {o.items.map((i, idx) => (
                      <div key={idx}>
                        {i.name} × {i.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-gray-800">
                    ₹{o.totalAmount}
                  </td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-500 italic"
                >
                  No orders yet 😴
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
