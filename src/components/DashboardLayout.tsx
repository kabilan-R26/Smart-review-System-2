import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  Presentation, 
  MessageSquare, 
  BarChart3, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Bell,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AppBrand } from "@/components/AppBrand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  ],
};

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  let greeting = "Good Evening";
  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";

  return (
    <div className="flex flex-col">
      <span className="font-semibold text-gray-900 dark:text-white hidden md:inline-block">
        {greeting},
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) return null;

  const items = NAV_ITEMS[user.role as keyof typeof NAV_ITEMS];
  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-72";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F172A] fixed h-full z-40 transition-all duration-300 ${sidebarWidth}`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-white/10 h-[88px]">
          <AppBrand role={user.role} compact={sidebarCollapsed} className="min-w-0" />
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group overflow-hidden whitespace-nowrap ${
                  isActive 
                    ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-md" 
                    : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex flex-col gap-2">
           <Button
             variant="ghost"
             onClick={toggleTheme}
             title="Toggle Theme"
             className={`justify-start gap-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'px-0 justify-center' : ''}`}
           >
             {theme === "dark" ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
             {!sidebarCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
           </Button>
           
           <Button
             variant="ghost"
             onClick={logout}
             title="Sign Out"
             className={`justify-start gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'px-0 justify-center' : ''}`}
           >
             <LogOut className="h-5 w-5 flex-shrink-0" />
             {!sidebarCollapsed && <span>Sign Out</span>}
           </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        
        {/* Top Navbar */}
        <header className="h-[88px] sticky top-0 z-30 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="hidden lg:flex text-gray-600 dark:text-gray-300" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                 <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="lg:hidden text-gray-600 dark:text-gray-300" onClick={() => setMobileOpen(true)}>
                 <Menu className="h-6 w-6" />
              </Button>
              
              <div className="hidden sm:flex items-center gap-2 text-gray-800 dark:text-gray-200">
                 <LiveClock />
                 <span className="font-semibold ml-1">{user.name.split(" ")[0]}! 👋</span>
              </div>
           </div>

           <div className="flex items-center gap-3 sm:gap-6">
              <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0F172A]"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-2 pr-4 py-2 h-auto gap-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium text-sm hidden sm:block">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#0F172A] border-gray-200 dark:border-white/10 rounded-xl shadow-xl">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10"/>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 cursor-pointer">Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 cursor-pointer">Notifications</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10"/>
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-[#F8FAFC] dark:bg-[#020617] p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#0F172A] z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-white/10 h-[88px]">
                <AppBrand role={user.role} />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6 text-gray-500" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                          : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
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
