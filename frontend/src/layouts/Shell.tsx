import { Outlet } from "react-router-dom";

export default function Shell() {
  return (
    <div className="shell" id="shell">
      <header className="masthead">{/* 原型的 masthead 搬进来 */}</header>
      <main>
        <Outlet />   {/* 当前页面 */}
      </main>
    </div>
  );
}
