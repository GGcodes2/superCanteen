import { useEffect, useState } from "react";
import API from "../api/axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my");
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  // Cancel an order
  const cancelOrder = async (id) => {
    try {
      await API.put(`/orders/${id}/cancel`);
      fetchOrders();
    } catch (err) {
      console.error("Cancel failed:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 🔔 Listen for live order updates
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    socket.on("orderCreated", (newOrder) => {
      // Optional: if you want to show newly placed orders instantly
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">My Orders</h2>

      {orders.length === 0 && (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o._id}
            className={`p-3 rounded border ${
              o.status === "cancelled"
                ? "bg-red-50 border-red-300 text-red-700"
                : o.status === "completed"
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-gray-50 border-gray-300"
            }`}
          >
            <p>
              <strong>Order ID:</strong> {o._id}
            </p>
            <p>
              <strong>Status:</strong> {o.status}
            </p>
            <p>
              <strong>Total:</strong> ₹{o.totalAmount}
            </p>

            {o.status === "pending" && (
              <button
                onClick={() => cancelOrder(o._id)}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel Order
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
