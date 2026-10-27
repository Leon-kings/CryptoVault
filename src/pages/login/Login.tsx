import { useState, useEffect, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckIcon from "@mui/icons-material/Check";
import MailOutlineIcon from "@mui/icons-material/Email";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ShieldIcon from "@mui/icons-material/Shield";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Link, useNavigate } from "react-router-dom";

/* ============================================================
 * TYPES
 * ============================================================ */
type TabType = "login" | "register";
type SocialProvider = "google" | "apple";
type LegalDoc = "terms" | "privacy" | null;
type UserRole = "user" | "admin";

interface FormErrors {
  [key: string]: string;
}

interface SocialAccount {
  email: string;
  name: string;
  avatar: string;
}

interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

/* ============================================================
 * VALIDATION UTILS
 * ============================================================ */
const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone: string): boolean =>
  /^\+?[0-9\s\-()]{7,15}$/.test(phone.trim());

const validateLogin = (data: {
  email: string;
  password: string;
}): FormErrors => {
  const errors: FormErrors = {};
  if (!data.email.trim()) errors.email = "Email address is required";
  else if (!validateEmail(data.email))
    errors.email = "Please enter a valid email address";

  if (!data.password.trim()) errors.password = "Password is required";
  else if (data.password.length < 6)
    errors.password = "Password must be at least 6 characters";

  return errors;
};

const validateRegister = (data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}): FormErrors => {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) errors.fullName = "Full name is required";
  else if (data.fullName.trim().length < 3)
    errors.fullName = "Full name must be at least 3 characters";

  if (!data.email.trim()) errors.email = "Email address is required";
  else if (!validateEmail(data.email))
    errors.email = "Please enter a valid email address";

  if (!data.phone.trim()) errors.phone = "Phone number is required";
  else if (!validatePhone(data.phone))
    errors.phone = "Please enter a valid phone number";

  if (!data.password.trim()) errors.password = "Password is required";
  else if (data.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(data.password))
    errors.password = "Password must contain letters and numbers";

  if (!data.confirmPassword.trim())
    errors.confirmPassword = "Please confirm your password";
  else if (data.confirmPassword !== data.password)
    errors.confirmPassword = "Passwords do not match";

  if (!data.agreeTerms)
    errors.agreeTerms = "You must agree to the Terms of Service";

  return errors;
};

const getPasswordStrength = (
  password: string,
): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const mapped = Math.min(Math.ceil(score * 0.8), 4);
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  return {
    score: mapped,
    label: labels[mapped - 1] || "",
    color: colors[mapped - 1] || "",
  };
};

/* ============================================================
 * ROLE DETECTION
 * ============================================================ */
const detectRole = (email: string): UserRole => {
  const local = email.split("@")[0].toLowerCase();
  if (
    local === "admin" ||
    local.startsWith("admin.") ||
    local.endsWith(".admin") ||
    local.includes("+admin") ||
    email.toLowerCase().includes("admin@")
  ) {
    return "admin";
  }
  return "user";
};

const getDashboardPath = (role: UserRole): string =>
  role === "admin" ? "/dashboard/admin" : "/dashboard";

/* ============================================================
 * REUSABLE COMPONENTS
 * ============================================================ */

// ---------- Input Field ----------
interface InputFieldProps {
  label: string;
  type: "text" | "email" | "password" | "tel";
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  icon: ReactNode;
  error?: string;
  name: string;
  autoComplete?: string;
}

