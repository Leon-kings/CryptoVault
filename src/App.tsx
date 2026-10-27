import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Login } from "./pages/login/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Markets } from "./components/markets/Markets";
import { Wallet } from "./components/wallet/Wallet";
import { Settings } from "./components/settings/Settings";

/* ============================================================
 * PRIVATE ROUTE COMPONENT
 * ============================================================ */
const PrivateRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  let user = null;

  // Safely parse the user from localStorage
  try {
    const raw = localStorage.getItem("cv_auth_user");
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    // Ignore JSON parse errors
  }

  // 1. If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. If roles are specified and the user's role doesn't match, redirect to their proper dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "admin" ? "/dashboard/admin" : "/dashboard"}
        replace
      />
    );
  }

  // 3. Render the protected component
  return <Outlet />;
};

/* ============================================================
 * MAIN APP COMPONENT
 * ============================================================ */
export default function App() {
  // Check if user is currently logged in to handle the root "/" redirect
  let currentUser = null;
  try {
    const raw = localStorage.getItem("cv_auth_user");
    if (raw) currentUser = JSON.parse(raw);
  } catch {}

  return (
    <>
      <div className="w-full min-h-screen bg-[#1C1C1E] font-sans">
        <Routes>
          {/* Public Route: Login Page (Root) */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate
                  to={
                    currentUser.role === "admin"
                      ? "/dashboard/admin"
                      : "/dashboard"
                  }
                  replace
                />
              ) : (
                <Login />
              )
            }
          />

          {/* Protected Routes for Regular Users */}
          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<Settings />} />
            {/* Add other user pages here, e.g., /wallet, /markets */}
          </Route>

          {/* Protected Routes for Admins */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<Dashboard />} />
            {/* Add other admin pages here */}
          </Route>

          {/* Catch-All Route: Redirect unknown URLs to the correct dashboard */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  currentUser
                    ? currentUser.role === "admin"
                      ? "/dashboard/admin"
                      : "/dashboard"
                    : "/"
                }
                replace
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}
