import express from "express";
import MenuItem from "../models/MenuItem.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ✅ Add new menu item (Admin only)
router.post("/add", protect, admin, async (req, res) => {
  try {
    const { name, price, available } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const existingItem = await MenuItem.findOne({ name });
    if (existingItem) {
      return res.status(400).json({ message: "Item already exists" });
    }

    const item = await MenuItem.create({
      name,
      price,
      available: available ?? true,
    });

    res.status(201).json({ message: "Item added successfully", item });
  } catch (err) {
    console.error("Error adding menu item:", err);
    res.status(500).json({ message: "Server error while adding menu item" });
  }
});

// ✅ Get all available menu items (Public)
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find({ available: true }).sort({ name: 1 });
    res.json({ message: "Menu fetched successfully", items });
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
});

// 🛠️ Update a menu item (Admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.name = name || item.name;
    item.price = price || item.price;
    item.category = category || item.category;

    await item.save();

    res.json({ message: "Menu item updated successfully", item });
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(500).json({ message: "Failed to update menu item" });
  }
});

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await item.deleteOne();

    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
});

export default router;
