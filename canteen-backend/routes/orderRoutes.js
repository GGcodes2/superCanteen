import express from "express";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { io } from "../server.js";

const router = express.Router();

// 🧾 Create order (Student)
router.post("/", protect, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findOne({ name: item.name });
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ message: `Item ${item.name} not available` });
      }

      validatedItems.push({
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity || 1,
      });

      totalAmount += menuItem.price * (item.quantity || 1);
    }

    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      totalAmount,
    });

    // 🔔 Emit new order event to all connected clients
    io.emit("orderCreated", order);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// 👤 Get student's own orders
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ message: "Your orders fetched successfully", orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

// 🧾 Admin: Get all orders
router.get("/all", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ message: "All orders fetched successfully", orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ✅ Update order status (Admin only)
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // 🔔 Emit status update to all connected clients
    io.emit("orderUpdated", order);

    res.json({ message: "Order status updated successfully", order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancel if pending
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    // Ensure the logged-in student owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this order" });
    }

    // Cancel and save
    order.status = "cancelled";
    await order.save();

    // 🔔 Emit order update to all clients
    io.emit("orderUpdated", order);

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

export default router;
