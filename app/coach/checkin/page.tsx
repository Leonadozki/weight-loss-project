"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  getCheckInHistory,
  getTodayStr,
  saveCheckIn,
  generateAIDailyReport,
  type CheckInData,
  type AIDailyReport,
} from "../../lib/coach-rules";

const MOODS = [
  { value: "great" as const, label: "超棒", emoji: "🤩" },
  { value: "good" as const, label: "不错", emoji: "😊" },
  { value: "neutral" as const, label: "一般", emoji: "😐" },
  { value: "tired" as const, label: "疲惫", emoji: "😴" },
  { value: "bad" as const, label: "糟糕", emoji: "😔" },
];

export default function CheckInPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<AIDailyReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [data, setData] = useState<Partial<CheckInData>>({
    date: getTodayStr(),
    dietScore: 3,
    exerciseDone: false,
    mood: "good",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    const history = getCheckInHistory();
    const today = history.find((h) => h.date === getTodayStr());
    if (today) setData({ ...today });
  }, [user, isLoading, router]);

  const steps = [
    { key: "weight", title: "今日体重", emoji: "⚖️" },
    { key: "diet", title: "饮食情况", emoji: "🥗" },
    { key: "exercise", title: "运动情况", emoji: "🏃" },
    { key: "sleep", title: "睡眠质量", emoji: "😴" },
    { key: "mood", title: "今日心情", emoji: "😊" },
  ];

  const handleSubmit = () => {
    if (!data.weight) { setStep(0); return; }
    const full: CheckInData = {
      date: getTodayStr(),
      weight: Number(data.weight),
      dietScore: data.dietScore || 3,
      exerciseDone: data.exerciseDone || false,
      exerciseMinutes: data.exerciseMinutes ? Number(data.exerciseMinutes) : undefined,
      mood: data.mood || "good",
      sleepHours: data.sleepHours || undefined,
      notes: data.notes,
    };
    const history = getCheckInHistory();
    saveCheckIn(full);
    const aiReport = generateAIDailyReport(full, history);
    setReport(aiReport);
    setShowReport(true);
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/coach" className="text-gray-600 hover:text-green-600 flex items-center space-x-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">每日打卡</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {!showReport ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>步骤 {step + 1} / {steps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <span className="text-4xl">{steps[step].emoji}</span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">{steps[step].title}</h2>
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.weight || ""}
                    onChange={(e) => setData({ ...data, weight: parseFloat(e.target.value) || undefined })}
                    placeholder="65.5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 text-center text-2xl font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 text-center">建议每天固定时间称重，如早起空腹</p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">今日饮食执行情况</label>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1, 0].map((score) => (
                      <button
                        key={score}
                        onClick={() => setData({ ...data, dietScore: score })}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          data.dietScore === score ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < score ? "text-yellow-400" : "text-gray-200"}>★</span>
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">
                            {score === 5 ? "完美执行" : score === 4 ? "基本达标" : score === 3 ? "中规中矩" : score === 2 ? "有些松懈" : score === 1 ? "严重偏离" : "完全没控制"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">今天运动了吗？</label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setData({ ...data, exerciseDone: true })}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        data.exerciseDone ? "border-green-500 bg-green-50" : "border-gray-200"
                      }`}
                    >
                      <span className="text-2xl">✅</span>
                      <div className="font-medium text-gray-900 mt-1">完成了</div>
                    </button>
                    <button
                      onClick={() => setData({ ...data, exerciseDone: false })}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        data.exerciseDone === false ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                    >
                      <span className="text-2xl">❌</span>
                      <div className="font-medium text-gray-900 mt-1">未完成</div>
                    </button>
                  </div>
                  {data.exerciseDone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">运动时长（分钟）</label>
                      <input
                        type="number"
                        value={data.exerciseMinutes || ""}
                        onChange={(e) => setData({ ...data, exerciseMinutes: parseInt(e.target.value) || undefined })}
                        placeholder="30"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">昨晚睡了多久？</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["<6", "6-7", "7-8", ">8"].map((h) => (
                      <button
                        key={h}
                        onClick={() => setData({ ...data, sleepHours: h })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          data.sleepHours === h ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <span className="font-medium text-gray-900">{h}h</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">现在心情如何？</label>
                  <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setData({ ...data, mood: m.value })}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          data.mood === m.value ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-xs text-gray-600 mt-1">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
                    <textarea
                      value={data.notes || ""}
                      onChange={(e) => setData({ ...data, notes: e.target.value })}
                      placeholder="今天有什么想跟教练说的..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
                >
                  上一步
                </button>
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="px-8 py-3 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600"
                  >
                    完成打卡
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* AI Report */
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🤖</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">AI 教练日报</h2>
              <p className="text-gray-500 text-sm">{getTodayStr()}</p>
            </div>

            {report?.alert && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex items-start space-x-3">
                <span className="text-orange-500 text-xl">⚠️</span>
                <p className="text-orange-800 text-sm">{report.alert}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 今日总结</h3>
                <p className="text-gray-800 text-sm leading-relaxed">{report?.summary}</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-green-800 mb-2">💪 教练鼓励</h3>
                <p className="text-green-900 text-sm leading-relaxed">{report?.encouragement}</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 明日建议</h3>
                <p className="text-blue-900 text-sm leading-relaxed">{report?.suggestion}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/coach/progress"
                className="block w-full text-center bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                查看进度
              </Link>
              <Link
                href="/coach"
                className="block w-full text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                返回陪跑主页
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
