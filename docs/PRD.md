# 健康减脂评估系统 — 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位
一款面向 C 端用户的健康减脂评估与 AI 陪跑工具。用户通过身体评估获得个性化减脂方案，随后由 AI 教练全程陪跑，提升方案执行率和减脂成功率。

### 1.2 核心价值
- **科学评估**：基于 BMI、BMR、TDEE 等多维指标生成方案
- **AI 陪跑**：每日打卡 + AI 反馈，解决"知道但做不到"的痛点
- **动态调整**：根据执行数据自动优化饮食和运动计划

### 1.3 目标用户
- 20-45 岁有减脂需求的上班族
- 尝试过多种减脂方法但反复失败的 yo-yo 人群
- 希望获得结构化指导但无力负担私教费用的用户

---

## 2. 功能模块

### 2.1 用户系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 注册 | 本次完善 | 邮箱+密码+姓名，表单验证，密码强度 |
| 登录 | 本次完善 | 邮箱+密码，记住我，路由保护 |
| 退出 | 已有 | 清除登录态 |
| 全局状态 | 本次新增 | AuthContext 管理登录态 |

### 2.2 评估系统（已有）

4 步评估 → 方案生成 → 报告展示

### 2.3 AI 陪跑系统（本次核心新增）

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 每日打卡 | P0 | 体重、饮食、运动、心情、睡眠 5 维打卡 |
| AI 日报 | P0 | 基于打卡数据生成每日反馈和鼓励 |
| 进度看板 | P0 | 体重曲线、完成率、里程碑 |
| 周度回顾 | P1 | 每周总结 + 下周调整建议 |
| 里程碑 | P2 | 达成目标触发奖励 |

---

## 3. 信息架构

```
/
├── /auth/login          登录
├── /auth/register       注册
├── /assessment          身体评估
├── /result              评估报告
├── /dashboard           个人中心
├── /coach               AI 陪跑主页
│   ├── /coach/checkin   每日打卡
│   └── /coach/chat      AI 对话
└── /api/assessment      方案生成 API
```

---

## 4. 数据模型

### User
```ts
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
```

### DailyCheckIn
```ts
interface DailyCheckIn {
  date: string;
  weight?: number;
  dietScore: number;      // 0-5
  exerciseDone: boolean;
  exerciseMinutes?: number;
  mood: 'great' | 'good' | 'neutral' | 'tired' | 'bad';
  sleepHours?: number;
  notes?: string;
}
```

### AIDailyReport
```ts
interface AIDailyReport {
  date: string;
  summary: string;
  encouragement: string;
  suggestion: string;
  alert?: string;
}
```

---

## 5. 技术栈

- Next.js 16 + React 19 + Tailwind CSS 4
- React Context + localStorage
- 纯前端 MVP，后续可接真实 AI API 和后端
