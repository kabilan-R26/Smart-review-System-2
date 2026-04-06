import { useState } from "react";
import { Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "Kabilan Raj");
  const [email, setEmail] = useState(user?.email ?? "kabilan.raj@vitfaculty.ac.in");
  const [department, setDepartment] = useState(user?.department ?? "Computer Science");
  const [bio, setBio] = useState(
    user?.role === "faculty"
      ? "Faculty dashboard owner focused on reviews, analytics, and student communication."
      : "Student profile ready for subject progress and messaging updates.",
  );

  if (!user) return null;

  const handleSave = () => {
    toast.success("Profile details saved locally for this session.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-8 py-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">Profile</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Your account overview</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            Review your identity, contact information, and dashboard role in one place.
          </p>
        </div>

        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex flex-col items-center text-center">
              <UserAvatar user={user} className="h-28 w-28 border-4 border-white dark:border-slate-800" fallbackClassName="text-2xl" />
              <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{name}</h2>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{email}</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Role</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{toRoleLabel(user.role)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Department</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{department}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Account</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Active and authenticated
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit details</h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                Update the core information displayed around the dashboard. The form is session-based for now.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Full Name</Label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Email</Label>
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Role</Label>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <UserRound className="mr-2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  {toRoleLabel(user.role)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Department</Label>
                <Input
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="h-12 border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">About</Label>
              <Textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                className="border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                className="h-12 rounded-xl bg-purple-600 px-6 text-white hover:bg-purple-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
