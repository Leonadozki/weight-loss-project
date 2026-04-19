"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AssessmentResult {
  bmi: number;
  bmiCategory: string;
  targetWeight: number;
  weightToLose: number;
  estimatedWeeks: number;
  dailyCalories: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wechat" | "alipay">("wechat");
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("assessmentResult");
    if (!saved) {
      router.push("/assessment");
      return;
    }
    setResult(JSON.parse(saved));

    const status = localStorage.getItem("wla_payment_status");
    if (status === "paid") setPaid(true);
  }, [router]);

  const handlePay = async () => {
    setIsPaying(true);
    await new Promise((r) => setTimeout(r, 2000));
    localStorage.setItem("wla_payment_status", "paid");
    setIsPaying(false);
    setPaid(true);
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">健康减脂</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        {!paid ? (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-dashed border-green-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">评估已完成</h2>
                <p className="text-gray-500 text-sm mt-1">您的个性化减脂方案已生成</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI 指数</span>
                  <span className="font-bold text-gray-900">{result.bmi.toFixed(1)} ({result.bmiCategory})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">目标减重</span>
                  <span className="font-bold text-blue-500">{result.weightToLose.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">预计周期</span>
                  <span className="font-bold text-gray-900">{result.estimatedWeeks} 周</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">建议日摄入</span>
                  <span className="font-bold text-green-500">{result.dailyCalories} kcal</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-xl flex items-start space-x-2">
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-yellow-800">完整报告包含详细饮食计划、运动方案、AI 陪跑指导。支付后即可解锁。</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  <span className="text-sm align-top">¥</span>9.9
                </div>
                <div className="text-sm text-gray-500 line-through mt-1">原价 ¥99</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod("wechat")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                    paymentMethod === "wechat" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <span className="text-2xl">💬</span>
                  <span className="text-sm font-medium text-gray-900 mt-1">微信支付</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("alipay")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                    paymentMethod === "alipay" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <span className="text-2xl">🔵</span>
                  <span className="text-sm font-medium text-gray-900 mt-1">支付宝</span>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6 flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-3">请使用{paymentMethod === "wechat" ? "微信" : "支付宝"}扫码支付</p>
                <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <div className="grid grid-cols-5 gap-1 w-32 h-32">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 7 === 0 || i % 5 === 0 ? "bg-gray-900" : "bg-white"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">订单号：WLA{Date.now().toString(36).toUpperCase().slice(-10)}</p>
              </div>

              <button
                onClick={handlePay}
                disabled={isPaying}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                {isPaying ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>支付中...</span>
                  </>
                ) : (
                  <span>模拟支付成功（演示用）</span>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                注：演示环境，点击按钮即可模拟支付。真实项目需接入微信/支付宝商户 SDK。
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h2>
            <p className="text-gray-600 mb-6">您的个性化减脂报告已解锁</p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">支付方式</span>
                <span className="font-medium text-gray-900">{paymentMethod === "wechat" ? "微信支付" : "支付宝"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">支付金额</span>
                <span className="font-medium text-gray-900">¥9.90</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">支付时间</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleString("zh-CN")}</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/result")}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              查看完整报告
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
