import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Material UI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { MailOutlined } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import ShareIcon from "@mui/icons-material/Share";
import QrCodeIcon from "@mui/icons-material/QrCode";
import LayersIcon from "@mui/icons-material/Layers";

/* ============================================================
 * TYPES & MOCK DATA
 * ============================================================ */
interface AuthUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface WalletAsset {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  usdValue: number;
  address: string;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "stake" | "reward";
  asset: string;
  amount: number;
  date: string;
  status: "completed" | "pending";
}

const INITIAL_WALLETS: WalletAsset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    color: "#f7931a",
    amount: 0.8542,
    usdValue: 36942.5,
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    color: "#627eea",
    amount: 12.45,
    usdValue: 28442.25,
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
    color: "#26a17b",
    amount: 15000,
    usdValue: 15000.0,
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    color: "#9945ff",
    amount: 39.45,
    usdValue: 3869.57,
    address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLK...",
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    asset: "BTC",
    amount: 0.0567,
    date: "Today, 2:45 PM",
    status: "completed",
  },
  {
    id: "2",
    type: "withdraw",
    asset: "ETH",
    amount: 0.805,
    date: "Yesterday, 11:20 AM",
    status: "completed",
  },
  {
    id: "3",
    type: "stake",
    asset: "SOL",
    amount: 25.0,
    date: "Dec 28, 4:15 PM",
    status: "pending",
  },
  {
    id: "4",
    type: "reward",
    asset: "ETH",
    amount: 0.012,
    date: "Dec 27, 9:30 AM",
    status: "completed",
  },
];

/* ============================================================
 * MODAL COMPONENT
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
              className="relative bg-[#2C2C30] border border-[#3A3A40] rounded-2xl p-6 w-full max-w-md shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
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
 * MAIN WALLET COMPONENT
 * ============================================================ */
