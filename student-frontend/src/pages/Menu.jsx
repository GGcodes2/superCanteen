import { useEffect, useState } from "react";
import {AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { io } from "socket.io-client";

const socket = io("https://supercanteen-backend.onrender.com");

const Menu = () => {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/menu")
      .then((res) => setMenu(res.data.items))
      .catch((err) => console.error("Failed to fetch menu:", err));
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first!");
      if (cart.length === 0) return alert("Cart is empty!");

      setLoading(true);
      const orderData = {
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      };

      await API.post("/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Order placed successfully!");
      setCart([]);
      fetchOrders();
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("❌ Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await API.get("/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const cancelOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first!");
      const res = await API.put(`/orders/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert("🛑 Order cancelled successfully");
        fetchOrders();
      } else {
        alert(res.data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("❌ Could not cancel order");
    }
  };

  useEffect(() => {
    fetchOrders();
    socket.on("order:statusUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });
    return () => socket.disconnect();
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6"
    >
      <motion.div
        layout
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-blue-700"
          >
            🍔 Canteen Menu
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOrders((prev) => !prev)}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
          >
            {showOrders ? "⬅ Back to Menu" : "📦 View My Orders"}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {!showOrders ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Menu Section */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {menu.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 mt-1">₹{item.price}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(item)}
                      className="mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-all"
                    >
                      Add to Cart
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Cart Section */}
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-10 border-t border-gray-200 pt-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🛒 Your Cart
                    </h3>

                    <div className="space-y-3">
                      {cart.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                        >
                          <span className="font-medium text-gray-700">
                            {item.name} × {item.quantity}
                          </span>
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(item._id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                            >
                              −
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addToCart(item)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
                            >
                              +
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-5 flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-800">
                        Total: ₹{total}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={placeOrder}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-all disabled:opacity-70"
                      >
                        {loading ? "Placing..." : "Place Order"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-blue-700 mb-4">
                📦 My Orders
              </h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <motion.div layout className="space-y-4">
                  {orders.map((o, index) => (
                    <motion.div
                      key={o._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm"
                    >
                      <p>
                        <b>Order ID:</b> {o._id}
                      </p>
                      <p>
                        <b>Status:</b>{" "}
                        <span
                          className={`font-semibold ${
                            o.status === "completed"
                              ? "text-green-600"
                              : o.status === "pending"
                              ? "text-orange-500"
                              : "text-gray-600"
                          }`}
                        >
                          {o.status}
                        </span>
                      </p>
                      <p>
                        <b>Total:</b> ₹{o.totalAmount}
                      </p>

                      {o.status === "pending" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => cancelOrder(o._id)}
                          className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Cancel Order
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Menu;
