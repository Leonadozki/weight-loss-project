"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AssessmentData {
  gender: string;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  activityLevel: string;
  dietPreference: string;
  healthConditions: string[];
  sleepHours: string;
  stressLevel: string;
}

export default function Assessment() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<AssessmentData>({
    gender: "",
    age: "",
    height: "",
    weight: "",
    targetWeight: "",
    activityLevel: "",
    dietPreference: "",
    healthConditions: [],
    sleepHours: "",
    stressLevel: "",
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof AssessmentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: "healthConditions", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      submitAssessment();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAssessment = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem("assessmentResult", JSON.stringify(result));
        // Simulate professional analysis delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsGenerating(false);
        router.push("/result");
      }
    } catch (error) {
      setIsGenerating(false);
      console.error("提交失败:", error);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.gender &&
          formData.age &&
          formData.height &&
          formData.weight &&
          formData.targetWeight
        );
      case 2:
        return formData.activityLevel && formData.dietPreference;
      case 3:
        return formData.sleepHours && formData.stressLevel;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">健康减脂</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">身体评估</h1>
            <span className="text-sm text-gray-500">
              步骤 {currentStep} / {totalSteps}
            </span>
          </div>
              步骤 {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8">
          {currentStep === 1 && (
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                基本信息
              </h2>
                基本信息
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性别
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["male", "female"].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleInputChange("gender", gender)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.gender === gender
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <span className="text-lg text-gray-900">
                        {gender === "male" ? "👨" : "👩"}
                      </span>
                      <span className="ml-2 text-gray-900">
                        {gender === "male" ? "男" : "女"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年龄
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="请输入年龄"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    placeholder="175"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    当前体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    placeholder="70"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标体重 (kg)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) =>
                      handleInputChange("targetWeight", e.target.value)
                    }
                    placeholder="65"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.weight && formData.height) {
                        // 基于BMI 22计算理想体重
                        const idealWeight = (22 * Math.pow(Number(formData.height) / 100, 2)).toFixed(1);
                        handleInputChange("targetWeight", idealWeight);
                      }
                    }}
                    disabled={!formData.weight || !formData.height}
                    className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400 whitespace-nowrap"
                  >
                    自动建议
                  </button>
                </div>
                {formData.weight && formData.height && (
                  <p className="text-xs text-gray-500 mt-2">
                    基于BMI 22计算的理想体重建议
                  </p>
                )}
              </div>

            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                生活习惯
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日常活动量
                </label>
                <div className="space-y-3">
                  {[
                    {
                      value: "sedentary",
                      label: "久坐不动",
                      desc: "办公室工作，很少运动",
                    },
                    { value: "light", label: "轻度活动", desc: "每周运动1-2次" },
                    {
                      value: "moderate",
                      label: "中度活动",
                      desc: "每周运动3-5次",
                    },
                    {
                      value: "active",
                      label: "高度活动",
                      desc: "每周运动6-7次",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleInputChange("activityLevel", option.value)
                      }
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.activityLevel === option.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  饮食偏好
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "standard", label: "标准饮食" },
                    { value: "low-carb", label: "低碳水" },
                    { value: "high-protein", label: "高蛋白" },
                    { value: "vegetarian", label: "素食" },
                    { value: "intermittent", label: "间歇性断食" },
                    { value: "balanced", label: "均衡饮食" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleInputChange("dietPreference", option.value)
                      }
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.dietPreference === option.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <span className="text-gray-900">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                健康状况
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日均睡眠时长
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {["<6", "6-7", "7-8", ">8"].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => handleInputChange("sleepHours", hours)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.sleepHours === hours
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <span className="text-gray-900">{hours}小时</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  压力水平
                </label>
                <div className="space-y-3">
                  {[
                    {
                      value: "low",
                      label: "低压力",
                      desc: "生活轻松，心态平和",
                    },
                    {
                      value: "moderate",
                      label: "中等压力",
                      desc: "有一定压力，但能应对",
                    },
                    {
                      value: "high",
                      label: "高压力",
                      desc: "压力很大，经常焦虑",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleInputChange("stressLevel", option.value)
                      }
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.stressLevel === option.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  健康状况（多选）
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "高血压",
                    "糖尿病",
                    "心脏病",
                    "甲状腺问题",
                    "关节问题",
                    "无特殊疾病",
                  ].map((condition) => (
                    <button
                      key={condition}
                      onClick={() =>
                        handleMultiSelect("healthConditions", condition)
                      }
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.healthConditions.includes(condition)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <span className="text-gray-900">{condition}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-8">
              {isGenerating ? (
                <div className="py-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    正在分析您的身体数据
                  </h2>
                  <p className="text-gray-600 mb-6">
                    AI 智能算法正在为您生成个性化减脂方案...
                  </p>
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>分析身体质量指数 (BMI)...</span>
                    </div>
                    <div
                      className="flex items-center space-x-3 text-sm text-gray-600"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>计算基础代谢率 (BMR)...</span>
                    </div>
                    <div
                      className="flex items-center space-x-3 text-sm text-gray-600"
                      style={{ animationDelay: "0.4s" }}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>生成个性化饮食建议...</span>
                    </div>
                    <div
                      className="flex items-center space-x-3 text-sm text-gray-600"
                      style={{ animationDelay: "0.6s" }}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>制定科学运动计划...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    准备生成报告
                  </h2>
                  <p className="text-gray-600 mb-8">
                    感谢您完成评估！我们将根据您提供的信息生成个性化的减脂方案。
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                      评估摘要
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">
                          BMI 指数
                        </span>
                        <span className="font-bold text-gray-900 text-lg">
                          {formData.weight && formData.height
                            ? (
                                Number(formData.weight) /
                                Math.pow(Number(formData.height) / 100, 2)
                              ).toFixed(1)
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">
                          目标减重
                        </span>
                        <span className="font-bold text-gray-900 text-lg">
                          {formData.weight && formData.targetWeight
                            ? `${(
                                Number(formData.weight) -
                                Number(formData.targetWeight)
                              ).toFixed(1)} kg`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">
                          活动水平
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.activityLevel || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">
                          饮食偏好
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.dietPreference || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1 || isGenerating}
              className={`px-6 py-3 rounded-xl font-medium ${
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              上一步
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid() || isGenerating}
              className={`px-8 py-3 rounded-xl font-medium ${
                isStepValid() && !isGenerating
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isGenerating
                ? "分析中..."
                : currentStep === totalSteps
                ? "生成报告"
                : "下一步"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
