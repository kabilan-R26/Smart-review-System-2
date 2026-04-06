import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap, Mail, Lock, Eye, EyeOff,
  ArrowRight, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type View = "login" | "forgot" | "change-password";

export default function FacultyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [view, setView] = useState<View>("login");

  const validateEmail = (val: string): string => {
    if (!val) return "";
    const lower = val.toLowerCase().trim();
    if (lower.endsWith("@vitfaculty.ac.in")) return "";
    return "Please use your faculty email";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    setLoading(true);

    try {
      console.log("LOGIN URL:", "https://smart-review-system-2-1.onrender.com/api/login");

      const response = await fetch("https://smart-review-system-2-1.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: "faculty",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back! Redirecting...");

      // 👉 OPTIONAL: store user
      localStorage.setItem("user", JSON.stringify(data.user));

      // 👉 redirect (optional)
      window.location.href = "/faculty-dashboard";

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Server connection failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div className="w-full max-w-md">
        <div className="text-center mb-6">
          <GraduationCap className="mx-auto text-white" />
          <h1 className="text-2xl text-white">Faculty Portal</h1>
        </div>

        <div className="p-6 rounded-xl bg-black/40">
          <h2 className="text-white mb-4">Sign in</h2>

          {error && (
            <div className="text-red-400 mb-3">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>

          </form>

          <div className="mt-4 text-center">
            <Link to="/student-login">Student Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}