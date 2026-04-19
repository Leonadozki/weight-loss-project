"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getCheckInHistory, checkMilestones, type CheckInData, type Milestone } from "../../lib/coach-rules";

export default function ProgressPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [history, setHistory] = useState<CheckInData[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    const h = getCheckInHistory().sort((a, b) => (a.date > b.date ? 1 : -1));
    setHistory(h);
    setMilestones(checkMilestones(h));
  }, [user, isLoading, router]);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const weights = history.filter((h) => h.weight !== undefined).map((h) => h.weight!);
    const avgDiet = history.reduce((s, h) => s + h.dietScore, 0) / history.length;
    const exerciseCount = history.filter((h) => h.exerciseDone).length;
    const startWeight = weights[0] || 0;
    const latestWeight = weights[weights.length - 1] || 0;
    return {
      totalDays: history.length,
      weightLost: startWeight - latestWeight,
      avgDiet: avgDiet.toFixed(1),
      exerciseRate: Math.round((exerciseCount / history.length) * 100),
      currentWeight: latestWeight,
      startWeight,
    };
  }, [history]);

  const weightPoints = useMemo(() => {
    const entries = history.filter((h) => h.weight !== undefined);
    if (entries.length < 2) return [];
    const min = Math.min(...entries.map((e) => e.weight!));
    const max = Math.max(...entries.map((e) => e.weight!));
    const range = max - min || 1;
    return entries.map((e, i) => ({
      x: (i / (entries.length - 1)) * 100,
      y: 100 - ((e.weight! - min) / range) * 100,
      label: e.date.slice(5),
      weight: e.weight,
    }));
  }, [history]);

  // Calendar for current month
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dateSet = new Set(history.map((h) => h.date));
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: d, checked: dateSet.has(dateStr) });
    }
    return days;
  }, [history]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/coach" className="text-gray-600 hover:text-green-600 flex items-center space-x-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">减脂进度</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.totalDays}</div>
              <div className="text-xs text-gray-500 mt-1">打卡天数</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {stats.weightLost > 0 ? `-${stats.weightLost.toFixed(1)}` : stats.weightLost.toFixed(1)} kg
              </div>
              <div className="text-xs text-gray-500 mt-1">累计减重</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.avgDiet}</div>
              <div className="text-xs text-gray-500 mt-1">平均饮食分</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{stats.exerciseRate}%</div>
              <div className="text-xs text-gray-500 mt-1">运动完成率</div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500">还没有打卡记录，开始你的第一次打卡吧！</p>
            <Link href="/coach/checkin" className="inline-block mt-4 bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600">
              去打卡
            </Link>
          </div>
        )}

        {/* Weight Chart */}
        {weightPoints.length > 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">体重变化趋势</h2>
            <div className="relative h-48 w-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                ))}
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                  points={weightPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                />
                {/* Dots */}
                {weightPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#22c55e" />
                ))}
              </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              {weightPoints.filter((_, i) => i % Math.ceil(weightPoints.length / 5) === 0).map((p, i) => (
                <span key={i}>{p.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">打卡日历</h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) =>
              day ? (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                    day.checked
                      ? "bg-green-500 text-white font-medium"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {day.date}
                </div>
              ) : (
                <div key={i} />
              )
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">里程碑</h2>
          <div className="space-y-3">
            {milestones.map((ms) => (
              <div key={ms.id} className={`flex items-center space-x-3 p-3 rounded-xl ${ms.achieved ? "bg-green-50" : "bg-gray-50"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${ms.achieved ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {ms.achieved ? "🏆" : "🔒"}
                </div>
                <div>
                  <div className={`font-medium ${ms.achieved ? "text-green-800" : "text-gray-500"}`}>{ms.title}</div>
                  {ms.achieved && <div className="text-xs text-green-600">已达成</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
