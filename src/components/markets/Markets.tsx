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
import { MailOutlined } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import WhatshotIcon from "@mui/icons-material/Whatshot";

/* ============================================================
 * TYPES & MOCK DATA
 * ============================================================ */
interface AuthUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Coin {
  rank: number;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  price: string;
  change: string;
  isPositive: boolean;
  volume: string;
  marketCap: string;
  category: ("DeFi" | "Layer 1" | "NFT" | "Stablecoin")[];
}

const COINS: Coin[] = [
  {
    rank: 1,
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    color: "#f7931a",
    price: "$43,256.00",
    change: "+2.34%",
    isPositive: true,
    volume: "$28.4B",
    marketCap: "$847.2B",
    category: ["Layer 1"],
  },
  {
    rank: 2,
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    color: "#627eea",
    price: "$2,284.50",
    change: "+1.87%",
    isPositive: true,
    volume: "$12.8B",
    marketCap: "$274.5B",
    category: ["Layer 1", "DeFi"],
  },
  {
    rank: 3,
    name: "Tether",
    symbol: "USDT",
    icon: "₮",
    color: "#26a17b",
    price: "$1.00",
    change: "+0.01%",
    isPositive: true,
    volume: "$45.2B",
    marketCap: "$95.8B",
    category: ["Stablecoin"],
  },
  {
    rank: 4,
    name: "BNB",
    symbol: "BNB",
    icon: "B",
    color: "#f3ba2f",
    price: "$312.45",
    change: "-0.82%",
    isPositive: false,
    volume: "$842M",
    marketCap: "$48.2B",
    category: ["Layer 1"],
  },
  {
    rank: 5,
    name: "Solana",
    symbol: "SOL",
    icon: "◎",
    color: "#9945ff",
    price: "$98.42",
    change: "+5.67%",
    isPositive: true,
    volume: "$2.4B",
    marketCap: "$42.8B",
    category: ["Layer 1"],
  },
  {
    rank: 6,
    name: "XRP",
    symbol: "XRP",
    icon: "✕",
    color: "#23292f",
    price: "$0.62",
    change: "-1.24%",
    isPositive: false,
    volume: "$1.2B",
    marketCap: "$33.8B",
    category: ["Layer 1"],
  },
  {
    rank: 7,
    name: "Cardano",
    symbol: "ADA",
    icon: "₳",
    color: "#0033ad",
    price: "$0.52",
    change: "+3.12%",
    isPositive: true,
    volume: "$428M",
    marketCap: "$18.4B",
    category: ["Layer 1"],
  },
  {
    rank: 8,
    name: "Dogecoin",
    symbol: "DOGE",
    icon: "Ð",
    color: "#c3a634",
    price: "$0.082",
    change: "+8.45%",
    isPositive: true,
    volume: "$892M",
    marketCap: "$11.6B",
    category: [],
  },
  {
    rank: 9,
    name: "Polkadot",
    symbol: "DOT",
    icon: "●",
    color: "#e6007a",
    price: "$7.45",
    change: "+4.21%",
    isPositive: true,
    volume: "$312M",
    marketCap: "$9.8B",
    category: ["Layer 1"],
  },
  {
    rank: 10,
    name: "Polygon",
    symbol: "MATIC",
    icon: "M",
    color: "#8247e5",
    price: "$0.89",
    change: "-2.15%",
    isPositive: false,
    volume: "$524M",
    marketCap: "$8.2B",
    category: ["Layer 1", "DeFi"],
  },
];

const TRENDING_COINS = [
  {
    name: "Dogecoin",
    symbol: "DOGE",
    icon: "Ð",
    color: "#c3a634",
    change: "+8.45%",
  },
  {
    name: "Solana",
    symbol: "SOL",
    icon: "◎",
    color: "#9945ff",
    change: "+5.67%",
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    icon: "●",
    color: "#e6007a",
    change: "+4.21%",
  },
  {
    name: "Cardano",
    symbol: "ADA",
    icon: "₳",
    color: "#0033ad",
    change: "+3.12%",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    color: "#f7931a",
    change: "+2.34%",
  },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Limit Order Executed",
    message: "Your buy order for 0.5 BTC has been filled.",
    time: "2 mins ago",
    type: "trade",
  },
  {
    id: 2,
    title: "Price Alert: ETH",
    message: "Ethereum crossed $2,300.00 target.",
    time: "1 hour ago",
    type: "alert",
  },
];

/* ============================================================
 * MAIN COMPONENT
 * ============================================================ */
