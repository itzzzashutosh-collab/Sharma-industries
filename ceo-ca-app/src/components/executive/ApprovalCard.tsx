"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, User2, Calendar } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useState } from "react";
import { approveUser } from "@/app/dashboard/ceo/actions";

interface ApprovalCardProps {
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
    created_at: string;
  };
  index: number;
}

const roleColors: Record<string, string> = {
  dealer: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  salesman: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  cofounder: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  factory: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  ca: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

export function ApprovalCard({ user, index }: ApprovalCardProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"pending" | "approved" | "dismissed">("pending");

  const handleApprove = async () => {
    setStatus("approved");
    await approveUser(user.id);
  };

  const roleColor = roleColors[user.role] || "text-muted-foreground bg-muted border-border";

  const date = new Date(user.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  return (
    <AnimatePresence>
      {status === "pending" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, x: 40 }}
          transition={{ duration: 0.3, delay: index * 0.06 }}
          className="group relative p-4 rounded-xl bg-background border border-border hover:border-primary/25 transition-all duration-300"
        >
          {/* User info */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
              <span className="text-sm font-bold text-foreground">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${roleColor} capitalize`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.phone}</p>
              <div className="flex items-center gap-1 mt-1">
                <Calendar size={10} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{date}</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <form action={handleApprove}>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-primary/8 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all duration-200"
            >
              <CheckCircle size={13} />
              {t("Approve Access")}
            </motion.button>
          </form>
        </motion.div>
      )}
      {status === "approved" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2"
        >
          <CheckCircle size={16} className="text-emerald-500" />
          <span className="text-sm font-medium text-emerald-500">Access granted to {user.name}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
