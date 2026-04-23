import Link from "next/link";

type SidebarProps = {
  currentPage: "dashboard" | "trade" | "projects" | "account";
};

export default function Sidebar({ currentPage }: SidebarProps) {
  const navItems = [
    { label: "Dashboard", href: "/", key: "dashboard" },
    { label: "Trade", href: "/trade", key: "trade" },
    { label: "Projects", href: "/projects", key: "projects" },
    { label: "My Account", href: "/account", key: "account" },
  ] as const;

  return (
    <aside className="w-64 border-r bg-white p-6">
      <h1 className="mb-8 text-3xl font-bold text-green-700">CarbonX</h1>

      <nav className="space-y-3">
        {navItems.map((item) => {
          const isActive = item.key === currentPage;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`block rounded-xl px-4 py-3 font-medium transition ${
                isActive
                  ? "bg-green-700 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}