export const Wallet = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  // App State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Wallet State
  const [wallets, setWallets] = useState<WalletAsset[]>(INITIAL_WALLETS);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Modal State
  const [activeModal, setActiveModal] = useState<
    "deposit" | "withdraw" | "swap" | "stake" | null
  >(null);
  const [modalStep, setModalStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [inputAmount, setInputAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Initialize user & theme
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv_auth_user");
      if (raw) setUser(JSON.parse(raw));
      else navigate("/");
    } catch {
      navigate("/");
    }
    const savedTheme = localStorage.getItem("theme") || "dark";
   
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Modal Handlers ---
  const openModal = (type: "deposit" | "withdraw" | "swap" | "stake") => {
    setActiveModal(type);
    setModalStep(1);
    setInputAmount("");
    setSelectedAsset("BTC");
  };

  const closeModal = () => setActiveModal(null);

  const handleTransactionSubmit = () => {
    if (!inputAmount || isNaN(Number(inputAmount)) || Number(inputAmount) <= 0)
      return;

    const amount = Number(inputAmount);
    const asset = wallets.find((w) => w.symbol === selectedAsset);

    if (!asset) return;

    // Process transaction based on modal type
    if (activeModal === "withdraw" || activeModal === "stake") {
      if (asset.amount < amount) {
        alert("Insufficient funds");
        return;
      }
      // Deduct from wallet
      setWallets((prev) =>
        prev.map((w) =>
          w.symbol === selectedAsset
            ? {
                ...w,
                amount: w.amount - amount,
                usdValue: w.usdValue - amount * (w.usdValue / w.amount),
              }
            : w,
        ),
      );
    } else if (activeModal === "deposit") {
      // Add to wallet
      setWallets((prev) =>
        prev.map((w) =>
          w.symbol === selectedAsset
            ? {
                ...w,
                amount: w.amount + amount,
                usdValue: w.usdValue + amount * (w.usdValue / w.amount),
              }
            : w,
        ),
      );
    }

    // Add transaction to history
    const newTx: Transaction = {
      id: Date.now().toString(),
      type:
        activeModal === "stake"
          ? "stake"
          : activeModal === "withdraw"
            ? "withdraw"
            : "deposit",
      asset: selectedAsset,
      amount:
        activeModal === "withdraw" || activeModal === "stake"
          ? -amount
          : amount,
      date: "Just now",
      status: activeModal === "stake" ? "pending" : "completed",
    };
    setTransactions((prev) => [newTx, ...prev]);

    setModalStep(2); // Show success step
  };

  if (!user) return null;

  const totalBalance = wallets.reduce((acc, w) => acc + w.usdValue, 0);

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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#2C2C30] transition-colors"
              >
                <ShowChartIcon fontSize="small" /> Markets
              </Link>
              <Link
                to="/wallet"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E8A87C]/10 text-[#E8A87C] font-medium transition-colors"
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
        {/* HEADER */}
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
                Wallet
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Manage your crypto assets
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
                    <div className="p-4 text-sm text-gray-400 text-center">
                      No new notifications.
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

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#E8A87C] to-[#D08860] rounded-2xl p-5 text-[#1c1c1e] shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[#1c1c1e]/70 text-sm font-semibold mb-1">
                    Total Balance
                  </p>
                  <h2 className="text-md font-bold">
                    $
                    {totalBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>
                  <p className="text-sm font-medium mt-2 bg-[#1c1c1e]/10 inline-block px-2 py-0.5 rounded-md">
                    +3.5% this month
                  </p>
                </div>
                <div className="p-2 bg-[#1c1c1e]/10 rounded-xl">
                  <AccountBalanceWalletIcon />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">
                    Staked Assets
                  </p>
                  <h2 className="text-md font-bold text-white">
                    $12,450.00
                  </h2>
                  <p className="text-sm font-medium text-green-400 mt-2 flex items-center gap-1">
                    <TrendingUpIcon sx={{ fontSize: 16 }} /> Earning 8.2% APY
                  </p>
                </div>
                <div className="p-2 bg-[#E8A87C]/10 text-[#E8A87C] rounded-xl">
                  <LayersIcon />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">
                    Total Rewards
                  </p>
                  <h2 className="text-md font-bold text-white">
                    $1,024.80
                  </h2>
                  <p className="text-sm font-medium text-gray-400 mt-2">
                    +$45.20 this week
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 text-green-400 rounded-xl">
                  <TrendingUpIcon />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openModal("deposit")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors shadow-lg shadow-[#E8A87C]/20"
            >
              <DownloadIcon fontSize="small" /> Deposit
            </button>
            <button
              onClick={() => openModal("withdraw")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#232326] border border-[#3A3A40] text-white font-semibold hover:bg-[#2C2C30] transition-colors"
            >
              <UploadIcon fontSize="small" /> Withdraw
            </button>
            <button
              onClick={() => openModal("swap")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#232326] border border-[#3A3A40] text-white font-semibold hover:bg-[#2C2C30] transition-colors"
            >
              <SwapHorizIcon fontSize="small" /> Swap
            </button>
            <button
              onClick={() => openModal("stake")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#232326] border border-[#3A3A40] text-white font-semibold hover:bg-[#2C2C30] transition-colors"
            >
              <LockIcon fontSize="small" /> Stake
            </button>
          </div>

          {/* Wallets & QR Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Wallet List */}
            <div className="xl:col-span-2 bg-[#232326] border border-[#3A3A40] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-[#3A3A40] flex justify-between items-center">
                <h2 className="font-bold text-white">Your Wallets</h2>
              </div>
              <div className="divide-y divide-[#3A3A40]">
                {wallets.map((wallet, i) => (
                  <motion.div
                    key={wallet.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#2C2C30] transition-colors group"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: wallet.color }}
                      >
                        {wallet.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">
                          {wallet.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-xs font-mono">
                          {wallet.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:text-right">
                      <div>
                        <p className="font-bold text-white">
                          {wallet.amount} {wallet.symbol}
                        </p>
                        <p className="text-xs text-gray-400">
                          $
                          {wallet.usdValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(wallet.address)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#E8A87C] hover:bg-[#3A3A40] transition-colors"
                      >
                        {copied ? (
                          <CheckIcon fontSize="small" />
                        ) : (
                          <ContentCopyIcon fontSize="small" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Receive QR */}
            <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5 flex flex-col">
              <h2 className="font-bold text-white mb-6">Receive Bitcoin</h2>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-48 h-48 bg-white p-2 rounded-xl mb-4 shadow-xl">
                  <QrCodeIcon sx={{ fontSize: 176, color: "#1c1c1e" }} />
                </div>
                <p className="text-xs font-mono text-gray-400 bg-[#1C1C1E] p-2 rounded-lg break-all text-center mb-4">
                  {wallets[0].address}
                </p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => handleCopy(wallets[0].address)}
                    className="flex-1 py-2.5 rounded-xl bg-[#232326] border border-[#3A3A40] text-white text-sm font-semibold hover:bg-[#3A3A40] transition-colors"
                  >
                    Copy
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl bg-[#E8A87C] text-[#1c1c1e] text-sm font-semibold hover:bg-[#D08860] transition-colors flex items-center justify-center gap-1">
                    <ShareIcon sx={{ fontSize: 16 }} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Staking Opportunities */}
          <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-5">
            <h2 className="font-bold text-white mb-4">Staking Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Ethereum 2.0",
                  apy: "5.2%",
                  staked: "4.5 ETH",
                  rewards: "0.234 ETH",
                  icon: "Ξ",
                  color: "#627eea",
                },
                {
                  name: "Solana",
                  apy: "7.8%",
                  staked: "25 SOL",
                  rewards: "1.95 SOL",
                  icon: "◎",
                  color: "#9945ff",
                },
                {
                  name: "Cardano",
                  apy: "4.5%",
                  staked: "5,000 ADA",
                  rewards: "225 ADA",
                  icon: "₳",
                  color: "#0033ad",
                },
                {
                  name: "Polkadot",
                  apy: "12.5%",
                  staked: "150 DOT",
                  rewards: "18.75 DOT",
                  icon: "●",
                  color: "#e6007a",
                },
              ].map((pool, i) => (
                <div
                  key={i}
                  className="bg-[#1C1C1E] border border-[#3A3A40] rounded-xl p-4 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: pool.color }}
                    >
                      {pool.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">
                        {pool.name}
                      </p>
                      <p className="text-[10px] text-green-400 font-semibold">
                        {pool.apy} APY
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Staked</span>
                      <span className="text-white font-medium">
                        {pool.staked}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Rewards</span>
                      <span className="text-[#E8A87C] font-medium">
                        {pool.rewards}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openModal("stake")}
                    className="w-full py-2 rounded-lg bg-[#232326] border border-[#3A3A40] text-xs font-semibold text-gray-300 hover:text-white hover:border-[#E8A87C]/50 transition-colors"
                  >
                    Manage Stake
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#3A3A40]">
              <h2 className="font-bold text-white">Transaction History</h2>
            </div>
            <div className="divide-y divide-[#3A3A40]">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-[#2C2C30] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "deposit" || tx.type === "reward"
                          ? "bg-green-500/10 text-green-400"
                          : tx.type === "withdraw"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-[#E8A87C]/10 text-[#E8A87C]"
                      }`}
                    >
                      {tx.type === "deposit" || tx.type === "reward" ? (
                        <DownloadIcon fontSize="small" />
                      ) : tx.type === "withdraw" ? (
                        <UploadIcon fontSize="small" />
                      ) : (
                        <LockIcon fontSize="small" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white capitalize">
                        {tx.type} {tx.asset}
                      </p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount} {tx.asset}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tx.status === "completed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Deposit / Withdraw / Stake Modal */}
      <Modal
        isOpen={
          activeModal === "deposit" ||
          activeModal === "withdraw" ||
          activeModal === "stake"
        }
        onClose={closeModal}
        title={
          modalStep === 2
            ? "Success!"
            : activeModal === "deposit"
              ? "Deposit Crypto"
              : activeModal === "withdraw"
                ? "Withdraw Crypto"
                : "Stake Assets"
        }
      >
        {modalStep === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Select Asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl p-3 text-white outline-none focus:border-[#E8A87C]"
              >
                {wallets.map((w) => (
                  <option key={w.symbol} value={w.symbol}>
                    {w.name} ({w.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Amount</label>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl p-3 text-white outline-none focus:border-[#E8A87C] font-mono"
              />
            </div>
            {activeModal === "deposit" && (
              <div className="bg-[#1C1C1E] p-3 rounded-xl border border-[#3A3A40] flex items-center gap-3">
                <QrCodeIcon sx={{ fontSize: 32, color: "#E8A87C" }} />
                <p className="text-xs text-gray-400">
                  Send only the selected asset to the generated address.
                </p>
              </div>
            )}
            <button
              onClick={handleTransactionSubmit}
              disabled={!inputAmount}
              className="w-full py-3 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors disabled:opacity-50 mt-2"
            >
              Confirm {activeModal}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon sx={{ fontSize: 32, color: "#4ade80" }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Transaction Successful
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Your {activeModal} of {inputAmount} {selectedAsset} has been
              initiated.
            </p>
            <button
              onClick={closeModal}
              className="w-full py-3 rounded-xl bg-[#232326] border border-[#3A3A40] text-white font-semibold hover:bg-[#3A3A40]"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Swap Modal */}
      <Modal
        isOpen={activeModal === "swap"}
        onClose={closeModal}
        title="Swap Assets"
      >
        <div className="space-y-4">
          <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A40]">
            <label className="text-xs text-gray-400 mb-1 block">From</label>
            <div className="flex gap-3">
              <select className="bg-transparent text-white font-bold outline-none flex-1">
                {wallets.map((w) => (
                  <option key={w.symbol} value={w.symbol}>
                    {w.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent text-white font-mono text-right outline-none w-24"
              />
            </div>
          </div>
          <div className="flex justify-center -my-2 z-10 relative">
            <div className="bg-[#2C2C30] p-2 rounded-full border border-[#3A3A40]">
              <SwapHorizIcon sx={{ color: "#E8A87C" }} />
            </div>
          </div>
          <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A40]">
            <label className="text-xs text-gray-400 mb-1 block">To</label>
            <div className="flex gap-3">
              <select className="bg-transparent text-white font-bold outline-none flex-1">
                {wallets.map((w) => (
                  <option key={w.symbol} value={w.symbol}>
                    {w.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent text-white font-mono text-right outline-none w-24"
                readOnly
              />
            </div>
          </div>
          <button
            onClick={() => setModalStep(2)}
            className="w-full py-3 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors mt-2"
          >
            Review Swap
          </button>
        </div>
      </Modal>
    </div>
  );
};
