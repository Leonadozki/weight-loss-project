export interface CheckInData {
  date: string;
  weight?: number;
  dietScore: number;
  exerciseDone: boolean;
  exerciseMinutes?: number;
  mood: "great" | "good" | "neutral" | "tired" | "bad";
  sleepHours?: string;
  notes?: string;
}

export interface AIDailyReport {
  date: string;
  summary: string;
  encouragement: string;
  suggestion: string;
  alert?: string;
}

export function generateAIDailyReport(
  today: CheckInData,
  history: CheckInData[]
): AIDailyReport {
  const parts: string[] = [];
  let alert: string | undefined;

  // Weight analysis
  if (today.weight !== undefined && history.length > 0) {
    const yesterday = history
      .slice()
      .reverse()
      .find((h) => h.date < today.date && h.weight !== undefined);
    if (yesterday && yesterday.weight !== undefined) {
      const diff = today.weight - yesterday.weight;
      if (diff < -0.05) parts.push(`体重下降 ${Math.abs(diff).toFixed(1)} kg，继续保持！`);
      else if (diff > 0.5) alert = `体重有明显回升（+${diff.toFixed(1)} kg），回顾下昨日的饮食和运动情况？`;
      else if (diff > 0) parts.push("体重小幅波动，不用焦虑，关注长期趋势。");
      else parts.push("体重持平，这是平台期的正常现象。");
    } else {
      parts.push(`今日体重 ${today.weight} kg，开始记录你的减脂旅程吧！`);
    }

    // Consecutive trends
    const recent = history
      .filter((h) => h.date <= today.date && h.weight !== undefined)
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .slice(0, 4);
    if (recent.length >= 3) {
      const diffs = [];
      for (let i = 0; i < recent.length - 1; i++) {
        const a = recent[i].weight!;
        const b = recent[i + 1].weight!;
        diffs.push(a - b);
      }
      if (diffs.every((d) => d < -0.05)) {
        parts.push("太棒了！连续多天下降，你的身体正在适应新节奏。");
      } else if (diffs.every((d) => d > 0.05)) {
        alert = alert || "连续多天体重上升，建议检查一下最近的饮食结构。";
      }
    }
  }

  // Diet analysis
  if (today.dietScore >= 4) parts.push("饮食执行完美，给你点赞！");
  else if (today.dietScore === 3) parts.push("饮食中规中矩，尝试下一顿再控制一下份量。");
  else if (today.dietScore <= 2) parts.push("今天饮食有些放松，明天我们一起加油。");

  // Exercise analysis
  if (today.exerciseDone) {
    if ((today.exerciseMinutes || 0) > 45) parts.push("超额完成运动目标，太强了！注意别过度疲劳。");
    else parts.push("按计划完成运动，执行力满分！");
  } else {
    parts.push("今天没运动？没关系，明天补上就好。");
  }

  // Sleep
  if (today.sleepHours !== undefined) {
    if (today.sleepHours === "<6") parts.push("睡眠不足会影响新陈代谢，今晚尽量早睡哦。");
    else if (today.sleepHours === "7-8" || today.sleepHours === ">8") parts.push("睡眠充足，这是减脂的好帮手。");
  }

  // Mood-based encouragement
  const moodEncouragement: Record<string, string[]> = {
    great: ["今天状态满分，保持这个节奏！", "你今天的能量感染到我了，继续冲！"],
    good: ["状态不错，稳扎稳打就是胜利。", "保持良好的心态，减脂成功一半。"],
    neutral: ["平平淡淡才是真，坚持就是胜利。", "不着急，慢慢来，身体正在发生变化。"],
    tired: ["累了就休息，减脂是马拉松不是百米冲刺。", "今天辛苦了，好好休息，明天再战。"],
    bad: [
      "每个人都有低谷，这很正常，不要苛责自己。",
      "今天不开心的话，好好吃一顿健康的饭，早点睡觉。",
    ],
  };
  const pool = moodEncouragement[today.mood] || moodEncouragement.neutral;
  const encouragement = pool[Math.floor(Math.random() * pool.length)];

  // Tomorrow suggestion
  const suggestions = [
    "明天记得多喝水，餐前一杯水能有效控制食量。",
    "明天的目标是蛋白质摄入充足，每餐都要有优质蛋白。",
    "试试把主食换成粗粮，饱腹感更强。",
    "明天安排一次 30 分钟的有氧运动吧。",
    "今晚提前准备好明天的健康零食，避免临时吃垃圾食品。",
  ];
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

  return {
    date: today.date,
    summary: parts.join(" "),
    encouragement,
    suggestion,
    alert,
  };
}

export function getCheckInHistory(): CheckInData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("wla_checkins");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCheckIn(data: CheckInData) {
  const history = getCheckInHistory();
  const idx = history.findIndex((h) => h.date === data.date);
  if (idx >= 0) history[idx] = data;
  else history.push(data);
  localStorage.setItem("wla_checkins", JSON.stringify(history));
}

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export interface Milestone {
  id: string;
  title: string;
  achieved: boolean;
  achievedAt?: string;
}

export function checkMilestones(history: CheckInData[]): Milestone[] {
  const ms: Milestone[] = [];
  const sorted = history.sort((a, b) => (a.date > b.date ? 1 : -1));

  // Consecutive 7 days
  let streak = 0;
  let maxStreak = 0;
  const dates = new Set(sorted.map((h) => h.date));
  const today = getTodayStr();
  let check = new Date(today);
  while (dates.has(check.toISOString().slice(0, 10))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  ms.push({ id: "streak7", title: "周达人（连续打卡7天）", achieved: streak >= 7 });
  ms.push({ id: "streak30", title: "月冠军（连续打卡30天）", achieved: streak >= 30 });

  // Weight loss milestones need start weight from assessment
  const startWeight = getStartWeight();
  if (startWeight && sorted.length > 0) {
    const latest = sorted[sorted.length - 1];
    if (latest.weight) {
      const lost = startWeight - latest.weight;
      const pct = lost / startWeight;
      ms.push({ id: "loss5", title: "初战告捷（减重5%）", achieved: pct >= 0.05 });
      ms.push({ id: "loss10", title: "蜕变之星（减重10%）", achieved: pct >= 0.1 });
    }
  }

  return ms;
}

function getStartWeight(): number | null {
  if (typeof window === "undefined") return null;
  const res = localStorage.getItem("assessmentResult");
  if (!res) return null;
  try {
    const data = JSON.parse(res);
    return data.weightToLose ? data.weightToLose + (data.targetWeight || 0) : null;
  } catch {
    return null;
  }
}
