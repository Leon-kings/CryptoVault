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
import { MailOutlined } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import TuneIcon from "@mui/icons-material/Tune";
import LinkIcon from "@mui/icons-material/Link";
import AddIcon from "@mui/icons-material/Add";

/* ============================================================
 * TYPES
 * ============================================================ */
interface AuthUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "preferences"
  | "connected";

/* ============================================================
 * MOCK DATA
 * ============================================================ */
const INITIAL_NOTIFICATIONS = [
  {
    id: "price",
    title: "Price Alerts",
    desc: "Get notified when prices hit your targets",
    enabled: true,
  },
  {
    id: "tx",
    title: "Transaction Updates",
    desc: "Receive alerts for deposits, withdrawals, and trades",
    enabled: true,
  },
  {
    id: "security",
    title: "Security Alerts",
    desc: "Important security notifications and login alerts",
    enabled: true,
  },
  {
    id: "marketing",
    title: "Marketing Emails",
    desc: "News, updates, and promotional offers",
    enabled: false,
  },
  {
    id: "weekly",
    title: "Weekly Report",
    desc: "Portfolio performance summary every week",
    enabled: true,
  },
  {
    id: "push",
    title: "Push Notifications",
    desc: "Enable browser push notifications",
    enabled: false,
  },
];

const INITIAL_CONNECTED = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    bg: "bg-orange-500/20",
    status: "Connected • 0x742d...5f83",
    connected: true,
  },
  {
    id: "coinbase",
    name: "Coinbase",
    icon: "C",
    bg: "bg-blue-500/20",
    status: "Connected • alex.m@email.com",
    connected: true,
  },
  {
    id: "binance",
    name: "Binance",
    icon: "B",
    bg: "bg-yellow-500/20",
    status: "Not connected",
    connected: false,
  },
];

/* ============================================================
 * MAIN COMPONENT
 * ============================================================ */
