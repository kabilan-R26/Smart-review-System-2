import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type View = "login" | "forgot" | "change-password";

export default function FacultyLogin() {
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
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (user?.mustChangePassword) setView("change-password");
  }, [user?.mustChangePassword]);

  const validateEmail = (val: string): string => {
    if (!val) return "";
    const lower = val.toLowerCase().trim();
    if (lower.endsWith("@vitfaculty.ac.in")) return "";
    return "Please use your faculty email (name.initial@vitfaculty.ac.in)";
  };

  const handleEmailBlur = () => setEmailError(validateEmail(email));
  const isLoginDisabled = !email || !password || loading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const result = login(email, password, "faculty");
    setLoading(false);
    if (!result.success) setError(result.error || "Login failed");
    else toast.success("Welcome back! Redirecting to your dashboard…");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(forgotEmail);
    if (err) { setEmailError(err); return; }
    toast.success("Password reset link sent to " + forgotEmail);
    setView("login");
    setForgotEmail("");
    setEmailError("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPass !== confirmPass) { setError("Passwords do not match"); return; }
    if (newPass.length < 4) { setError("Password must be at least 4 characters"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = changePassword(oldPass, newPass);
    setLoading(false);
    if (!result.success) setError(result.error || "Failed to change password");
    else { toast.success("Password changed successfully!"); setOldPass(""); setNewPass(""); setConfirmPass(""); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md mx-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-glow">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Faculty Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Smart Academic Review System</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="glass-card-elevated p-8 rounded-3xl">
                <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
                    <AlertCircle className="h-4 w-4 shrink-0" />{error}
                  </motion.div>
                )}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Faculty Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <Input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); setError(""); }} onBlur={handleEmailBlur} placeholder="name.initial@vitfaculty.ac.in" className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl h-12 ${emailError ? "border-red-500/60" : ""}`} />
                    </div>
                    {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <Input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Enter your password" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl h-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" />
                      <span className="text-xs text-gray-400">Remember me</span>
                    </label>
                    <button type="button" onClick={() => { setView("forgot"); setError(""); setEmailError(""); }} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</button>
                  </div>
                  <button type="submit" disabled={isLoginDisabled} className="w-full h-12 rounded-xl gradient-btn text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-white/10 text-center">
                  <Link to="/student-login" className="text-sm text-gray-400 hover:text-white transition-colors">Are you a student? <span className="text-purple-400 hover:text-purple-300">Login here →</span></Link>
                </div>
              </div>
            </motion.div>
          )}

          {view === "forgot" && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card-elevated p-8 rounded-3xl">
                <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
                <p className="text-gray-400 text-sm mb-6">Enter your faculty email to receive a reset link</p>
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <Input type="email" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setEmailError(""); }} placeholder="name.initial@vitfaculty.ac.in" className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl h-12 ${emailError ? "border-red-500/60" : ""}`} />
                    </div>
                    {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
                  </div>
                  <button type="submit" className="w-full h-12 rounded-xl gradient-btn text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg">Send Reset Link</button>
                  <button type="button" onClick={() => { setView("login"); setEmailError(""); }} className="w-full text-xs text-gray-400 hover:text-white py-2 transition-colors">← Back to Sign In</button>
                </form>
              </div>
            </motion.div>
          )}

          {view === "change-password" && (
            <motion.div key="change" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card-elevated p-8 rounded-3xl">
                <div className="flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-sm rounded-xl px-4 py-3 mb-5">
                  <AlertCircle className="h-4 w-4 shrink-0" />Please change your default password for security
                </div>
                <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
                    <AlertCircle className="h-4 w-4 shrink-0" />{error}
                  </motion.div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <Input type={showOldPass ? "text" : "password"} value={oldPass} onChange={e => { setOldPass(e.target.value); setError(""); }} placeholder="Enter current password" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl h-12" />
                      <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <Input type={showNewPass ? "text" : "password"} value={newPass} onChange={e => { setNewPass(e.target.value); setError(""); }} placeholder="Minimum 4 characters" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl h-12" />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <Input type="password" value={confirmPass} onChange={e => { setConfirmPass(e.target.value); setError(""); }} placeholder="Re-enter new password" className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl h-12 ${confirmPass && newPass !== confirmPass ? "border-red-500/60" : ""}`} />
                    </div>
                    {confirmPass && newPass !== confirmPass && <p className="text-red-400 text-xs">Passwords do not match</p>}
                  </div>
                  <button type="submit" disabled={!oldPass || !newPass || !confirmPass || loading} className="w-full h-12 rounded-xl gradient-btn text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
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
