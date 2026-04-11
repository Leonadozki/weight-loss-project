import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gender, age, height, weight, targetWeight, activityLevel, dietPreference, healthConditions, sleepHours, stressLevel } = body;

    // Calculate BMI
    const heightInMeters = Number(height) / 100;
    const bmi = Number(weight) / (heightInMeters * heightInMeters);

    // Determine BMI category
    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "偏瘦";
    else if (bmi < 24) bmiCategory = "正常";
    else if (bmi < 28) bmiCategory = "超重";
    else bmiCategory = "肥胖";

    // Calculate weight to lose
    const weightToLose = Number(weight) - Number(targetWeight);

    // Calculate estimated weeks (0.5-1kg per week is healthy)
    const estimatedWeeks = Math.ceil(weightToLose / 0.75);

    // Calculate daily calories based on activity level and weight goal
    const baseCalories = gender === "male" ? 88.362 + (13.397 * Number(weight)) + (4.799 * Number(height)) - (5.677 * Number(age)) : 447.593 + (9.247 * Number(weight)) + (3.098 * Number(height)) - (4.330 * Number(age));

    let activityMultiplier = 1.2;
    switch (activityLevel) {
      case "light":
        activityMultiplier = 1.375;
        break;
      case "moderate":
        activityMultiplier = 1.55;
        break;
      case "active":
        activityMultiplier = 1.725;
        break;
    }

    const tdee = Math.round(baseCalories * activityMultiplier);
    const dailyCalories = Math.max(1200, tdee - 500); // Deficit of 500 calories

    // Generate recommendations
    const recommendations = [
      `您的BMI为${bmi.toFixed(1)}，属于${bmiCategory}范围。`,
      `建议每日摄入${dailyCalories}千卡，保持${estimatedWeeks}周可达到目标体重。`,
      weightToLose > 10 ? "减重目标较大，建议分阶段进行，每阶段减少5-8公斤。" : "减重目标适中，坚持即可达成。",
      sleepHours === "<6" ? "睡眠不足会影响新陈代谢，建议保证7-8小时睡眠。" : "睡眠时长良好，继续保持。",
      stressLevel === "high" ? "压力过大会导致皮质醇升高，建议进行冥想或瑜伽缓解压力。" : "压力管理良好，继续保持。",
      healthConditions.includes("糖尿病") ? "您有糖尿病，建议在医生指导下调整饮食。" : null,
      healthConditions.includes("高血压") ? "您有高血压，建议控制钠摄入，多吃蔬菜水果。" : null,
    ].filter(Boolean) as string[];

    // Generate diet plan based on diet preference
    const dietPlans: Record<string, { breakfast: string; lunch: string; dinner: string; snacks: string }> = {
      standard: {
        breakfast: "全麦面包2片 + 鸡蛋1个 + 牛奶250ml + 苹果1个",
        lunch: "米饭100g + 清蒸鱼150g + 西兰花150g + 豆腐汤",
        dinner: "杂粮粥1碗 + 鸡胸肉100g + 凉拌黄瓜 + 少量坚果",
        snacks: "无糖酸奶150g 或 小番茄10个",
      },
      "low-carb": {
        breakfast: "鸡蛋2个 + 牛油果半个 + 培根2片 + 黑咖啡",
        lunch: "烤牛排150g + 蔬菜沙拉（橄榄油调味）+ 芝士片",
        dinner: "烤三文鱼150g + 芦笋150g + 橄榄油拌菠菜",
        snacks: "坚果一小把 或 芝士条",
      },
      "high-protein": {
        breakfast: "蛋白粉1勺 + 燕麦片50g + 香蕉1根 + 鸡蛋2个",
        lunch: "鸡胸肉200g + 藜麦饭100g + 清炒时蔬 + 蛋白粉",
        dinner: "瘦牛肉150g + 红薯150g + 生菜沙拉 + 鸡蛋白2个",
        snacks: "希腊酸奶 或 蛋白棒1根",
      },
      vegetarian: {
        breakfast: "豆浆250ml + 全麦馒头1个 + 水煮蛋1个 + 坚果",
        lunch: "糙米饭100g + 麻婆豆腐 + 炒青菜 + 紫菜蛋花汤",
        dinner: "燕麦粥 + 凉拌豆腐丝 + 蒸南瓜 + 少量芝麻",
        snacks: "水果1份 或 无糖豆浆",
      },
      balanced: {
        breakfast: "全麦面包 + 鸡蛋 + 牛奶 + 水果",
        lunch: "米饭 + 瘦肉/鱼 + 蔬菜 + 汤",
        dinner: "杂粮 + 豆腐/蛋 + 蔬菜 + 少量肉",
        snacks: "酸奶 或 水果",
      },
      intermittent: {
        breakfast: "（禁食期）黑咖啡或无糖茶",
        lunch: "丰盛一餐：蛋白质200g + 蔬菜 + 健康脂肪",
        dinner: "适量进食：蛋白质150g + 蔬菜 + 少量碳水",
        snacks: "禁食期间不进食",
      },
    };

    const dietPlan = dietPlans[dietPreference] || dietPlans.balanced;

    // Generate exercise plan based on activity level
    const exercisePlans: Record<string, { type: string; frequency: string; duration: string }[]> = {
      sedentary: [
        { type: "快走", frequency: "每天", duration: "30分钟" },
        { type: "力量训练", frequency: "每周2次", duration: "20分钟" },
        { type: "拉伸运动", frequency: "每天", duration: "10分钟" },
      ],
      light: [
        { type: "慢跑", frequency: "每周3次", duration: "30分钟" },
        { type: "力量训练", frequency: "每周2次", duration: "30分钟" },
        { type: "瑜伽", frequency: "每周2次", duration: "40分钟" },
      ],
      moderate: [
        { type: "跑步", frequency: "每周3次", duration: "40分钟" },
        { type: "HIIT", frequency: "每周2次", duration: "25分钟" },
        { type: "力量训练", frequency: "每周3次", duration: "45分钟" },
      ],
      active: [
        { type: "高强度间歇训练", frequency: "每周4次", duration: "30分钟" },
        { type: "力量训练", frequency: "每周4次", duration: "60分钟" },
        { type: "有氧运动", frequency: "每周2次", duration: "45分钟" },
      ],
    };

    const exercisePlan = exercisePlans[activityLevel] || exercisePlans.light;

    return NextResponse.json({
      bmi,
      bmiCategory,
      targetWeight: Number(targetWeight),
      weightToLose,
      estimatedWeeks,
      dailyCalories,
      recommendations,
      dietPlan,
      exercisePlan,
    });
  } catch (error) {
    return NextResponse.json({ error: "评估失败" }, { status: 500 });
  }
}
