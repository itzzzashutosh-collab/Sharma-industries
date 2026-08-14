"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Factory } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface ChartDataPoint {
  date: string;
  manufactured: number;
  dispatched: number;
}

interface FactoryHealthWidgetProps {
  chartData: ChartDataPoint[];
  totalRawMaterialValue: number;
  totalFinishedGoodsValue: number;
}

export function FactoryHealthWidget({ chartData, totalRawMaterialValue, totalFinishedGoodsValue }: FactoryHealthWidgetProps) {
  const { t } = useLanguage();
  const totalFactoryValue = totalRawMaterialValue + totalFinishedGoodsValue;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full lg:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Factory size={22} className="text-primary" />
            {t("Operations & Factory Health")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{t("Production vs. Dispatch (Last 7 Days)")}</p>
        </div>
        
        <div className="bg-background border border-border rounded-xl p-4 text-right shadow-inner min-w-[200px]">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("Current Factory Value")}</p>
          <p className="text-2xl font-black text-primary drop-shadow-md">
            ₹{totalFactoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorManufactured" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B4FF36" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#B4FF36" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDispatched" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--muted-foreground)" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--muted-foreground)" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)', 
                borderRadius: '12px', 
                color: 'var(--foreground)' 
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area 
              type="monotone" 
              dataKey="manufactured" 
              name="Manufactured (Buckets)"
              stroke="#B4FF36" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorManufactured)" 
              activeDot={{ r: 6, fill: '#B4FF36', stroke: '#111215', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="dispatched" 
              name="Dispatched (Buckets)"
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorDispatched)" 
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#2e1065', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{t("Raw Material Value")}</p>
          <p className="text-lg font-semibold text-foreground">₹{totalRawMaterialValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{t("Finished Goods Value")}</p>
          <p className="text-lg font-semibold text-foreground">₹{totalFinishedGoodsValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </div>
  );
}
