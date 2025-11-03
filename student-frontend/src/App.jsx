import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import MyOrders from "./pages/MyOrders";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";
import AdminLogin from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<MyOrders />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
