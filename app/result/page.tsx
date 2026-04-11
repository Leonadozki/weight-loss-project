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
  recommendations: string[];
  dietPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  exercisePlan: {
    type: string;
    frequency: string;
    duration: string;
  }[];
}

export default function Result() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedResult = localStorage.getItem("assessmentResult");
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-gray-600">正在生成报告...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无评估数据</p>
          <Link
            href="/assessment"
            className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            开始评估
          </Link>
        </div>
      </div>
    );
  }

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
          <nav className="flex space-x-4">
            <Link href="/assessment" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              重新评估
            </Link>
            <Link href="/dashboard" className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
              查看进度
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">评估报告</h1>
          <p className="text-gray-600">基于您的身体数据生成的个性化减脂方案</p>
        </div>

        {/* BMI Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">身体质量指数 (BMI)</h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${
                result.bmi < 18.5 ? 'text-blue-500' :
                result.bmi < 24 ? 'text-green-500' :
                result.bmi < 28 ? 'text-orange-500' : 'text-red-500'
              }`}>{result.bmi.toFixed(1)}</div>
              <div className="text-gray-600">{result.bmiCategory}</div>
            </div>
            <div className="flex-1 mx-8">
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full"
                  style={{
                    background: 'linear-gradient(to right, #60a5fa 0%, #60a5fa 15%, #4ade80 15%, #4ade80 45%, #fb923c 45%, #fb923c 70%, #ef4444 70%, #ef4444 100%)'
                  }}
                />
                <div 
                  className="absolute top-0 w-1 h-full bg-gray-800"
                  style={{ 
                    left: `${Math.min(Math.max((result.bmi - 15) / 20 * 100, 0), 100)}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>偏瘦</span>
                <span>正常</span>
                <span>超重</span>
                <span>肥胖</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{result.weightToLose.toFixed(1)} kg</div>
            <div className="text-gray-600">目标减重量</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">{result.estimatedWeeks} 周</div>
            <div className="text-gray-600">预计达成时间</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{result.dailyCalories}</div>
            <div className="text-gray-600">建议日摄入 (kcal)</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">核心建议</h2>
          <ul className="space-y-3">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">{index + 1}</span>
                </div>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Diet Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">饮食建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-xl">
              <div className="font-medium text-yellow-800 mb-2">早餐</div>
              <div className="text-gray-700">{result.dietPlan.breakfast}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="font-medium text-red-800 mb-2">午餐</div>
              <div className="text-gray-700">{result.dietPlan.lunch}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="font-medium text-blue-800 mb-2">晚餐</div>
              <div className="text-gray-700">{result.dietPlan.dinner}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="font-medium text-green-800 mb-2">加餐</div>
              <div className="text-gray-700">{result.dietPlan.snacks}</div>
            </div>
          </div>
        </div>

        {/* Exercise Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">运动计划</h2>
          <div className="space-y-4">
            {result.exercisePlan.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{exercise.type}</div>
                    <div className="text-sm text-gray-500">{exercise.frequency}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">{exercise.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4 no-print">
          <button 
            onClick={() => window.print()}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            打印报告
          </button>
          <Link
            href="/subscribe"
            className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            获取完整方案
          </Link>
        </div>
      </main>
    </div>
  );
}
