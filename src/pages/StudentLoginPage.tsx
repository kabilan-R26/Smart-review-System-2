import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

type View = "login" | "forgot" | "change-password";

export default function StudentLoginPage() {
  const { login, changePassword, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [view, setView] = useState<View>("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (user?.mustChangePassword) setView("change-password");
  }, [user?.mustChangePassword]);

  const validateEmail = (value: string) => {
    if (!value) return "";
    return value.toLowerCase().trim().endsWith("@vitstudent.ac.in")
      ? ""
      : "Please use your student email (name.year@vitstudent.ac.in).";
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const nextEmailError = validateEmail(email);
    if (nextEmailError) {
      setEmailError(nextEmailError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Server connection failed. Please ensure the backend is running.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
      }

      if (data?.user?.role !== "student") {
        throw new Error("Please use student email for this portal");
      }

      login(data.user);
      toast.success("Welcome back. Redirecting to your dashboard...");
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (event: React.FormEvent) => {
    event.preventDefault();
    const nextEmailError = validateEmail(forgotEmail);
    if (nextEmailError) {
      setEmailError(nextEmailError);
      return;
    }

    toast.success(`Password reset link sent to ${forgotEmail}`);
    setForgotEmail("");
    setEmailError("");
    setView("login");
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = changePassword(oldPassword, newPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to change password.");
      return;
    }

    toast.success("Password changed successfully.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const cardClassName = "glass-card-elevated rounded-[32px] border border-slate-200 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800";
  const fieldClassName = "field-surface h-12 rounded-2xl pl-10 pr-10";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-blue-500/18 blur-[110px]" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-cyan-500/14 blur-[130px]" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/8 blur-[170px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Student Portal</h1>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Smart Academic Review System</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div key="student-login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
              <div className={cardClassName}>
                <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">Sign in to your account</h2>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setEmailError("");
                          setError("");
                        }}
                        onBlur={() => setEmailError(validateEmail(email))}
                        placeholder="name.year@vitstudent.ac.in"
                        className={`${fieldClassName} ${emailError ? "border-rose-400 dark:border-rose-500/60" : ""}`}
                      />
                    </div>
                    {emailError && <p className="text-xs text-rose-600 dark:text-rose-400">{emailError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError("");
                        }}
                        placeholder="Enter your password"
                        className={fieldClassName}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox checked={rememberMe} onCheckedChange={(value) => setRememberMe(Boolean(value))} className="border-slate-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 dark:border-slate-600" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setError("");
                        setEmailError("");
                      }}
                      className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!email || !password || loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <Link to="/student-register" className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                    New user? <span className="font-semibold text-blue-600 dark:text-blue-400">Register here</span>
                  </Link>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5 text-center dark:border-slate-800">
                  <Link to="/faculty-login" className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                    Are you faculty? <span className="font-semibold text-blue-600 dark:text-blue-400">Login here</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {view === "forgot" && (
            <motion.div key="student-forgot" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className={cardClassName}>
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Reset Password</h2>
                <p className="mb-6 text-sm text-slate-700 dark:text-slate-300">Enter your student email to receive a reset link.</p>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                      <Input
                        type="email"
                        value={forgotEmail}
                        onChange={(event) => {
                          setForgotEmail(event.target.value);
                          setEmailError("");
                        }}
                        placeholder="name.year@vitstudent.ac.in"
                        className={`${fieldClassName} ${emailError ? "border-rose-400 dark:border-rose-500/60" : ""}`}
                      />
                    </div>
                    {emailError && <p className="text-xs text-rose-600 dark:text-rose-400">{emailError}</p>}
                  </div>

                  <button type="submit" className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:scale-[1.01]">
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setEmailError("");
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  >
                    Back to Sign In
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {view === "change-password" && (
            <motion.div key="student-change" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className={cardClassName}>
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Please change your default password for security.
                </div>

                <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">Change Password</h2>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                      <Input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} placeholder="Enter current password" className={fieldClassName} />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                      <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Minimum 4 characters" className={fieldClassName} />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                      <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter new password" className={fieldClassName} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!oldPassword || !newPassword || !confirmPassword || loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Update Password</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