function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  icon,
  error,
  name,
  autoComplete,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-200"
      >
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
            error ? "text-red-400" : "text-gray-500"
          }`}
        >
          {icon}
        </div>
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full pl-11 ${isPassword ? "pr-11" : "pr-4"} py-3.5 rounded-xl bg-[#232326] border text-white placeholder:text-gray-500 transition-all outline-none ${
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-[#3A3A40] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#E8A87C] transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="text-xs text-red-400 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Checkbox ----------
function Checkbox({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onChange}
          aria-label="Toggle checkbox"
          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
            checked
              ? "bg-[#E8A87C] border-[#E8A87C]"
              : error
                ? "border-red-500 bg-transparent"
                : "border-[#3A3A40] bg-transparent"
          }`}
        >
          {checked && <CheckIcon sx={{ fontSize: 14, color: "#1c1c1e" }} />}
        </motion.button>
        <span className="text-sm text-gray-300 select-none">{label}</span>
      </div>
      {error && <p className="text-xs text-red-400 mt-1 ml-7">{error}</p>}
    </div>
  );
}

// ---------- Modal Base ----------
function Modal({
  isOpen,
  onClose,
  children,
  showClose = true,
  maxWidth = "max-w-md",
}: {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  showClose?: boolean;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
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
              className={`relative bg-[#2C2C30] border border-[#3A3A40] rounded-2xl p-6 sm:p-8 w-full ${maxWidth} shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto`}
            >
              {showClose && onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------- Success Modal ----------
function SuccessModal({
  isOpen,
  title,
  message,
  actionLabel,
  onAction,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false}>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#E8A87C] flex items-center justify-center"
        >
          <CheckIcon sx={{ fontSize: 48, color: "#1c1c1e" }} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAction}
            className="w-full py-3.5 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors"
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </Modal>
  );
}

// ---------- Error Modal ----------
function ErrorModal({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="#ef4444" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-[#232326] border border-[#3A3A40] text-white font-semibold hover:bg-[#3A3A40] transition-colors"
        >
          Try Again
        </button>
      </div>
    </Modal>
  );
}

// ---------- Forgot Password Modal ----------
function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setTouched(false);
      setLoading(false);
    }
  }, [isOpen]);

  const error =
    touched && !email.trim()
      ? "Email address is required"
      : touched && !validateEmail(email)
        ? "Please enter a valid email address"
        : "";

  const isValid = email.trim() !== "" && validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#E8A87C]/20 border border-[#E8A87C]/40 flex items-center justify-center">
          <MailOutlineIcon sx={{ fontSize: 32, color: "#E8A87C" }} />
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="forgotEmail"
              className="block text-sm font-semibold text-gray-200 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <MailOutlineIcon
                sx={{ fontSize: 20 }}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="forgotEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Enter your email"
                autoComplete="email"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#232326] border text-white placeholder:text-gray-500 outline-none transition-all ${
                  error
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-[#3A3A40] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20"
                }`}
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>

          <motion.button
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-3.5 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1c1c1e]/30 border-t-[#1c1c1e] rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
        </form>
      </div>
    </Modal>
  );
}

// ---------- Enhanced Social Modal (Uses Native Browser APIs) ----------
function SocialModal({
  isOpen,
  provider,
  onClose,
  onContinue,
}: {
  isOpen: boolean;
  provider: SocialProvider;
  onClose: () => void;
  onContinue: (account: SocialAccount) => void;
}) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setIsManualEntry(false);
      setManualEmail("");
      setAccounts([]);
      return;
    }

    // Attempt to load the actual saved credentials for this site from the browser
    const loadBrowserCredentials = async () => {
      setIsLoading(true);
      try {
        const anyNav = navigator as any;
        const credential = await anyNav?.credentials?.get?.({
          mediation: "optional",
          password: true, // Fetch saved site passwords
        });
        
        if (credential?.id && validateEmail(credential.id)) {
          setAccounts([
            { email: credential.id, name: credential.name || "Saved Account", avatar: "👤" },
          ]);
        }
      } catch {
        // Browser blocked the API or no credentials saved. Handled by UI fallback.
      } finally {
        setIsLoading(false);
      }
    };

    loadBrowserCredentials();
  }, [isOpen, provider]);

  const config = {
    google: {
      name: "Google",
      icon: <GoogleIcon sx={{ fontSize: 32, color: "#4285F4" }} />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
    },
    apple: {
      name: "Apple",
      icon: <AppleIcon sx={{ fontSize: 32, color: "#fff" }} />,
      bg: "bg-gray-500/10",
      border: "border-gray-500/30",
    },
  }[provider];

  const selectedAccount = accounts.find((a) => a.email === selected);
  const isManualValid = isManualEntry && validateEmail(manualEmail);
  const canContinue = isManualEntry ? isManualValid : !!selectedAccount;

  const handleContinue = () => {
    if (isManualEntry && isManualValid) {
      onContinue({
        email: manualEmail,
        name: manualEmail.split("@")[0] || "User",
        avatar: "👤",
      });
    } else if (selectedAccount) {
      onContinue(selectedAccount);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center`}
        >
          {config.icon}
        </motion.div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isManualEntry ? "Sign in with email" : "Choose an account"}
        </h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          to continue to <span className="text-white font-medium">CryptoVault</span>
        </p>

        <div className="space-y-3 mb-6">
          {!isManualEntry ? (
            <>
              {isLoading && (
                <div className="flex items-center justify-center py-4 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-500/30 border-t-gray-300 rounded-full animate-spin mr-2" />
                  Checking for saved accounts...
                </div>
              )}

              {!isLoading && accounts.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-4 px-3 bg-[#232326] rounded-xl border border-dashed border-[#3A3A40]">
                  No accounts found in your browser. Use another account below.
                </div>
              )}

              {accounts.map((account, idx) => {
                const isSelected = selected === account.email;
                return (
                  <motion.button
                    key={account.email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(account.email)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                        : "bg-[#232326] border-[#3A3A40] hover:border-[#E8A87C]/50 hover:bg-[#2C2C30]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl flex-shrink-0 shadow-inner border border-[#3A3A40]">
                      {account.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {account.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {account.email}
                      </p>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/50"
                        >
                          <CheckIcon sx={{ fontSize: 16, color: "#4ade80" }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}

              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsManualEntry(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#3A3A40] hover:border-[#E8A87C]/60 hover:bg-[#2C2C30] transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#232326] flex items-center justify-center text-gray-400 flex-shrink-0 border border-[#3A3A40]">
                  <PersonIcon fontSize="small" />
                </div>
                <span className="text-sm text-gray-300 font-medium">
                  Use another account
                </span>
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <MailOutlineIcon
                  sx={{ fontSize: 20 }}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    isManualValid ? "text-green-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  autoComplete="email"
                  className={`w-full pl-11 pr-10 py-3.5 rounded-xl bg-[#232326] border text-white placeholder:text-gray-500 outline-none transition-all ${
                    isManualValid
                      ? "border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      : "border-[#3A3A40] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20"
                  }`}
                />
                <AnimatePresence>
                  {isManualValid && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400"
                    >
                      <VerifiedUserIcon fontSize="small" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isManualValid && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-green-400 font-medium flex items-center gap-1.5 ml-1"
                >
                  <CheckIcon sx={{ fontSize: 14 }} /> Valid email address
                </motion.p>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsManualEntry(false);
                  setManualEmail("");
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to account selection
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors bg-[#232326] border border-[#3A3A40] hover:bg-[#3A3A40]"
          >
            Cancel
          </button>
          <motion.button
            whileHover={canContinue ? { scale: 1.02 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            disabled={!canContinue}
            onClick={handleContinue}
            className="flex-1 py-3 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#E8A87C]/20"
          >
            Continue
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-5 leading-relaxed px-2">
          To continue, {config.name} will share your name, email address, and
          profile picture with CryptoVault.
        </p>
      </div>
    </Modal>
  );
}

// ---------- Legal Modal (Terms / Privacy) ----------
const LEGAL_CONTENT: Record<
  "terms" | "privacy",
  {
    title: string;
    updated: string;
    sections: { heading: string; body: string }[];
  }
> = {
  terms: {
    title: "Terms of Service",
    updated: "Last updated: January 1, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or using CryptoVault, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
      },
      {
        heading: "2. Eligibility",
        body: "You must be at least 18 years old and legally capable of entering into binding contracts to use CryptoVault. You are responsible for ensuring that your use of the platform complies with all applicable laws in your jurisdiction.",
      },
      {
        heading: "3. Account Registration",
        body: "You agree to provide accurate, current, and complete information during registration and to keep it up to date. You are solely responsible for safeguarding your password and for all activity that occurs under your account.",
      },
      {
        heading: "4. Cryptocurrency Risks",
        body: "Trading and holding cryptocurrency involve significant risk. Prices are highly volatile, and you may lose all of your invested capital. CryptoVault does not provide investment advice and is not responsible for any losses you may incur.",
      },
      {
        heading: "5. Prohibited Activities",
        body: "You may not use CryptoVault for any unlawful purpose, including money laundering, terrorist financing, fraud, or any activity that violates applicable laws or regulations. We reserve the right to suspend or terminate accounts that violate these terms.",
      },
      {
        heading: "6. Fees",
        body: "Certain features of CryptoVault may be subject to fees. All applicable fees will be disclosed before you complete a transaction. Fees are non-refundable except where required by law.",
      },
      {
        heading: "7. Limitation of Liability",
        body: "To the maximum extent permitted by law, CryptoVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of your use of the platform.",
      },
      {
        heading: "8. Changes to Terms",
        body: "We may update these Terms of Service from time to time. We will notify you of any material changes by posting the updated terms on our website. Your continued use of CryptoVault after such changes constitutes your acceptance of the new terms.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: January 1, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect information you provide directly to us, such as your name, email address, phone number, and government-issued ID when you create an account or verify your identity. We also collect information automatically when you use our services, such as your IP address, device information, and browsing behavior.",
      },
      {
        heading: "2. How We Use Your Information",
        body: "We use the information we collect to provide, maintain, and improve our services; to verify your identity and comply with anti-money-laundering (AML) and know-your-customer (KYC) regulations; to process transactions; to communicate with you; and to protect against fraud and unauthorized access.",
      },
      {
        heading: "3. Sharing of Information",
        body: "We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf (such as identity verification and payment processing), with law enforcement when required by law, and in connection with a merger, acquisition, or sale of assets.",
      },
      {
        heading: "4. Data Security",
        body: "We implement bank-grade security measures, including encryption, two-factor authentication (2FA), and cold storage for digital assets, to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
      },
      {
        heading: "5. Data Retention",
        body: "We retain your personal information for as long as your account is active or as needed to provide you with services, comply with legal obligations, resolve disputes, and enforce our agreements. When no longer needed, we will securely delete or anonymize your information.",
      },
      {
        heading: "6. Your Rights",
        body: "Depending on your jurisdiction, you may have the right to access, correct, or delete your personal information, to object to or restrict certain processing, and to data portability. To exercise these rights, please contact us at privacy@cryptovault.example.",
      },
      {
        heading: "7. Cookies",
        body: "We use cookies and similar technologies to enhance your experience, analyze usage, and assist with our marketing efforts. You can control cookies through your browser settings, but disabling them may affect the functionality of our services.",
      },
      {
        heading: "8. Contact Us",
        body: "If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@cryptovault.example.",
      },
    ],
  },
};

function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  const content = doc ? LEGAL_CONTENT[doc] : null;

  return (
    <Modal isOpen={doc !== null} onClose={onClose} maxWidth="max-w-2xl">
      {content && (
        <div>
          <div className="flex items-center gap-3 mb-1">
            {doc === "terms" ? (
              <DescriptionOutlinedIcon
                sx={{ color: "#E8A87C", fontSize: 28 }}
              />
            ) : (
              <PolicyOutlinedIcon sx={{ color: "#E8A87C", fontSize: 28 }} />
            )}
            <h2 className="text-2xl font-bold text-white">{content.title}</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5">{content.updated}</p>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {content.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="text-sm font-bold text-[#E8A87C] mb-1.5">
                  {section.heading}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors"
          >
            I Understand
          </button>
        </div>
      )}
    </Modal>
  );
}

// ---------- Branding Panel ----------
function Branding() {
  const features = [
    {
      icon: <ShieldIcon sx={{ fontSize: 16 }} />,
      text: "Bank-grade security with 2FA protection",
    },
    {
      icon: <ShowChartIcon sx={{ fontSize: 16 }} />,
      text: "Real-time market data and analytics",
    },
    {
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />,
      text: "Multi-wallet support with staking rewards",
    },
  ];

  return (
    <div className="relative h-full flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-[#E8A87C] via-[#D08860] to-[#E8A87C] overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 rounded-2xl bg-[#1c1c1e]/90 backdrop-blur flex items-center justify-center shadow-2xl"
        >
          <span className="text-xl sm:text-2xl font-bold text-[#E8A87C]">
            CV
          </span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1c1c1e] mb-3">
          CryptoVault
        </h1>
        <p className="text-[#1c1c1e]/70 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 leading-relaxed">
          Your secure gateway to the world of cryptocurrency trading and
          portfolio management
        </p>

        <div className="space-y-2.5 sm:space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 text-left bg-[#1c1c1e]/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-[#1c1c1e]/10"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1c1c1e]/80 flex items-center justify-center text-[#E8A87C] flex-shrink-0">
                {f.icon}
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#1c1c1e]/90">
                {f.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Divider ----------
function Divider() {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-[#3A3A40]" />
      <span className="text-xs text-gray-500 whitespace-nowrap">
        or continue with
      </span>
      <div className="flex-1 h-px bg-[#3A3A40]" />
    </div>
  );
}

// ---------- Social Buttons ----------
function SocialButtons({
  onSocial,
}: {
  onSocial: (p: SocialProvider) => void;
}) {
  const btnClass =
    "flex items-center justify-center gap-2 py-3 rounded-xl bg-[#232326] border border-[#3A3A40] text-white text-sm font-medium hover:border-[#E8A87C]/50 transition-colors";

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => onSocial("google")}
        className={btnClass}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => onSocial("apple")}
        className={btnClass}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        Apple
      </motion.button>
    </div>
  );
}

// ---------- Password Strength Meter ----------
function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              score >= i ? color : "bg-[#3A3A40]"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {password ? (
          <span
            className={
              score >= 3
                ? "text-green-400"
                : score === 2
                  ? "text-yellow-400"
                  : "text-red-400"
            }
          >
            {label} password
          </span>
        ) : (
          "Use 8+ characters with a mix of letters, numbers & symbols"
        )}
      </p>
    </div>
  );
}

/* ============================================================
 * NAVBAR (shown when signed in)
 * ============================================================ */
function Navbar({
  user,
  onDashboard,
  onSignOut,
}: {
  user: AuthUser;
  onDashboard: () => void;
  onSignOut: () => void;
}) {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="fixed top-0 left-0 right-0 z-30 bg-[#232326]/90 backdrop-blur-md border-b border-[#3A3A40] px-4 sm:px-6 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8A87C] flex items-center justify-center shadow">
            <span className="text-sm font-bold text-[#1c1c1e]">CV</span>
          </div>
          <span className="text-white font-semibold hidden sm:block">
            CryptoVault
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2C2C30] border border-[#3A3A40]">
            <div className="w-6 h-6 rounded-full bg-[#3A3A40] flex items-center justify-center text-xs">
              {user.avatar || (user.role === "admin" ? "🛡️" : "👤")}
            </div>
            <span className="text-sm text-gray-200 max-w-[120px] truncate">
              {user.name}
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                user.role === "admin"
                  ? "bg-[#E8A87C]/20 text-[#E8A87C]"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {user.role === "admin" ? "Admin" : "User"}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDashboard}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#E8A87C] text-[#1c1c1e] text-sm font-semibold hover:bg-[#D08860] transition-colors"
          >
            {user.role === "admin" ? (
              <AdminPanelSettingsIcon fontSize="small" />
            ) : (
              <DashboardIcon fontSize="small" />
            )}
            <span className="hidden xs:inline">Dashboard</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#232326] border border-[#3A3A40] text-gray-300 text-sm font-medium hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            <LogoutIcon fontSize="small" />
            <span className="hidden sm:inline">Sign out</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ============================================================
 * LOGIN FORM
 * ============================================================ */
function LoginForm({
  onForgotPassword,
  onSuccess,
  onError,
  onSocial,
  onSwitchToRegister,
}: {
  onForgotPassword: () => void;
  onSuccess: (email: string) => void;
  onError: (title: string, message: string) => void;
  onSocial: (provider: SocialProvider) => void;
  onSwitchToRegister: () => void;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("cv_last_email");
      if (savedEmail) setFormData((f) => ({ ...f, email: savedEmail }));
    } catch {
      /* ignore */
    }
  }, []);

  const errors = useMemo(() => validateLogin(formData), [formData]);
  const isValid = Object.keys(errors).length === 0;

  const handleChange =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleBlur = (field: string) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);

    if (formData.password === "wrongpass") {
      onError("Login Failed", "Invalid email or password. Please try again.");
    } else {
      try {
        if (formData.rememberMe) {
          localStorage.setItem("cv_last_email", formData.email);
        }
      } catch {
        /* ignore */
      }
      onSuccess(formData.email);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      <InputField
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange("email")}
        onBlur={handleBlur("email")}
        icon={<MailOutlineIcon fontSize="small" />}
        error={touched.email ? errors.email : undefined}
        autoComplete="username email"
      />

      <InputField
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange("password")}
        onBlur={handleBlur("password")}
        icon={<LockOutlinedIcon fontSize="small" />}
        error={touched.password ? errors.password : undefined}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Checkbox
          checked={formData.rememberMe}
          onChange={() =>
            setFormData({ ...formData, rememberMe: !formData.rememberMe })
          }
          label="Remember me"
        />
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-[#E8A87C] hover:text-[#F0C0A0] font-medium transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <motion.button
        whileHover={isValid && !loading ? { scale: 1.01 } : {}}
        whileTap={isValid && !loading ? { scale: 0.99 } : {}}
        type="submit"
        disabled={!isValid || loading}
        className="w-full py-3.5 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#1c1c1e]/30 border-t-[#1c1c1e] rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </motion.button>

      <Divider />
      <SocialButtons onSocial={onSocial} />

      <p className="text-center text-sm text-gray-400 pt-2">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[#E8A87C] hover:text-[#F0C0A0] font-semibold transition-colors"
        >
          Sign up for free
        </button>
      </p>
    </motion.form>
  );
}

/* ============================================================
 * REGISTER FORM
 * ============================================================ */
function RegisterForm({
  onSuccess,
  onError,
  onSocial,
  onSwitchToLogin,
  onOpenLegal,
}: {
  onSuccess: (email: string, name: string) => void;
  onError: (title: string, message: string) => void;
  onSocial: (provider: SocialProvider) => void;
  onSwitchToLogin: () => void;
  onOpenLegal: (doc: "terms" | "privacy") => void;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validateRegister(formData), [formData]);
  const isValid = Object.keys(errors).length === 0;

  const handleChange =
    (field: "fullName" | "email" | "phone" | "password" | "confirmPassword") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleBlur = (field: string) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });
    if (!isValid) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);

    if (formData.email === "taken@example.com") {
      onError(
        "Registration Failed",
        "An account with this email already exists.",
      );
    } else {
      onSuccess(formData.email, formData.fullName);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      <InputField
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={handleChange("fullName")}
        onBlur={handleBlur("fullName")}
        icon={<PersonIcon fontSize="small" />}
        error={touched.fullName ? errors.fullName : undefined}
        autoComplete="name"
      />

      <InputField
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange("email")}
        onBlur={handleBlur("email")}
        icon={<MailOutlineIcon fontSize="small" />}
        error={touched.email ? errors.email : undefined}
        autoComplete="email"
      />

      <InputField
        label="Phone Number"
        type="tel"
        name="phone"
        placeholder="+1 (555) 000-0000"
        value={formData.phone}
        onChange={handleChange("phone")}
        onBlur={handleBlur("phone")}
        icon={<PhoneIcon fontSize="small" />}
        error={touched.phone ? errors.phone : undefined}
        autoComplete="tel"
      />

      <div>
        <InputField
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          icon={<LockOutlinedIcon fontSize="small" />}
          error={touched.password ? errors.password : undefined}
          autoComplete="new-password"
        />
        <div className="mt-2">
          <PasswordStrength password={formData.password} />
        </div>
      </div>

      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={handleChange("confirmPassword")}
        onBlur={handleBlur("confirmPassword")}
        icon={<LockOutlinedIcon fontSize="small" />}
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        autoComplete="new-password"
      />

      <div>
        <Checkbox
          checked={formData.agreeTerms}
          onChange={() => {
            setFormData({ ...formData, agreeTerms: !formData.agreeTerms });
            setTouched((t) => ({ ...t, agreeTerms: true }));
          }}
          label={
            <>
              I agree to the{" "}
              <button
                type="button"
                onClick={() => onOpenLegal("terms")}
                className="text-[#E8A87C] hover:underline font-semibold"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => onOpenLegal("privacy")}
                className="text-[#E8A87C] hover:underline font-semibold"
              >
                Privacy Policy
              </button>
            </>
          }
          error={touched.agreeTerms ? errors.agreeTerms : undefined}
        />
      </div>

      <motion.button
        whileHover={isValid && !loading ? { scale: 1.01 } : {}}
        whileTap={isValid && !loading ? { scale: 0.99 } : {}}
        type="submit"
        disabled={!isValid || loading}
        className="w-full py-3.5 rounded-xl bg-[#E8A87C] text-[#1c1c1e] font-semibold hover:bg-[#D08860] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#1c1c1e]/30 border-t-[#1c1c1e] rounded-full animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </motion.button>

      <Divider />
      <SocialButtons onSocial={onSocial} />

      <p className="text-center text-sm text-gray-400 pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#E8A87C] hover:text-[#F0C0A0] font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </motion.form>
  );
}

