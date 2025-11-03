import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const MenuUpdates = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [editingItem, setEditingItem] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Fetch menu items
  const fetchMenu = async () => {
    try {
      const res = await API.get(`/menu`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Error fetching menu:", err);
      alert("Failed to fetch menu items");
    }
  };

  // ✅ Add new item
  const handleAdd = async () => {
    if (!newItem.name || !newItem.price) return alert("Fill all fields");
    try {
      await API.post(`/menu/add`, newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Item added!");
      setNewItem({ name: "", price: "" });
      fetchMenu();
    } catch (err) {
      console.error("Error adding item:", err);
      alert(err.response?.data?.message || "Failed to add item");
    }
  };

  // ✅ Toggle availability
  const handleToggle = async (id, available) => {
    try {
      await API.put(
        `/menu/${id}`,
        { available: !available },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchMenu();
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update availability");
    }
  };

  // ✅ Edit price
  const handleEdit = async (id) => {
    if (!editingItem || !editingItem.price)
      return alert("Please enter a valid price");
    try {
      await API.put(
        `/menu/${id}`,
        { price: editingItem.price },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Price updated!");
      setEditingItem(null);
      fetchMenu();
    } catch (err) {
      console.error("Error updating price:", err);
      alert("Failed to update item");
    }
  };

  // ✅ Delete item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await API.delete(`/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Item deleted!");
      fetchMenu();
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(err.response?.data?.message || "Failed to delete item");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Top Header with Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🍽️ Manage Menu</h1>
        <button
          onClick={() => navigate("/orders")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Orders
        </button>
      </div>

      {/* Add new item */}
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Add New Item</h2>
        <input
          type="text"
          placeholder="Item name"
          className="border px-3 py-2 mr-2 rounded"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          className="border px-3 py-2 mr-2 rounded"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>

      {/* Menu list */}
      <h2 className="font-semibold mb-3">Current Menu</h2>
      <ul>
        {items.map((item) => (
          <li
            key={item._id}
            className="flex justify-between items-center border-b py-2"
          >
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-gray-600">₹{item.price}</span>
            </div>

            <div className="flex items-center gap-2">
              {editingItem?._id === item._id ? (
                <>
                  <input
                    type="number"
                    className="border px-2 py-1 rounded w-20"
                    placeholder="New price"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: e.target.value,
                      })
                    }
                  />
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(item._id)}
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => setEditingItem({ _id: item._id, price: "" })}
                >
                  Edit
                </button>
              )}

              <button
                className={`px-3 py-1 rounded text-white ${
                  item.available ? "bg-green-600" : "bg-gray-500"
                }`}
                onClick={() => handleToggle(item._id, item.available)}
              >
                {item.available ? "Available" : "Hidden"}
              </button>

              <button
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuUpdates;