export const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  // App State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Connected Accounts State
  const [connected, setConnected] = useState(INITIAL_CONNECTED);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Initialize user & theme
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv_auth_user");
      if (raw) {
        const parsedUser = JSON.parse(raw);
        setUser(parsedUser);
        // Pre-fill profile form with real user data
        const nameParts = (parsedUser.name || "").split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setEmail(parsedUser.email || "");
        setPhone(parsedUser.phone || "+1 (555) 123-4567");
        setBio(parsedUser.bio || "Crypto enthusiast and day trader since 2017");
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }

    const savedTheme = localStorage.getItem("theme") || "dark";
    setIsLightMode(savedTheme === "light");
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updatedUser = {
      ...user,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      bio,
    };
    setUser(updatedUser);
    localStorage.setItem("cv_auth_user", JSON.stringify(updatedUser));
    alert("Profile updated successfully!");
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
    );
  };

  const toggleConnection = (id: string) => {
    setConnected((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              connected: !c.connected,
              status: !c.connected
                ? `Connected • user@example.com`
                : "Not connected",
            }
          : c,
      ),
    );
  };

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: <PersonIcon fontSize="small" /> },
    {
      id: "security",
      label: "Security",
      icon: <SecurityIcon fontSize="small" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <NotificationsIcon fontSize="small" />,
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: <TuneIcon fontSize="small" />,
    },
    {
      id: "connected",
      label: "Connected",
      icon: <LinkIcon fontSize="small" />,
    },
  ] as const;

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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E8A87C]/10 text-[#E8A87C] font-medium transition-colors"
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
                Settings
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Manage your account
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-md font-bold text-white mb-1">
                Settings
              </h1>
              <p className="text-sm text-gray-400">
                Manage your account preferences and security
              </p>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 space-x-2 border-b border-[#3A3A40] scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm whitespace-nowrap transition-colors relative ${activeTab === tab.id ? "text-[#E8A87C]" : "text-gray-400 hover:text-white"}`}
                >
                  {tab.icon} {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8A87C]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* ---- PROFILE TAB ---- */}
                {activeTab === "profile" && (
                  <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-[#3A3A40]">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8A87C] to-[#D08860] flex items-center justify-center text-[#1c1c1e] font-bold text-3xl shadow-xl">
                          {user.avatar || getInitials(user.name)}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 rounded-full bg-[#3A3A40] text-white hover:bg-[#E8A87C] hover:text-[#1c1c1e] transition-colors border-2 border-[#232326]">
                          <EditIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                      <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-white">
                          {user.name}
                        </h2>
                        <p className="text-gray-400">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8A87C]/20 text-[#E8A87C] border border-[#E8A87C]/30">
                          {user.role === "admin"
                            ? "Administrator"
                            : "Pro Trader"}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] transition-colors resize-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold text-sm hover:bg-[#D08860] transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="px-6 py-2.5 rounded-xl bg-[#232326] border border-[#3A3A40] text-white font-semibold text-sm hover:bg-[#2C2C30] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ---- SECURITY TAB ---- */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-1">
                        Security Settings
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Manage your account security and authentication methods
                      </p>

                      <div className="divide-y divide-[#3A3A40]">
                        {[
                          {
                            icon: <LockIcon />,
                            title: "Password",
                            status: "Last changed 30 days ago",
                            enabled: true,
                            action: "Change Password",
                          },
                          {
                            icon: <PhoneAndroidIcon />,
                            title: "Two-Factor Authentication",
                            status: "Enabled via Authenticator App",
                            enabled: true,
                            action: "Manage",
                          },
                          {
                            icon: <FingerprintIcon />,
                            title: "Biometric Login",
                            status: "Not configured",
                            enabled: false,
                            action: "Enable",
                            primary: true,
                          },
                          {
                            icon: <AccessTimeIcon />,
                            title: "Active Sessions",
                            status: "3 devices currently logged in",
                            enabled: true,
                            action: "View All",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-[#E8A87C]/10 text-[#E8A87C]">
                                {item.icon}
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  {item.title}
                                </p>
                                <p
                                  className={`text-xs ${item.enabled ? "text-green-400" : "text-gray-500"}`}
                                >
                                  {item.status}
                                </p>
                              </div>
                            </div>
                            <button
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${item.primary ? "bg-[#E8A87C] text-[#1c1c1e] hover:bg-[#D08860]" : "bg-[#1C1C1E] border border-[#3A3A40] text-white hover:bg-[#3A3A40]"}`}
                            >
                              {item.action}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#232326] border border-red-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-2 text-red-400">
                        <WarningAmberIcon />
                        <h3 className="text-lg font-bold">Danger Zone</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-6">
                        Irreversible actions for your account
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors">
                          Delete Account
                        </button>
                        <button className="px-5 py-2.5 rounded-xl bg-[#1C1C1E] border border-[#3A3A40] text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-colors">
                          Export All Data
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- NOTIFICATIONS TAB ---- */}
                {activeTab === "notifications" && (
                  <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Notification Preferences
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Choose how you want to receive updates
                    </p>

                    <div className="divide-y divide-[#3A3A40]">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          className="py-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-white">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleNotification(item.id)}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${item.enabled ? "bg-[#E8A87C]" : "bg-[#3A3A40]"}`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${item.enabled ? "translate-x-5" : "translate-x-0"}`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---- PREFERENCES TAB ---- */}
                {activeTab === "preferences" && (
                  <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Display Preferences
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Customize how the app looks and behaves
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Currency
                        </label>
                        <select className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] cursor-pointer">
                          <option>USD - US Dollar</option>
                          <option>EUR - Euro</option>
                          <option>GBP - British Pound</option>
                          <option>JPY - Japanese Yen</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Language
                        </label>
                        <select className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] cursor-pointer">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Timezone
                        </label>
                        <select className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] cursor-pointer">
                          <option>Eastern Time (ET)</option>
                          <option>Pacific Time (PT)</option>
                          <option>UTC</option>
                          <option>GMT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Date Format
                        </label>
                        <select className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#E8A87C] cursor-pointer">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    <div className="divide-y divide-[#3A3A40] mb-6">
                      <div className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Dark Mode</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Use dark theme for the interface
                          </p>
                        </div>
                      
                      </div>
                      <div className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            Compact View
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Show more data with smaller elements
                          </p>
                        </div>
                        <button className="w-11 h-6 rounded-full p-0.5 bg-[#3A3A40]">
                          <div className="w-5 h-5 rounded-full bg-white shadow-md translate-x-0" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="px-6 py-2.5 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold text-sm hover:bg-[#D08860] transition-colors">
                        Save Preferences
                      </button>
                      <button className="px-6 py-2.5 rounded-xl bg-[#1C1C1E] border border-[#3A3A40] text-white font-semibold text-sm hover:bg-[#2C2C30] transition-colors">
                        Reset to Default
                      </button>
                    </div>
                  </div>
                )}

                {/* ---- CONNECTED TAB ---- */}
                {activeTab === "connected" && (
                  <div className="space-y-6">
                    <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-1">
                        Connected Exchanges
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Link your exchange accounts for seamless trading
                      </p>

                      <div className="divide-y divide-[#3A3A40] mb-6">
                        {connected.map((item) => (
                          <div
                            key={item.id}
                            className="py-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center text-lg font-bold text-white`}
                              >
                                {item.icon}
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  {item.name}
                                </p>
                                <p
                                  className={`text-xs ${item.connected ? "text-green-400" : "text-gray-500"}`}
                                >
                                  {item.status}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleConnection(item.id)}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${item.connected ? "bg-[#1C1C1E] border border-[#3A3A40] text-red-400 hover:bg-red-500/10" : "bg-[#E8A87C] text-[#1c1c1e] hover:bg-[#D08860]"}`}
                            >
                              {item.connected ? "Disconnect" : "Connect"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-[#3A3A40] text-gray-400 font-semibold text-sm hover:border-[#E8A87C]/50 hover:text-[#E8A87C] transition-colors">
                        <AddIcon fontSize="small" /> Add Exchange
                      </button>
                    </div>

                    <div className="bg-[#232326] border border-[#3A3A40] rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-1">
                        API Keys
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Manage your API access for third-party integrations
                      </p>

                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          API Key
                        </label>
                        <input
                          type="text"
                          value="cv_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                          readOnly
                          className="w-full bg-[#1C1C1E] border border-[#3A3A40] rounded-xl px-4 py-3 text-gray-500 font-mono text-sm outline-none"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-xl bg-[#1C1C1E] border border-[#3A3A40] text-white font-semibold text-sm hover:bg-[#2C2C30] transition-colors">
                          Regenerate Key
                        </button>
                        <button className="px-5 py-2.5 rounded-xl bg-transparent text-[#E8A87C] font-semibold text-sm hover:underline transition-colors">
                          View Documentation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