/* ============================================================
 * MAIN COMPONENT
 * ============================================================ */
export const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("login");

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);

  // Modals state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState<SocialProvider | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({
    title: "",
    message: "",
    actionLabel: "",
    onAction: () => {},
  });
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ title: "", message: "" });

  // Restore session from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv_auth_user");
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed?.email) setUser(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem("cv_auth_user", JSON.stringify(u));
      else localStorage.removeItem("cv_auth_user");
    } catch {
      /* ignore */
    }
  };

  const showSuccess = (
    title: string,
    message: string,
    actionLabel?: string,
    onAction?: () => void,
  ) => {
    setSuccessConfig({
      title,
      message,
      actionLabel: actionLabel || "Continue",
      onAction: onAction || (() => setSuccessOpen(false)),
    });
    setSuccessOpen(true);
  };

  const showError = (title: string, message: string) => {
    setErrorConfig({ title, message });
    setErrorOpen(true);
  };

  const navigateByRole = (email: string, name?: string) => {
    const role = detectRole(email);
    const authedUser: AuthUser = {
      name: name || email.split("@")[0] || "User",
      email,
      role,
      avatar: role === "admin" ? "🛡️" : "👤",
    };
    persistUser(authedUser);
    const target = getDashboardPath(role);

    showSuccess(
      role === "admin" ? "Welcome, Administrator!" : "Welcome Back!",
      `You're signed in as ${email}. Redirecting to your ${
        role === "admin" ? "admin " : ""
      }dashboard...`,
      role === "admin" ? "Go to Admin Dashboard" : "Go to Dashboard",
      () => {
        setSuccessOpen(false);
        navigate(target, { replace: false });
      },
    );
  };

  const handleLoginSuccess = (email: string) => {
    navigateByRole(email);
  };

  const handleRegisterSuccess = (email: string, name: string) => {
    navigateByRole(email, name);
  };

  const handleForgotSuccess = () => {
    setForgotOpen(false);
    showSuccess(
      "Email Sent!",
      "We sent a password reset link to your email. Please check your inbox.",
      "Got it",
      () => setSuccessOpen(false),
    );
  };

  const handleSocialContinue = (account: SocialAccount) => {
    setSocialOpen(null);
    setTimeout(() => {
      navigateByRole(account.email, account.name);
      try {
        localStorage.setItem("cv_last_email", account.email);
      } catch {
        /* ignore */
      }
    }, 300);
  };

  const handleSignOut = () => {
    persistUser(null);
    setActiveTab("login");
  };

  const dashboardPath = user ? getDashboardPath(user.role) : "/dashboard";

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex font-sans relative">
      {/* Navbar when signed in */}
      <AnimatePresence>
        {user && (
          <Navbar
            user={user}
            onDashboard={() => navigate(dashboardPath)}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      {user && <div className="h-16" />}

      {/* ---- LEFT: Branding (hidden below lg) ---- */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] 2xl:w-[58%]">
        <Branding />
      </div>

      {/* ---- RIGHT: Form ---- */}
      <div className="w-full lg:w-1/2 xl:w-[45%] 2xl:w-[42%] relative flex flex-col bg-[#1C1C1E]">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-10 sm:py-12 lg:py-16">
          <div className="w-full max-w-md xl:max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="lg:hidden w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E8A87C] flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-[#1c1c1e]">CV</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                {activeTab === "login"
                  ? "Enter your credentials to access your account"
                  : "Sign up to start your crypto journey"}
              </p>
            </motion.div>

            {/* Tabs */}
            <div className="relative grid grid-cols-2 gap-1 p-1 mb-6 sm:mb-8 bg-[#232326] rounded-xl border border-[#3A3A40]">
              {(["login", "register"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-colors z-10 ${
                    activeTab === tab
                      ? "text-[#1c1c1e]"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="absolute inset-0 bg-[#E8A87C] rounded-lg -z-10"
                    />
                  )}
                  {tab === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <LoginForm
                  key="login"
                  onForgotPassword={() => setForgotOpen(true)}
                  onSuccess={handleLoginSuccess}
                  onError={showError}
                  onSocial={(p) => setSocialOpen(p)}
                  onSwitchToRegister={() => setActiveTab("register")}
                />
              ) : (
                <RegisterForm
                  key="register"
                  onSuccess={handleRegisterSuccess}
                  onError={showError}
                  onSocial={(p) => setSocialOpen(p)}
                  onSwitchToLogin={() => setActiveTab("login")}
                  onOpenLegal={(doc) => setLegalDoc(doc)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="text-sm text-gray-50">
            <span className="text-blue-400 font-bold">© 2026</span>{" "}
          </div>
          <Link
            to="https://www.leonakingeneye.live"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-1 pt-1 flex items-center justify-center gap-2"
            >
              <code className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Designed by</span>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Leon
              </span>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* ---- MODALS ---- */}
      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onSuccess={handleForgotSuccess}
      />

      <SocialModal
        isOpen={socialOpen !== null}
        provider={socialOpen || "google"}
        onClose={() => setSocialOpen(null)}
        onContinue={handleSocialContinue}
      />

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />

      <SuccessModal
        isOpen={successOpen}
        title={successConfig.title}
        message={successConfig.message}
        actionLabel={successConfig.actionLabel}
        onAction={successConfig.onAction}
      />

      <ErrorModal
        isOpen={errorOpen}
        title={errorConfig.title}
        message={errorConfig.message}
        onClose={() => setErrorOpen(false)}
      />
    </div>
  );
};