import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import menuRoutes from "./routes/menuRoutes.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orderRoutes.js";
import MenuItem from "./models/MenuItem.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ✅ Setup Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

app.use(cors({
  origin: ["http://localhost:5174", "https://your-frontend-domain.vercel.app", "https://super-canteen-beta.vercel.app/"],
  credentials: true,
}));


// 🧩 Middlewares
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 🚀 Routes
app.use("/api/menu", menuRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("Canteen Management System API is running...");
});

// 🧠 Socket Events
io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// 🛠️ Start server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
