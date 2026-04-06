import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Presentation,
  Settings2,
  Sun,
  Trophy,
  UserCircle2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/AppBrand";
import { UserAvatar } from "@/components/UserAvatar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useClickOutside } from "@/hooks/use-click-outside";

const NAV_ITEMS = {
  student: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/subjects", icon: BookOpen, label: "My Subjects" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
  ],
  faculty: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/subjects", icon: BookOpen, label: "Subjects" },
    { to: "/reviews", icon: Presentation, label: "Reviews" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/tasks", icon: CalendarDays, label: "Tasks" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ],
} as const;

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  let greeting = "Good evening";
  if (hours < 12) greeting = "Good morning";
  else if (hours < 18) greeting = "Good afternoon";

  return (
    <div className="flex flex-col">
      <span className="hidden font-semibold text-slate-900 dark:text-white md:inline-block">
        {greeting}
      </span>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}

function DropdownPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-900 ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardLayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setProfileOpen(false), isProfileOpen);

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const items = NAV_ITEMS[user.role];
  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-72";

  const handleProfileAction = (action: "profile" | "settings" | "logout") => {
    setProfileOpen(false);

    if (action === "profile") {
      navigate("/profile");
      return;
    }

    if (action === "settings") {
      toggleTheme();
      return;
    }

    logout();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <aside
        className={`fixed z-40 hidden h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:flex ${sidebarWidth}`}
      >
        <div className="flex h-[88px] items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <AppBrand role={user.role} compact={sidebarCollapsed} className="min-w-0" />
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-6">
          {items.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === "/dashboard" && location.pathname.startsWith("/subject/"));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={`group flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${isActive ? "" : "transition-transform group-hover:scale-110"}`}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={`justify-start gap-3 overflow-hidden rounded-2xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${sidebarCollapsed ? "justify-center px-0" : ""}`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
            )}
            {!sidebarCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={logout}
            className={`justify-start gap-3 overflow-hidden rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 ${sidebarCollapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <header className="sticky top-0 z-30 flex h-[88px] items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden text-slate-700 dark:text-slate-300 lg:flex"
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-700 dark:text-slate-300 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="hidden items-center gap-3 text-slate-900 dark:text-slate-100 sm:flex">
              <LiveClock />
              <span className="font-semibold">Hello, {user.name.split(" ")[0]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationDropdown />

            <div className="relative" ref={profileRef}>
              <Button
                variant="ghost"
                aria-expanded={isProfileOpen}
                className={`h-auto gap-3 rounded-full border border-slate-200 px-2.5 py-2 transition hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:hover:bg-slate-800 ${isProfileOpen ? "bg-slate-100 dark:bg-slate-800" : ""}`}
                onClick={() => {
                  setProfileOpen((value) => !value);
                }}
              >
                <UserAvatar user={user} className="h-10 w-10" fallbackClassName="text-xs" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{user.department}</p>
                </div>
              </Button>

              <AnimatePresence>
                {isProfileOpen && (
                  <DropdownPanel className="w-72">
                    <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                      <UserAvatar user={user} className="h-12 w-12" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleProfileAction("profile")}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 active:scale-[0.99] dark:text-slate-200 dark:hover:bg-slate-800/70"
                      >
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProfileAction("settings")}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 active:scale-[0.99] dark:text-slate-200 dark:hover:bg-slate-800/70"
                      >
                        <Settings2 className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProfileAction("logout")}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 active:scale-[0.99] dark:hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </DropdownPanel>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl dark:bg-slate-900 lg:hidden"
            >
              <div className="flex h-[88px] items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
                <AppBrand role={user.role} />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </Button>
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                {items.map((item) => {
                  const isActive =
                    location.pathname === item.to ||
                    (item.to === "/dashboard" && location.pathname.startsWith("/subject/"));

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
