import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Material UI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Shield";
import { MailOutlined } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

/* ============================================================
 * TYPES
 * ============================================================ */
interface AuthUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "trade" | "system" | "alert";
}

interface WatchlistCoin {
  name: string;
  symbol: string;
  price: string;
  change: string;
  up: boolean;
}

/* ============================================================
 * MOCK DATA
 * ============================================================ */
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Limit Order Executed",
    message:
      "Your buy order for 0.5 BTC at $42,100 has been filled successfully.",
    time: "2 mins ago",
    read: false,
    type: "trade",
  },
  {
    id: "2",
    title: "Price Alert: ETH",
    message: "Ethereum has crossed your target price of $2,300.00",
    time: "1 hour ago",
    read: false,
    type: "alert",
  },
  {
    id: "3",
    title: "Security Update",
    message: "A new login was detected from a Windows device in Kigali, RW.",
    time: "5 hours ago",
    read: true,
    type: "system",
  },
];

const INITIAL_WATCHLIST: WatchlistCoin[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: "$43,256",
    change: "+2.34%",
    up: true,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: "$2,284",
    change: "+1.87%",
    up: true,
  },
  { name: "XRP", symbol: "XRP", price: "$0.62", change: "-1.24%", up: false },
  {
    name: "Dogecoin",
    symbol: "DOGE",
    price: "$0.082",
    change: "+5.67%",
    up: true,
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    price: "$7.45",
    change: "+3.21%",
    up: true,
  },
];

const AVAILABLE_COINS = [
  "BTC",
  "ETH",
  "XRP",
  "DOGE",
  "DOT",
  "SOL",
  "ADA",
  "BNB",
  "MATIC",
  "LINK",
];

const ALL_TRANSACTIONS = [
  {
    type: "buy",
    title: "Buy BTC",
    date: "Today, 2:45 PM",
    amount: "+0.0234 BTC",
    positive: true,
  },
  {
    type: "sell",
    title: "Sell ETH",
    date: "Today, 11:20 AM",
    amount: "-0.805 ETH",
    positive: false,
  },
  {
    type: "transfer",
    title: "Transfer USDT",
    date: "Yesterday",
    amount: "500 USDT",
    positive: null,
  },
  {
    type: "buy",
    title: "Buy SOL",
    date: "Dec 28, 2025",
    amount: "+15.5 SOL",
    positive: true,
  },
  {
    type: "sell",
    title: "Sell ADA",
    date: "Dec 27, 2025",
    amount: "-1,200 ADA",
    positive: false,
  },
  {
    type: "buy",
    title: "Buy ETH",
    date: "Dec 26, 2025",
    amount: "+0.45 ETH",
    positive: true,
  },
];

