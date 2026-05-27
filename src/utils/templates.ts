import { moment } from "obsidian";

export function getDiaryTemplate(): string {
  const today = moment().format("YYYY-MM-DD");
  return `---
tags:
  - 日记
type: 日记
date: ${today}
学习状态: 已阅读
---

# ${today} 日记

## 今日要事

- [ ] 任务 1
- [ ] 任务 2
- [ ] 任务 3

## 今日记录

### 上午


### 下午


### 晚上


## 今日收获


## 明日计划

`;
}

export function getTopicTemplate(type: string, title: string): string {
  const today = moment().format("YYYY-MM-DD");
  return `---
tags:
  - 选题
type: ${type}
status: 待评估
created: ${today}
updated: ${today}
deadline: ""
学习状态: 待阅读
---

# ${title}

## 背景


## 目标


## 进展记录

### ${today}
- 创建选题

## 参考资料

`;
}

export function getWeeklyPlanTemplate(): string {
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  const startOfWeek = moment().startOf("isoWeek").format("MM.DD");
  const endOfWeek = moment().endOf("isoWeek").format("MM.DD");
  const weekId = `${year}-W${weekNum}`;

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = moment().startOf("isoWeek").add(i, "days");
    days.push(`### ${day.format("dddd")} (${day.format("MM.DD")})`);
  }

  return `---
tags:
  - 功能
  - 周计划
type: 周计划
week: "${weekId}"
start_date: ${moment().startOf("isoWeek").format("YYYY-MM-DD")}
end_date: ${moment().endOf("isoWeek").format("YYYY-MM-DD")}
status: 进行中
---

# ${year} 年第 ${weekNum} 周计划

> ${startOfWeek} — ${endOfWeek}

## 本周目标

- [ ] 目标 1
- [ ] 目标 2
- [ ] 目标 3

## SAP 学习

- [ ] 学习内容 1
- [ ] 学习内容 2

## 项目任务

- [ ] 任务 1
- [ ] 任务 2

## 写作/选题

- [ ] 选题 1
- [ ] 选题 2

## 每日进展

${days.map((d) => `${d}\n- `).join("\n")}

## 本周回顾

### 完成了什么


### 未完成/延期


### 下周准备

`;
}

export function getDiaryPath(): string {
  return `日记/${moment().format("YYYY-MM-DD")}.md`;
}

export function getWeeklyPlanPath(): string {
  const weekNum = moment().format("WW");
  const year = moment().format("YYYY");
  return `日记/${year}-W${weekNum}-本周计划.md`;
}

export function getTopicPath(title: string): string {
  const today = moment().format("YYYY-MM-DD");
  const safeTitle = title.replace(/[\/\\:*?"<>|]/g, "-");
  return `选题/${today}-${safeTitle}.md`;
}
