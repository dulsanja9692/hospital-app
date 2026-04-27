"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Hospital,
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useInitAuth, useAuth, canAccessPermissions } from "@/hooks/useAuth";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Role } from "@/types";


interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: Role[];
  children?: { label: string; href: string; roles?: Role[] }[];
}

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Patients",
    href: "/patients",
    icon: <UserCircle className="w-4 h-4" />,
  },
  {
    label: "Doctors",
    href: "/doctors",
    icon: <Users className="w-4 h-4" />,
    roles: ["Super Admin", "Hospital Admin", "Receptionist", "Manager"],
  },
  {
    label: "Sessions",
    href: "/sessions",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    label: "Permissions",
    href: "/permissions",
    icon: <ShieldCheck className="w-4 h-4" />,
    roles: ["Super Admin", "Hospital Admin", "Receptionist", "Manager"],
    children: [
      {
        label: "Hospitals",
        href: "/permissions/hospitals",
        roles: ["Super Admin"],
      },
      {
        label: "Branches",
        href: "/permissions/branches",
        roles: ["Super Admin", "Hospital Admin", "Manager"],
      },
      {
        label: "Users & Roles",
        href: "/permissions/users",
        roles: ["Super Admin", "Hospital Admin", "Receptionist", "Manager"],
      },
    ],
  },
];

function NavLink({
  item,
  userRole,
  pathname,
  onClose,
}: {
  item: NavItem;
  userRole: Role;
  pathname: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(
    !!item.children?.some((c) => pathname.startsWith(c.href))
  );

  if (item.roles && !item.roles.includes(userRole)) return null;

  const isActive = item.children
    ? item.children.some((c) => pathname.startsWith(c.href))
    : pathname === item.href;

  const visibleChildren = item.children?.filter(
    (c) => !c.roles || c.roles.includes(userRole)
  );

  if (item.children && visibleChildren?.length === 0) return null;

  return (
    <div>
      {item.children ? (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span className={isActive ? "text-blue-600" : "text-gray-400"}>
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 text-gray-400 transition-transform",
                open && "rotate-90"
              )}
            />
          </button>
          {open && (
            <div className="ml-7 mt-0.5 space-y-0.5">
              {visibleChildren?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  className={cn(
                    "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                    pathname === child.href
                      ? "text-blue-600 font-medium bg-blue-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.href}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <span className={isActive ? "text-blue-600" : "text-gray-400"}>
            {item.icon}
          </span>
          {item.label}
        </Link>
      )}
    </div>
  );
}

function Sidebar({
  userRole,
  userName,
  onClose,
}: {
  userRole: Role;
  userName: string;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await api.post("auth/logout");
    } catch {
      // ignore
    }
    logout();
    router.replace("/login");
    toast.success("Signed out successfully");
  }

  const roleColors: Record<Role, string> = {
    "Super Admin":    "bg-purple-100 text-purple-700",
    "Hospital Admin": "bg-blue-100 text-blue-700",
    "Receptionist":   "bg-green-100 text-green-700",
    "Doctor":         "bg-teal-100 text-teal-700",
    "Accountant":     "bg-orange-100 text-orange-700",
  };

  return (
    <aside className="h-full flex flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-xl p-2">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">MediCore HMS</div>
            <div className="text-gray-400 text-xs">Management System</div>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <div className="px-3 pb-2 pt-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overview</p>
        </div>
        <NavLink item={NAV[0]} userRole={userRole} pathname={pathname} onClose={onClose} />

        <div className="px-3 py-2 mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Core Operations</p>
        </div>
        {NAV.slice(1, 5).map((item) => (
          <NavLink key={item.href} item={item} userRole={userRole} pathname={pathname} onClose={onClose} />
        ))}

        <div className="px-3 py-2 mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Analytics</p>
        </div>
        <NavLink item={NAV[5]} userRole={userRole} pathname={pathname} onClose={onClose} />

        <div className="px-3 py-2 mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
        </div>
        <NavLink item={NAV[6]} userRole={userRole} pathname={pathname} onClose={onClose} />
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
            <span className={cn("text-xs px-1.5 py-0.5 rounded-md font-medium", roleColors[userRole])}>
              {userRole}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500
                     hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useInitAuth();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[240px] flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <Sidebar userRole={user.role} userName={user.name} onClose={() => {}} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-[240px] animate-slide-in">
            <Sidebar
              userRole={user.role}
              userName={user.name}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-[240px] min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Hospital className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">MediCore HMS</span>
          </div>
        </header>

        <div className="flex-1 p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}