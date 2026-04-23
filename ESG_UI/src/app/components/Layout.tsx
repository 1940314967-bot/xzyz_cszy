import { Outlet, NavLink } from "react-router";
import { LayoutDashboard, TrendingUp, Leaf, User } from "lucide-react";

export function Layout() {
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/trade", label: "Trade", icon: TrendingUp },
    { path: "/projects", label: "Projects", icon: Leaf },
    { path: "/account", label: "My Account", icon: User },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h1 className="text-[20px] font-semibold text-[#1F2937]">CarbonX</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#3A7D44] text-white"
                    : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1F2937]"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
