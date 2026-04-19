"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getCheckInHistory, getTodayStr, type CheckInData } from "../lib/coach-rules";

export default function CoachHome() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [todayCheckIn, setTodayCheckIn] = useState<CheckInData | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    const history = getCheckInHistory();
    const today = history.find((h) => h.date === getTodayStr());
    setTodayCheckIn(today || null);

    // Calculate streak
    const dates = new Set(history.map((h) => h.date));
    let s = 0;
    let check = new Date(getTodayStr());
    while (dates.has(check.toISOString().slice(0, 10))) {
      s++;
      check.setDate(check.getDate() - 1);
    }
    setStreak(s);
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!user) return null;

  const dimensions = [
    { key: "weight", label: "体重", icon: "⚖️", done: todayCheckIn?.weight !== undefined },
    { key: "diet", label: "饮食", icon: "🥗", done: todayCheckIn?.dietScore !== undefined && todayCheckIn.dietScore > 0 },
    { key: "exercise", label: "运动", icon: "🏃", done: todayCheckIn?.exerciseDone !== undefined },
    { key: "sleep", label: "睡眠", icon: "😴", done: todayCheckIn?.sleepHours !== undefined },
    { key: "mood", label: "心情", icon: "😊", done: todayCheckIn?.mood !== undefined },
  ];

  const completedCount = dimensions.filter((d) => d.done).length;
  const allDone = completedCount === dimensions.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">健康减脂</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="text-gray-600 hover:text-green-600 text-sm font-medium">
              个人中心
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
              🤖
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {allDone ? `${user.name}，今天的打卡已完成！` : `${user.name}，今天也要加油哦！`}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {allDone
                  ? "AI 教练已为你生成今日日报，去查看吧。"
                  : `已连续打卡 ${streak} 天，完成今日打卡获得 AI 反馈。`}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日打卡状态</h2>
          <div className="grid grid-cols-5 gap-3">
            {dimensions.map((dim) => (
              <div
                key={dim.key}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  dim.done ? "bg-green-50 border-2 border-green-200" : "bg-gray-50 border-2 border-gray-100"
                }`}
              >
                <span className="text-2xl mb-1">{dim.icon}</span>
                <span className={`text-xs font-medium ${dim.done ? "text-green-700" : "text-gray-500"}`}>
                  {dim.label}
                </span>
                {dim.done && (
                  <svg className="w-4 h-4 text-green-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / dimensions.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              已完成 {completedCount} / {dimensions.length} 项
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/coach/checkin"
            className="bg-green-500 text-white p-5 rounded-2xl hover:bg-green-600 transition-colors flex flex-col items-center text-center space-y-2"
          >
            <span className="text-3xl">✏️</span>
            <span className="font-semibold">{allDone ? "修改打卡" : "去打卡"}</span>
          </Link>
          <Link
            href="/coach/progress"
            className="bg-white text-gray-900 p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200 flex flex-col items-center text-center space-y-2"
          >
            <span className="text-3xl">📊</span>
            <span className="font-semibold">查看进度</span>
          </Link>
          <Link
            href="/result"
            className="bg-white text-gray-900 p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200 flex flex-col items-center text-center space-y-2"
          >
            <span className="text-3xl">📋</span>
            <span className="font-semibold">减脂方案</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