/* ============================================================
 * REUSABLE MODAL
 * ============================================================ */
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-[#2C2C30] border border-[#3A3A40] rounded-2xl p-6 w-full max-w-md shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
 * DASHBOARD COMPONENT
 * ============================================================ */
export const Dashboard = () => {
  const navigate = useNavigate();

  // --- State ---
  const [user, setUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals & Interactive Data
  const [watchlist, setWatchlist] =
    useState<WatchlistCoin[]>(INITIAL_WATCHLIST);
  const [showAddWatchlist, setShowAddWatchlist] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [newCoinSymbol, setNewCoinSymbol] = useState("SOL");

  // Refs for click-outside detection
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv_auth_user");
      if (raw) setUser(JSON.parse(raw));
      else navigate("/");
    } catch {
      navigate("/");
    }
  }, [navigate]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setShowNotifications(false);
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      )
        setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleLogout = () => {
    localStorage.removeItem("cv_auth_user");
    navigate("/");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addToWatchlist = () => {
    if (!newCoinSymbol) return;
    if (watchlist.find((w) => w.symbol === newCoinSymbol)) {
      alert("Coin already in watchlist");
      return;
    }

    const newCoin: WatchlistCoin = {
      name: newCoinSymbol, // Simplified, in a real app you'd fetch the full name
      symbol: newCoinSymbol,
      price: "$" + (Math.random() * 1000).toFixed(2),
      change: "+" + (Math.random() * 10).toFixed(2) + "%",
      up: true,
    };
    setWatchlist([...watchlist, newCoin]);
    setShowAddWatchlist(false);
    setNewCoinSymbol("SOL");
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((c) => c.symbol !== symbol));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1C1C1E] text-gray-200 font-sans flex overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#232326] border-r border-[#3A3A40] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#3A3A40]">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8A87C] flex items-center justify-center">
              <span className="text-sm font-bold text-[#1c1c1e]">CV</span>
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              CryptoVault
            </span>
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div>
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main Menu
            </div>
            <nav className="space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E8A87C]/10 text-[#E8A87C] font-medium transition-colors"
              >
                <DashboardIcon fontSize="small" /> Dashboard
              </Link>
              <Link
                to="/markets"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#2C2C30] transition-colors"
              >
                <ShowChartIcon fontSize="small" /> Markets
              </Link>
              <Link
                to="/wallet"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#2C2C30] transition-colors"
              >
                <AccountBalanceWalletIcon fontSize="small" /> Wallet
              </Link>
            </nav>
          </div>
          <div>
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Account
            </div>
            <nav className="space-y-1">
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#2C2C30] transition-colors"
              >
                <SettingsIcon fontSize="small" /> Settings
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-[#3A3A40]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogoutIcon fontSize="small" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* --- TOP HEADER --- */}
        <header className="h-16 bg-[#1C1C1E]/90 backdrop-blur-md border-b border-[#3A3A40] sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <MenuIcon />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-xs text-gray-400">
                Welcome back, {user.name.split(" ")[0]}!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Search */}
            <div className="hidden md:flex relative group">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#E8A87C] transition-colors"
                sx={{ fontSize: 18 }}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 lg:w-64 pl-10 pr-4 py-1.5 rounded-lg bg-[#232326] border border-[#3A3A40] text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#E8A87C] focus:ring-1 focus:ring-[#E8A87C]/20 transition-all"
              />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2C2C30] transition-colors"
              >
                <NotificationsIcon fontSize="small" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#1C1C1E]"></span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#2C2C30] border border-[#3A3A40] rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A40] bg-[#232326]">
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[#E8A87C] hover:text-white transition-colors flex items-center gap-1"
                        >
                          <CheckIcon sx={{ fontSize: 14 }} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-[#3A3A40] last:border-0 hover:bg-[#343439] transition-colors ${!n.read ? "bg-[#E8A87C]/5" : ""}`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === "trade" ? "bg-green-500/20 text-green-400" : n.type === "alert" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"}`}
                            >
                              {n.type === "trade" ? (
                                <SwapHorizIcon sx={{ fontSize: 16 }} />
                              ) : n.type === "alert" ? (
                                <TrendingUpIcon sx={{ fontSize: 16 }} />
                              ) : (
                                <ShieldIcon sx={{ fontSize: 16 }} />
                              )}
                            </div>
                            <div>
                              <p
                                className={`text-sm ${!n.read ? "font-semibold text-white" : "text-gray-300"}`}
                              >
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {n.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 pl-2 rounded-full bg-[#232326] border border-[#3A3A40] hover:border-[#E8A87C]/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8A87C] to-[#D08860] flex items-center justify-center text-[#1c1c1e] font-bold text-sm shadow-sm">
                  {user.avatar || getInitials(user.name)}
                </div>
                <div className="hidden sm:block text-left pr-2">
                  <p className="text-sm font-semibold text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[#E8A87C] font-medium uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-[#2C2C30] border border-[#3A3A40] rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-5 border-b border-[#3A3A40] bg-gradient-to-b from-[#232326] to-[#2C2C30]">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8A87C] to-[#D08860] flex items-center justify-center text-[#1c1c1e] font-bold text-xl mx-auto mb-3 shadow-lg">
                        {user.avatar || getInitials(user.name)}
                      </div>
                      <h3 className="text-center font-bold text-white">
                        {user.name}
                      </h3>
                      <p className="text-center text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                        <MailOutlined sx={{ fontSize: 12 }} /> {user.email}
                      </p>
                      <div className="mt-3 flex justify-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8A87C]/20 text-[#E8A87C] border border-[#E8A87C]/30">
                          {user.role === "admin"
                            ? "Administrator"
                            : "Verified User"}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => navigate("/settings")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#343439] rounded-lg transition-colors"
                      >
                        <PersonIcon sx={{ fontSize: 16 }} /> Account Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                      >
                        <LogoutIcon sx={{ fontSize: 16 }} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* --- DASHBOARD CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TOP STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#E8A87C] to-[#D08860] rounded-2xl p-5 text-[#1c1c1e] shadow-lg relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[#1c1c1e]/70 text-sm font-semibold mb-1">
                    Total Balance
                  </p>
                  <h2 className="text-md font-bold">$84,254.32</h2>
                  <p className="text-sm font-medium mt-2 bg-[#1c1c1e]/10 inline-block px-2 py-0.5 rounded-md">
                    +12.5% this month
                  </p>
                </div>
                <div className="p-2 bg-[#1c1c1e]/10 rounded-xl backdrop-blur-sm">
                  <BusinessCenterIcon sx={{ fontSize: 24 }} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">
                    Total Profit
                  </p>
                  <h2 className="text-md font-bold text-white">$12,847.00</h2>
                  <p className="text-sm font-medium text-green-400 mt-2 flex items-center gap-1">
                    <TrendingUpIcon sx={{ fontSize: 16 }} /> +8.2% vs last week
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 text-green-400 rounded-xl">
                  <ShowChartIcon sx={{ fontSize: 24 }} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">
                    Pending Orders
                  </p>
                  <h2 className="text-md font-bold text-white">7</h2>
                  <p className="text-sm font-medium text-gray-400 mt-2">
                    3 buy, 4 sell
                  </p>
                </div>
                <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-xl">
                  <AccessTimeIcon sx={{ fontSize: 24 }} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">
                    Active Assets
                  </p>
                  <h2 className="text-md font-bold text-white">12</h2>
                  <p className="text-sm font-medium text-gray-400 mt-2">
                    Across 4 wallets
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                  <AccountBalanceWalletIcon sx={{ fontSize: 24 }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 bg-[#232326] border border-[#3A3A40] rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Portfolio Overview</h3>
                <div className="flex bg-[#1C1C1E] p-1 rounded-lg border border-[#3A3A40]">
                  {["1D", "1W", "1M", "1Y"].map((t, i) => (
                    <button
                      key={t}
                      className={`px-3 py-1 text-xs font-semibold rounded-md ${i === 0 ? "bg-[#E8A87C] text-[#1c1c1e]" : "text-gray-400 hover:text-white"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full">
                <svg
                  viewBox="0 0 800 250"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8A87C" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#E8A87C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 60}
                      x2="800"
                      y2={i * 60}
                      stroke="#3A3A40"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  <path
                    d="M0,200 C100,180 150,220 200,150 C250,80 300,120 400,100 C500,80 600,40 800,20 L800,250 L0,250 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M0,200 C100,180 150,220 200,150 C250,80 300,120 400,100 C500,80 600,40 800,20"
                    fill="none"
                    stroke="#E8A87C"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="800"
                    cy="20"
                    r="5"
                    fill="#1C1C1E"
                    stroke="#E8A87C"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5 flex flex-col"
            >
              <h3 className="font-bold text-white mb-6">Asset Allocation</h3>
              <div className="flex-1 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-40 h-40 transform -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3A3A40"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f7931a"
                    strokeWidth="12"
                    strokeDasharray="100 150"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#627eea"
                    strokeWidth="12"
                    strokeDasharray="60 190"
                    strokeDashoffset="-100"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#26a17b"
                    strokeWidth="12"
                    strokeDasharray="50 200"
                    strokeDashoffset="-160"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E8A87C"
                    strokeWidth="12"
                    strokeDasharray="40 210"
                    strokeDashoffset="-210"
                  />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-[#f7931a]"></div> BTC
                  40%
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-[#627eea]"></div> ETH
                  25%
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-[#26a17b]"></div> USDT
                  20%
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-[#E8A87C]"></div>{" "}
                  Other 15%
                </div>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Recent Transactions</h3>
                <button
                  onClick={() => setShowAllTransactions(true)}
                  className="text-sm text-[#E8A87C] hover:text-white transition-colors flex items-center gap-1"
                >
                  View All <ChevronRightIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
              <div className="space-y-4">
                {ALL_TRANSACTIONS.slice(0, 4).map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#2C2C30] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "buy" ? "bg-green-500/10 text-green-400" : tx.type === "sell" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}
                      >
                        {tx.type === "buy" ? (
                          <TrendingUpIcon fontSize="small" />
                        ) : tx.type === "sell" ? (
                          <TrendingDownIcon fontSize="small" />
                        ) : (
                          <SwapHorizIcon fontSize="small" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-[#E8A87C] transition-colors">
                          {tx.title}
                        </p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${tx.positive === true ? "text-green-400" : tx.positive === false ? "text-red-400" : "text-gray-300"}`}
                    >
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Watchlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Watchlist</h3>
                <button
                  onClick={() => setShowAddWatchlist(true)}
                  className="text-sm text-[#E8A87C] hover:text-white transition-colors flex items-center gap-1"
                >
                  <AddIcon sx={{ fontSize: 16 }} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {watchlist.map((coin, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#2C2C30] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-[#3A3A40] flex items-center justify-center text-xs font-bold text-gray-300">
                        {coin.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {coin.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {coin.price}
                        </p>
                        <p
                          className={`text-xs font-medium ${coin.up ? "text-green-400" : "text-red-400"}`}
                        >
                          {coin.change}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(coin.symbol)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Add to Watchlist Modal */}
      <Modal
        isOpen={showAddWatchlist}
        onClose={() => setShowAddWatchlist(false)}
        title="Add to Watchlist"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Select Cryptocurrency
            </label>
            <select
              value={newCoinSymbol}
              onChange={(e) => setNewCoinSymbol(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl p-3 text-white outline-none focus:border-[#E8A87C] cursor-pointer"
            >
              {AVAILABLE_COINS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addToWatchlist}
            className="w-full py-3 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors mt-2"
          >
            Add to Watchlist
          </button>
        </div>
      </Modal>

      {/* All Transactions Modal */}
      <Modal
        isOpen={showAllTransactions}
        onClose={() => setShowAllTransactions(false)}
        title="All Transactions"
      >
        <div className="space-y-3">
          {ALL_TRANSACTIONS.map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C1E] border border-[#3A3A40]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === "buy" ? "bg-green-500/10 text-green-400" : tx.type === "sell" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}
                >
                  {tx.type === "buy" ? (
                    <TrendingUpIcon fontSize="small" />
                  ) : tx.type === "sell" ? (
                    <TrendingDownIcon fontSize="small" />
                  ) : (
                    <SwapHorizIcon fontSize="small" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{tx.title}</p>
                  <p className="text-[10px] text-gray-500">{tx.date}</p>
                </div>
              </div>
              <div
                className={`text-sm font-bold ${tx.positive === true ? "text-green-400" : tx.positive === false ? "text-red-400" : "text-gray-300"}`}
              >
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
