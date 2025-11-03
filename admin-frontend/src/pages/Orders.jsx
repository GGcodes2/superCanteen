import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/all");
      setOrders(data.orders || []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("❌ Error updating status:", err.response?.data || err.message);
      alert("Failed to update order status.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📦 Orders Dashboard</h1>
        <button
          onClick={() => navigate("/menu-updates")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition duration-200"
        >
          🍽 Go to Menu Updates
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 text-lg italic">
          No orders found 😴
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-100">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Items</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-4 font-semibold text-gray-800">{order._id}</td>
                  <td className="p-4">{order.user?.email || "N/A"}</td>
                  <td className="p-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-gray-600">
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-semibold">₹{order.totalAmount}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
