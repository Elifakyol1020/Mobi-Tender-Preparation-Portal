import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import Search from "./page/Search";
import Admin from "./page/Admin";
import PrivateRoute from "./PrivateRoute";
import AdminLayout from "./layout/AdminLayout";
import UserLayout from "./layout/UserLayout";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Admin />} />
        </Route>
        <Route
          path="/user"
          element={
            <PrivateRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
              <UserLayout />
            </PrivateRoute>
          }
        >
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
