import { cookies } from "next/headers";
import { MilestoneTracker } from "@/components/MilestoneTracker";

export default async function DealerDashboard() {
  const cookieStore = await cookies();
  const session = JSON.parse(cookieStore.get("si_session")?.value || "{}");

  // Mock data for gamification
  const currentBags = 300;
  const targetBags = 500;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Welcome, {session.name} 🏪
        </h2>
        <p className="text-white/40 mt-1">
          Your dealer portal — orders and inventory
        </p>
      </div>

      {/* Gamification Tracker */}
      <MilestoneTracker 
        level={2}
        current={currentBags}
        target={targetBags}
        unit="Bags Sold"
        bonusAmount="₹2,000"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "My Orders",
            value: "24",
            icon: "📦",
            color: "from-violet-500/20 to-fuchsia-500/20",
            border: "border-violet-500/20",
          },
          {
            label: "Outstanding Balance",
            value: "₹2,30,000",
            icon: "💳",
            color: "from-amber-500/20 to-orange-500/20",
            border: "border-amber-500/20",
          },
          {
            label: "Products Available",
            value: "56",
            icon: "🧪",
            color: "from-cyan-500/20 to-blue-500/20",
            border: "border-cyan-500/20",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={` bg-white/[0.03] border ${stat.border} rounded-2xl p-5 hover:bg-white/[0.06] transition-all duration-300`}
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
            >
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className=" bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Place Order", icon: "🛒" },
            { label: "View Invoices", icon: "🧾" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-violet-500/10 hover:border-violet-500/20 transition-all duration-300 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {action.icon}
              </span>
              <span className="text-sm font-medium text-white/60 group-hover:text-white/90">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
