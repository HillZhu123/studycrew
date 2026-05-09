const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function typingText(el, text, speed = 16) {
  return new Promise(async (resolve) => {
    el.textContent = "";
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      const ch = text[i];
      const isSpace = ch === " " || ch === "\n";
      const delay = isSpace ? speed * 0.4 : speed;
      await sleep(delay);
    }
    resolve();
  });
}

function normalize(s) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function detectTemplate(topic) {
  const t = normalize(topic);
  if (t.includes("physics") && t.includes("paper") && t.includes("4")) return "physics_paper4_mechanics";
  if (t.includes("力学") && (t.includes("paper 4") || t.includes("paper4") || t.includes("物理"))) return "physics_paper4_mechanics";
  return "physics_paper4_mechanics";
}

function plannerPlan() {
  const blocks = [
    {
      day: "Day 1（今天）",
      items: [
        "20min：把考点拆成‘题型清单’（F=ma / 力矩 / 功与能量）",
        "40min：做 1 轮轻量题（只做会做的，建立信心）",
        "35min：整理错点卡片（只写‘触发点’，例如单位/夹角 cosθ）",
        "25min：复盘总结 + 预告明天的题型顺序"
      ]
    },
    {
      day: "Day 2（明天）",
      items: [
        "30min：知识速记回顾（3 个公式 + 1 条常见坑）",
        "60min：模拟题训练（先做第 1/3/5，再做第 2/4）",
        "30min：错题医生诊断（按‘为什么错’逐条修正）",
        "15min：睡前 5 分钟快刷（把卡片背熟）"
      ]
    },
    {
      day: "Day 3（后天）",
      items: [
        "45min：计时训练（强调审题与单位）",
        "35min：二次巩固（只补最容易丢分的步骤）",
        "20min：家庭复盘（Coach 输出周报口径给你对照）",
        "10min：考试前仪式感：深呼吸 + 公式卡快速翻一遍"
      ]
    }
  ];
  return blocks;
}

function tutorSummary(template) {
  return template.corePoints;
}

function drillQuestions(template) {
  return template.questions;
}

function criticAnalysis(template) {
  const wrong = template.commonWrongReasons;
  return {
    q2: [
      "你在第 2 题（力矩）很可能把“力矩 = 力 × 距离”写反或没用‘有效力臂’。",
      `按常见错因：${wrong[1]}`,
      "补救：支点到力的**垂直距离**才是 d；先画出力与杆的垂线，再读 d。"
    ].join("\n"),
    q4: [
      "你在第 4 题（净功/能量）可能漏掉阻力做负功，或净功符号写错。",
      `按常见错因：${wrong[2]}`,
      "补救：写出 W_net = 重力功 - 阻力功；先算 mgh（有单位），再减 F阻·s，最后确认单位是 J。"
    ].join("\n"),
    general: [
      "做题时用一个固定流程：先写公式→再代入→最后检查单位与符号。",
      "你不需要一次全对：目标是把‘容易错的那一步’变成不会错的动作。"
    ].join("\n")
  };
}

function coachTemplate(template) {
  return template.coachTemplate;
}

async function runDemo() {
  const topic = $("#studyTopic").value || "";
  const container = $("#chatLog");
  container.innerHTML = "";

  const res = await fetch("data/demo_prompts.json");
  const data = await res.json();

  const key = detectTemplate(topic);
  const tpl = data.templates[key] || data.templates.physics_paper4_mechanics;

  const agents = data.agents;

  const planner = plannerPlan().map(d => `**${d.day}**\n${d.items.map(x=>`- ${x}`).join("\n")}`).join("\n\n");
  const tutor = tutorSummary(tpl).map(x=>`- ${x}`).join("\n");
  const drills = drillQuestions(tpl).map((it, idx)=>`**${idx+1}. ${it.q.replace(/^（.*?\）/,'')}**\n答案：${it.a}`).join("\n\n");
  const criticObj = criticAnalysis(tpl);
  const critic = `第 2 题诊断（力矩）：\n${criticObj.q2}\n\n第 4 题诊断（净功/能量）：\n${criticObj.q4}\n\n通用修正：\n${criticObj.general}`;
  const coach = coachTemplate(tpl).map(x=>`- ${x}`).join("\n");

  const payloadByKey = { planner, tutor, drill: drills, critic, coach };
  const order = ["planner","tutor","drill","critic","coach"];

  for (const k of order) {
    const agent = agents.find(a => a.key === k);

    const card = document.createElement("div");
    card.className = "agentMsg";
    card.innerHTML = `
      <div class="agentHeader">
        <span class="agentEmoji">${agent.emoji}</span>
        <div class="agentMeta">
          <div class="agentName">${agent.name}</div>
          <div class="agentRole">${agent.role}</div>
        </div>
      </div>
      <pre class="agentBody"></pre>
    `;

    container.appendChild(card);
    const body = card.querySelector(".agentBody");

    const content = payloadByKey[k];
    const plain = content.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`/g, "");

    await typingText(body, agent.linePrefix + "\n" + plain, 10);
    await sleep(220);
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function attach() {
  const btn = $("#runBtn");
  const topic = $("#studyTopic");
  btn.addEventListener("click", runDemo);
  topic.addEventListener("keydown", (e)=>{ if (e.key === "Enter") runDemo(); });
  // auto-run for screenshot / demo previews
  if (new URLSearchParams(location.search).get("autorun") === "1") {
    topic.value = topic.value || "我周三考 IGCSE Physics Paper 4 力学";
    setTimeout(runDemo, 300);
  }
}

attach();
