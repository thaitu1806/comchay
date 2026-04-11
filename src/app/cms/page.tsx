"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalVisits: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  ordersInRange?: number;
}

export default function CmsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rangeLoading, setRangeLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats(start?: string, end?: string) {
    try {
      const params = new URLSearchParams();
      if (start && end) {
        params.set("startDate", start);
        params.set("endDate", end);
      }
      const url = `/api/stats${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
      setRangeLoading(false);
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (startDate && endDate) {
      setRangeLoading(true);
      fetchStats(startDate, endDate);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Thống kê tổng quan</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng lượt truy cập" value={stats?.totalVisits ?? 0} />
        <StatCard label="Đơn hàng hôm nay" value={stats?.ordersToday ?? 0} />
        <StatCard label="Đơn hàng tuần này" value={stats?.ordersThisWeek ?? 0} />
        <StatCard label="Đơn hàng tháng này" value={stats?.ordersThisMonth ?? 0} />
      </div>

      {/* Date range filter */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Lọc theo khoảng thời gian</h3>
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!startDate || !endDate || rangeLoading}
            className="px-4 py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 disabled:opacity-50"
          >
            {rangeLoading ? "Đang tải..." : "Xem"}
          </button>
        </form>

        {stats?.ordersInRange !== undefined && (
          <div className="mt-4 p-3 bg-amber-50 rounded">
            <p className="text-sm text-gray-700">
              Đơn hàng trong khoảng:{" "}
              <span className="font-bold text-amber-800">{stats.ordersInRange}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
