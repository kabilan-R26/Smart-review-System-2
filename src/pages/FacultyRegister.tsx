import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function FacultyRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) return "";
    return value.includes("@") ? "" : "Please enter a valid email addressing containing '@'";
  };

  const validatePassword = (value: string) => {
    if (!value) return "";
    return value.length >= 6 ? "" : "Password minimum 6 characters";
  };

  const validateConfirmPassword = (value: string, confirmValue: string) => {
    if (!confirmValue) return "";
    return value === confirmValue ? "" : "Passwords do not match";
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    const nextConfirmAuthError = validateConfirmPassword(password, confirmPassword);

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmAuthError);

    if (nextEmailError || nextPasswordError || nextConfirmAuthError) {
      return;
    }

    if (!name || !department) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://smart-review-system-2-1.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "faculty", name, department }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Registration successful");
      navigate("/faculty-login");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Faculty Registration</h1>
        </div>

        <div className="bg-white dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-2xl p-8 shadow-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</Label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Smith"
                className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 w-full text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Faculty Email</Label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                onBlur={() => setEmailError(validateEmail(email))}
                placeholder="name@vitfaculty.ac.in"
                className={`bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 w-full text-gray-900 dark:text-white ${emailError ? "border-red-500" : ""}`}
                required
              />
              {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
            </div>

            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                  if (confirmPassword) setConfirmPasswordError(validateConfirmPassword(e.target.value, confirmPassword));
                }}
                onBlur={() => setPasswordError(validatePassword(password))}
                placeholder="Minimum 6 characters"
                className={`bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 w-full text-gray-900 dark:text-white ${passwordError ? "border-red-500" : ""}`}
                required
              />
              {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
            </div>

            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</Label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                onBlur={() => setConfirmPasswordError(validateConfirmPassword(password, confirmPassword))}
                placeholder="Re-enter password"
                className={`bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 w-full text-gray-900 dark:text-white ${confirmPasswordError ? "border-red-500" : ""}`}
                required
              />
              {confirmPasswordError && <p className="mt-1 text-xs text-red-500">{confirmPasswordError}</p>}
            </div>

            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Department</Label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science"
                className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 w-full text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg py-2 w-full hover:scale-105 transition duration-200 disabled:opacity-70 disabled:hover:scale-100 font-semibold"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Register <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-gray-200 dark:border-white/10 pt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Already have an account? </span>
            <Link to="/faculty-login" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
