import { useEffect, useState } from "react";
import API from "../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/admin/orders");
        setOrders(data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Orders</h1>
      {/* render orders */}
    </div>
  );
};

export default Orders;