export const Markets = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [favorites, setFavorites] = useState<string[]>(["BTC", "ETH", "SOL"]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load user & theme
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv_auth_user");
      if (raw) setUser(JSON.parse(raw));
      else navigate("/");
    } catch {
      navigate("/");
    }

  }, [navigate]);

  // Click outside handlers
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

  const handleLogout = () => {
    localStorage.removeItem("cv_auth_user");
    navigate("/");
  };


  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol],
    );
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  // Filter logic
  const filteredCoins = COINS.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "All") return matchesSearch;
    if (activeFilter === "Favorites")
      return matchesSearch && favorites.includes(coin.symbol);
    return matchesSearch && coin.category.includes(activeFilter as any);
  });

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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#2C2C30] transition-colors"
              >
                <DashboardIcon fontSize="small" /> Dashboard
              </Link>
              <Link
                to="/markets"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E8A87C]/10 text-[#E8A87C] font-medium transition-colors"
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
        {/* --- HEADER --- */}
        <header className="h-16 bg-[#1C1C1E]/90 backdrop-blur-md border-b border-[#3A3A40] sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Markets
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Live cryptocurrency prices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2C2C30] transition-colors"
              >
                <NotificationsIcon fontSize="small" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#1C1C1E]"></span>
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#2C2C30] border border-[#3A3A40] rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-[#3A3A40] bg-[#232326] font-semibold text-white text-sm">
                      Notifications
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {NOTIFICATIONS.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 border-b border-[#3A3A40] last:border-0 hover:bg-[#343439]"
                        >
                          <p className="text-sm font-semibold text-white">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {n.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                <div className="hidden md:block text-left pr-2">
                  <p className="text-sm font-semibold text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[#E8A87C] font-medium uppercase">
                    {user.role}
                  </p>
                </div>
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-[#2C2C30] border border-[#3A3A40] rounded-2xl shadow-2xl overflow-hidden z-50"
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
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

        {/* --- PAGE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Page Header Title (mobile) */}
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold text-white mb-1">Markets</h1>
            <p className="text-sm text-gray-400">
              Live cryptocurrency prices and market data
            </p>
          </div>

          {/* Market Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Total Market Cap",
                value: "$2.48T",
                change: "+2.4%",
                positive: true,
              },
              {
                label: "24h Volume",
                value: "$84.2B",
                change: "+5.8%",
                positive: true,
              },
              {
                label: "BTC Dominance",
                value: "52.4%",
                change: "-0.3%",
                positive: false,
              },
              {
                label: "Active Cryptos",
                value: "12,847",
                change: "+24",
                positive: true,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#232326] border border-[#3A3A40] rounded-xl p-4"
              >
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {stat.value}
                </p>
                <p
                  className={`text-xs font-semibold mt-1 ${stat.positive ? "text-green-400" : "text-red-400"}`}
                >
                  {stat.change}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
            <div className="relative w-full xl:w-96">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                sx={{ fontSize: 20 }}
              />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#232326] border border-[#3A3A40] text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#E8A87C] transition-all"
              />
            </div>

            <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
              {["All", "Favorites", "DeFi", "NFT", "Layer 1"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === tab ? "bg-[#E8A87C] text-[#1c1c1e]" : "bg-[#232326] border border-[#3A3A40] text-gray-400 hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Market Table (Takes 3 columns on XL) */}
            <div className="xl:col-span-3 bg-[#232326] border border-[#3A3A40] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#3A3A40] text-xs text-gray-400 font-semibold uppercase tracking-wider bg-[#1C1C1E]/50">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">Coin</th>
                      <th className="p-4 text-right">Price</th>
                      <th className="p-4 text-right">24h %</th>
                      <th className="p-4 text-right hidden md:table-cell">
                        Volume
                      </th>
                      <th className="p-4 text-right hidden lg:table-cell">
                        Market Cap
                      </th>
                      <th className="p-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredCoins.map((coin, i) => (
                        <motion.tr
                          key={coin.symbol}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-[#3A3A40] last:border-0 hover:bg-[#2C2C30] transition-colors group"
                        >
                          <td className="p-4 text-center text-sm text-gray-500">
                            {coin.rank}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                style={{ backgroundColor: coin.color }}
                              >
                                {coin.icon}
                              </div>
                              <div>
                                <p className="font-semibold text-white text-sm group-hover:text-[#E8A87C] transition-colors">
                                  {coin.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {coin.symbol}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right font-semibold text-white text-sm">
                            {coin.price}
                          </td>
                          <td
                            className={`p-4 text-right text-sm font-semibold ${coin.isPositive ? "text-green-400" : "text-red-400"}`}
                          >
                            {coin.change}
                          </td>
                          <td className="p-4 text-right text-sm text-gray-300 hidden md:table-cell">
                            {coin.volume}
                          </td>
                          <td className="p-4 text-right text-sm text-gray-300 hidden lg:table-cell">
                            {coin.marketCap}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => toggleFavorite(coin.symbol)}
                              className={`p-1 rounded-lg transition-colors ${favorites.includes(coin.symbol) ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"}`}
                            >
                              {favorites.includes(coin.symbol) ? (
                                <StarIcon fontSize="small" />
                              ) : (
                                <StarBorderIcon fontSize="small" />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {filteredCoins.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No coins found matching "{searchQuery}" in {activeFilter}.
                </div>
              )}
            </div>

            {/* Right Column (Trending & Fear/Greed) */}
            <div className="space-y-6">
              {/* Trending */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <WhatshotIcon sx={{ color: "#E8A87C", fontSize: 20 }} />
                  <h3 className="font-bold text-white">Trending</h3>
                </div>
                <div className="space-y-3">
                  {TRENDING_COINS.map((coin, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 px-1.5 rounded-xl hover:bg-[#2C2C30] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-bold w-4">
                          {i + 1}
                        </span>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: coin.color }}
                        >
                          {coin.icon}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white leading-tight">
                            {coin.name}
                          </p>
                          <p className="text-xs text-gray-500">{coin.symbol}</p>
                          <span className="text-xs font-semibold text-green-400">
                            {coin.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Fear & Greed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5"
              >
                <h3 className="font-bold text-white mb-6">
                  Fear & Greed Index
                </h3>
                <div className="relative pt-2">
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
                  <div
                    className="absolute top-0 w-1 h-7 bg-white rounded-full shadow-lg transform -translate-x-1/2"
                    style={{ left: "68%" }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full absolute -top-1 -left-1 shadow-md"></div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-medium">
                  <span>Extreme Fear</span>
                  <span>Neutral</span>
                  <span>Extreme Greed</span>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-3xl font-bold text-green-400">68</p>
                  <p className="text-sm text-gray-400 font-medium">Greed</p>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
