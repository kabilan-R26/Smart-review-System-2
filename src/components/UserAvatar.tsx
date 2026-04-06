import { useEffect, useMemo, useState } from "react";
import type { User } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getDiceBearAvatarUrl, getUserInitials, type AvatarUser } from "@/lib/avatar-utils";

interface UserAvatarProps {
  user: AvatarUser | User;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  user,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const imageSrc = useMemo(() => getDiceBearAvatarUrl(user), [user]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  return (
    <Avatar
      className={cn(
        "rounded-full border border-white/70 shadow-lg shadow-slate-900/10 ring-2 ring-white/50 dark:border-slate-700 dark:ring-slate-900/50",
        className,
      )}
    >
      {!imageFailed && (
        <AvatarImage
          src={imageSrc}
          alt={user.name}
          className={cn("object-cover", imageClassName)}
          onError={() => setImageFailed(true)}
        />
      )}
      <AvatarFallback
        className={cn(
          user.role === "faculty"
            ? "bg-gradient-to-br from-amber-500 to-rose-500 text-white"
            : "bg-gradient-to-br from-sky-500 to-indigo-600 text-white",
          "text-sm font-semibold",
          fallbackClassName,
        )}
      >
        {getUserInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}
