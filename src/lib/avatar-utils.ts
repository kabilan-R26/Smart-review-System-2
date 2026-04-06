import type { User, UserRole } from "@/contexts/AuthContext";

interface AvatarIdentity {
  name: string;
  role: UserRole;
  profileImage?: string;
}

export type AvatarUser = AvatarIdentity | User;

export function getUserInitials(name: string) {
  return name
    .replace(/^(Dr\.|Prof\.)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getDiceBearAvatarUrl(user: AvatarUser) {
  if (user.profileImage) return user.profileImage;
  const style = user.role === "faculty" ? "avataaars" : "personas";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(user.name)}`;
}
