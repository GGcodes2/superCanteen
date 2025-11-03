import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import MenuUpdates from "./pages/MenuUpdates";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu-updates" element={<MenuUpdates />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
