"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getCheckInHistory, getTodayStr, checkMilestones } from "../lib/coach-rules";

interface AssessmentHistory {
  date: string;
  bmi: number;
  weight: number;
  targetWeight: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [streak, setStreak] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // Load mock assessment history
    setHistory([
      { date: "2026-04-06", bmi: 24.5, weight: 70, targetWeight: 65 },
      { date: "2026-03-01", bmi: 25.2, weight: 72, targetWeight: 65 },
      { date: "2026-02-01", bmi: 26.0, weight: 74, targetWeight: 65 },
    ]);

    // Load coach data
    const checkins = getCheckInHistory();
    const dates = new Set(checkins.map((h) => h.date));
    setTodayChecked(dates.has(getTodayStr()));

    let s = 0;
    let check = new Date(getTodayStr());
    while (dates.has(check.toISOString().slice(0, 10))) {
      s++;
      check.setDate(check.getDate() - 1);
    }
    setStreak(s);
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">健康减脂</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">欢迎，{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h1>
          <p className="text-gray-600">查看您的减脂进度和历史记录</p>
        </div>

        {/* AI Coach Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">🤖 AI 减脂陪跑</h2>
              <p className="text-green-100 text-sm">
                {todayChecked
                  ? `今日已打卡，已连续打卡 ${streak} 天！`
                  : streak > 0
                  ? `已连续打卡 ${streak} 天，今天别忘了打卡哦`
                  : "开始每日打卡，AI 教练全程陪伴你的减脂之旅"}
              </p>
            </div>
            <Link
              href="/coach"
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-medium hover:bg-green-50 transition-colors whitespace-nowrap"
            >
              {todayChecked ? "查看陪跑" : "去打卡"}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-1">当前BMI</div>
            <div className="text-3xl font-bold text-green-500">24.5</div>
            <div className="text-sm text-gray-600 mt-1">正常范围</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-1">已减重</div>
            <div className="text-3xl font-bold text-blue-500">4.0 kg</div>
            <div className="text-sm text-gray-600 mt-1">目标还差 1.0 kg</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-1">坚持天数</div>
            <div className="text-3xl font-bold text-orange-500">{streak} 天</div>
            <div className="text-sm text-gray-600 mt-1">继续加油！</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">评估历史</h2>
            <Link
              href="/assessment"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              新的评估
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">BMI</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">体重 (kg)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">目标体重 (kg)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">进度</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-4 px-4">{record.date}</td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        record.bmi < 24 ? "text-green-500" : "text-orange-500"
                      }`}>
                        {record.bmi.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">{record.weight}</td>
                    <td className="py-4 px-4">{record.targetWeight}</td>
                    <td className="py-4 px-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((74 - record.weight) / (74 - record.targetWeight)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <Link
                href="/assessment"
                className="block w-full text-center bg-green-50 text-green-700 py-3 rounded-xl hover:bg-green-100 transition-colors"
              >
                开始新的评估
              </Link>
              <Link
                href="/result"
                className="block w-full text-center bg-blue-50 text-blue-700 py-3 rounded-xl hover:bg-blue-100 transition-colors"
              >
                查看最新报告
              </Link>
              <Link
                href="/coach/progress"
                className="block w-full text-center bg-purple-50 text-purple-700 py-3 rounded-xl hover:bg-purple-100 transition-colors"
              >
                查看陪跑进度
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">会员服务</h3>
            <div className="space-y-3">
              <Link
                href="/subscribe"
                className="block w-full text-center bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-colors"
              >
                升级会员获取完整方案
              </Link>
              <p className="text-sm text-gray-600 text-center">
                解锁个性化饮食计划、1对1教练指导等更多功能
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
