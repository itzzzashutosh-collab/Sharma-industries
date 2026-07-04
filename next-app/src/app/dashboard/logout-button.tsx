"use client";

import { logout } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="px-3 py-1.5 rounded-lg bg-foreground/5 border border-foreground/10 text-sm font-medium text-foreground/70 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-300"
      >
        Sign Out
      </button>
    </form>
  );
}
