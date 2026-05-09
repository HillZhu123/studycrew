# StudyCrew 5-Agent 架构（静态前端版）

本项目在**纯前端**实现“5 个 Agent 轮流输出”的 demo：不用调用后端模型。

## 1) Agent 分工
- PlannerAgent（🗺️）：负责把用户的考试目标拆成 72 小时作战计划（Day1/Day2/Day3 时间块）。
- TutorAgent（📚）：输出 3 个核心知识点速记（以 Physics 力学为例给出 Newton/moment/energy）。
- DrillAgent（⚡）：基于题型模板生成 5 道模拟题，并提供标准答案。
- CriticAgent（🩺）：假设学生错在第 2、4 题，给出错因拆解与补救路线。
- CoachAgent（🧡）：给出鼓励话术与“家长周报摘要”。

## 2) 运行机制（前端）
- `src/js/demo.js` 读取 `src/data/demo_prompts.json`。
- 用户在 demo 输入目标后，前端将目标匹配到 Physics Paper 4（力学）模板。
- 通过“打字机效果 + 轮流发言”将 5 个 Agent 的内容依次渲染到页面。

> 说明：页面不使用 lorem ipsum，所有物理知识点与公式均为可检查的真实表述，并且题目/答案与公式一致。
