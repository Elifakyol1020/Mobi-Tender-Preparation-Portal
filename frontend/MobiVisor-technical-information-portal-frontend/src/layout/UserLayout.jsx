import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: "1" }}>
        <Outlet />
      </main>
    </div>
  );
}