import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://supercanteen-backend.onrender.com/api/auth/login",
        { email, password }
      );

      const { token, user } = res.data;

      // Store user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "student") {
        navigate("/menu");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-white rounded-2xl shadow-lg w-full max-w-md border border-gray-100 flex flex-col gap-4"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800">
          Login
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all"
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
        >
          Login
        </button>

        <p className="text-center text-gray-600 mt-2">
          New user?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
