"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useLanguage } from "@/components/LanguageProvider";

interface ExpenseData {
  name: string;
  value: number;
}

interface ExpensePieChartProps {
  data: ExpenseData[];
}

const COLORS = ["#B4FF36", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        {t("No expense data available for this month.")}
      </div>
    );
  }

  // Translate category names if available
  const translatedData = data.map((d) => ({
    ...d,
    name: t(d.name),
  }));

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={translatedData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {translatedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              borderRadius: "12px",
              color: "var(--foreground)",
            }}
            itemStyle={{ color: "var(--foreground)" }}
            formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
