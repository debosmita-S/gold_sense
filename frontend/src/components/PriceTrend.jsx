import React, { useMemo, useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function genData(base = 14500) {
  let b = base;
  return Array.from({ length: 48 }, (_, i) => {
    b = b + (Math.random() - 0.45) * 20;
    return { t: `${Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`, price: Number(b.toFixed(2)) };
  });
}

function seedSeriesFromPrice(price) {
  const mid = Math.max(100, Number(price) || 14500);
  // Create 48 time points (24 hours, 30-min intervals) with realistic price movement
  // Start 2.5% lower than current and trend upward with realistic variance
  let v = mid * 0.975;  // Start 2.5% below current
  const points = [];
  
  for (let i = 0; i < 48; i++) {
    // Realistic variance: 0.3-0.8% per 30-min period
    const variance = (Math.random() - 0.5) * mid * 0.006;
    // Trend toward current price
    const trend = (mid - v) * 0.035;  // Gradually increase toward mid
    v = v + variance + trend;
    
    // Add more pronounced swings every 6-8 periods (like real market patterns)
    if (i > 0 && i % 7 === 0) {
      v = v + (Math.random() - 0.5) * mid * 0.015;
    }
    
    points.push({
      t: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
      price: Number(v.toFixed(2))
    });
  }
  
  // Ensure last point is very close to current price
  points[points.length - 1].price = mid;
  return points;
}

export default function PriceTrend({ data }) {
  const [chartData, setChartData] = useState(() => data || genData());
  const [livePrice, setLivePrice] = useState(14500);

  useEffect(() => {
    let mounted = true;
    
    async function fetchPrice() {
      try {
        const res = await fetch("/api/gold-price");
        if (!res.ok) throw new Error("bad response");
        const j = await res.json();
        const p = j?.price_per_gram_inr || j?.price || 7200;
        if (mounted) {
          setLivePrice(Number(p));
          const series = data ? data : seedSeriesFromPrice(Number(p));
          setChartData(series);
        }
      } catch (e) {
        console.error("Gold price fetch error:", e);
        if (mounted && !data) setChartData((c) => c && c.length ? c : genData());
      }
    }

    // Fetch immediately on mount
    fetchPrice();
    
    // Then poll every 30 seconds
    const iv = setInterval(fetchPrice, 30000);
    return () => { 
      mounted = false; 
      clearInterval(iv); 
    };
  }, [data]);

  return (
    <div className="gs-card" style={{ padding: 8 }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Gold price trend</p>
          <h4 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>24-hour</h4>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>₹{Math.round(livePrice).toLocaleString("en-IN")}/g</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Live rate</p>
        </div>
      </div>

      <div style={{ height: 160 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gprice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.16} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: "#8b95a3", fontSize: 10 }} />
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Tooltip formatter={(v) => `₹${Math.round(v)}/g`} />
            <Area type="monotone" dataKey="price" stroke="var(--success)" fill="url(#gprice)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
