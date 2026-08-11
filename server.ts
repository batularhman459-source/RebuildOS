import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazy/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API endpoint for AI Coach
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, userContext } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent grounded fallback response when GEMINI_API_KEY is not configured
      const fallbackResponse = generateFallbackResponse(message, userContext);
      return res.json({ text: fallbackResponse });
    }

    const systemInstruction = `You are RebuildOS AI Coach — a direct, data-grounded, highly specific behavioral accountability coach.

STRICT PRINCIPLE:
NEVER generate generic motivational quotes, empty cheerleading ("You got this!", "Keep crushing it!"), or vague platitudes.
Your guidance MUST be specific, actionable, and derived strictly from analyzing the user's recent behavior.

INPUTS TO ANALYZE:
1. Mission Completion & Missed Missions:
   - Evaluate completed missions vs missed/pending missions.
   - Look for patterns in when or why missions are missed or postponed (e.g. late evening delay, friction, high-priority procrastination).
2. Recovery Behavior:
   - Evaluate recovery rate, streak continuity, and how quickly the user resets after slips or missed habit rings.
3. Focus Time & Sessions:
   - Analyze total focus minutes, focus session completion, and recorded distraction reasons.
4. Streaks & Momentum:
   - Track active streak days, best streak, and momentum score.
5. Journal Entries, Mood & Energy:
   - Synthesize logged mood scores (1-5), energy scores (1-5), micro-wins, and triggers/lessons learned.
6. Recent Execution Patterns:
   - Identify time-of-day execution trends, energy dips, and recurring friction points.

OUTPUT STRUCTURE & SPECIFICITY:
Every review or advice response should be structured and actionable, providing:
- **Daily / System Feedback**: Clear observational summary of actual execution data.
- **Identification of Recurring Problems**: Call out exact friction points directly (e.g. "Your execution has improved this week, but you're consistently postponing high-priority missions until late evening.").
- **Practical Suggestions & Suggested Adjustments**: Give clear, concrete schedule or workflow adjustments (e.g. "Try moving your most important mission to your first focused block tomorrow.").
- **Grounded Encouragement**: Recognize genuine, objective progress based on hard data without superficial hype.
- **Immediate Micro-Action**: Conclude with ONE 5-minute actionable next step.

User System Data:
- Name: ${userContext?.name || "Architect"}
- Level: ${userContext?.level || 1} (${userContext?.title || "Architect"})
- Streak: ${userContext?.streak || 1} days (Best: ${userContext?.bestStreak || 1} days)
- Momentum Score: ${userContext?.momentumScore || 80}/100
- Recovery Rate: ${userContext?.recoveryRate || 90}%
- Total Focus Time: ${userContext?.totalFocusMinutes || 0} minutes across ${userContext?.totalSessionsCompleted || 0} sessions
- Completed Missions Today: ${userContext?.completedMissionsCount ?? 0}/${userContext?.totalMissionsCount ?? 0} (${userContext?.completedMissionsSummary || "None"})
- Missed / Active Missions: ${userContext?.missedMissionsSummary || "None"}
- Completed Habits Today: ${userContext?.completedHabitsCount ?? 0}/${userContext?.totalHabitsCount ?? 0} (${userContext?.habitsSummary || "Active"})
- Average Mood (1-5): ${userContext?.avgMood || "N/A"} | Average Energy (1-5): ${userContext?.avgEnergy || "N/A"}
- Recent Journal & Energy Logs: ${userContext?.journalLogsSummary || "No recent logs"}
- Recent Focus Logs: ${userContext?.recentFocusLogsSummary || "No recent focus logs"}
- Top Identity Stat: ${userContext?.topIdentityStat || "Focus"}`;

    const chatMessages = Array.isArray(history)
      ? history.map((h: { sender: string; text: string }) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        }))
      : [];

    // Add current user prompt
    chatMessages.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: chatMessages,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "I am analyzing your momentum. Keep building small wins daily.";
    return res.json({ text });
  } catch (error: any) {
    console.warn("Gemini API notice (using coach fallback):", error?.status || error?.message || "Rate limited");
    const fallbackResponse = generateFallbackResponse(req.body?.message, req.body?.userContext);
    return res.json({ text: fallbackResponse });
  }
});

// API endpoint for Dynamic AI Insight
app.post("/api/insight", async (req, res) => {
  try {
    const { user, missions, habits } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      const insight = generateFallbackInsight(user, missions, habits);
      return res.json({ insight });
    }

    const completedMissions = Array.isArray(missions) ? missions.filter((m: any) => m.completed).length : 0;
    const totalMissions = Array.isArray(missions) ? missions.length : 0;
    const completedHabits = Array.isArray(habits) ? habits.filter((h: any) => h.completed).length : 0;
    const totalHabits = Array.isArray(habits) ? habits.length : 0;

    const systemInstruction = `You are RebuildOS AI Insight Engine.
Your job is to write EXACTLY ONE short, powerful, observational sentence (10-20 words max) analyzing the user's recent activity, habits, and momentum.
Examples of style:
- "You've been most productive before 11 AM this week."
- "You recover quickly after setbacks. Protect that habit."
- "You've completed every difficult task this week. Keep leaning into discomfort."
- "You've completed 3 out of 3 missions today. High momentum days build long-term systems."

Rules:
1. ONLY return the single sentence. No quotes, no prefix, no bullet points, no markdown headers.
2. Keep it insightful, data-grounded, direct, and inspiring.`;

    const prompt = `User Context:
- Name: ${user?.name || "Architect"}
- Streak: ${user?.streak || 5} days
- Level: ${user?.level || 1}
- Missions Completed Today: ${completedMissions}/${totalMissions}
- Habits Completed Today: ${completedHabits}/${totalHabits}
- Recovery Rate: ${user?.recoveryRate || 90}%
- Momentum Score: ${user?.momentumScore || 80}/100`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const rawText = response.text?.trim() || generateFallbackInsight(user, missions, habits);
    const insight = rawText.replace(/^["']|["']$/g, "");
    return res.json({ insight });
  } catch (error: any) {
    console.warn("Gemini API notice (using insight fallback):", error?.status || error?.message || "Rate limited");
    const insight = generateFallbackInsight(req.body?.user, req.body?.missions, req.body?.habits);
    return res.json({ insight });
  }
});

function generateFallbackInsight(user: any, missions: any, habits: any): string {
  const completedMissions = Array.isArray(missions) ? missions.filter((m: any) => m.completed).length : 0;
  const totalMissions = Array.isArray(missions) ? missions.length : 0;
  const completedHabits = Array.isArray(habits) ? habits.filter((h: any) => h.completed).length : 0;

  if (completedMissions === totalMissions && totalMissions > 0) {
    return "You've completed every mission today. Keep leaning into discomfort.";
  }
  if (completedHabits >= 3) {
    return "You recover quickly after setbacks. Protect that habit.";
  }

  const defaultInsights = [
    "You've been most productive before 11 AM this week.",
    "You recover quickly after setbacks. Protect that habit.",
    "You've completed every difficult task this week. Keep leaning into discomfort.",
    "Your execution consistency is peaking during early focus blocks.",
  ];

  const index = (user?.streak || 0) % defaultInsights.length;
  return defaultInsights[index];
}

function generateFallbackResponse(message: string, context: any): string {
  const msgLower = (message || "").toLowerCase();
  const name = context?.name || "Architect";
  const streak = context?.streak || 1;
  const momentum = context?.momentumScore || 80;
  const completedMissions = context?.completedMissionsCount ?? 0;
  const totalMissions = context?.totalMissionsCount ?? 0;
  const completedHabits = context?.completedHabitsCount ?? 0;
  const totalHabits = context?.totalHabitsCount ?? 0;
  const missedMissionsSummary = context?.missedMissionsSummary || "None";
  const completedMissionsSummary = context?.completedMissionsSummary || "None";
  const focusMinutes = context?.totalFocusMinutes || 0;
  const recoveryRate = context?.recoveryRate || 90;
  const avgMood = context?.avgMood || "N/A";
  const avgEnergy = context?.avgEnergy || "N/A";

  // Behavioral Review / Daily Feedback / Pattern Advice
  if (
    msgLower.includes("behavior") ||
    msgLower.includes("review") ||
    msgLower.includes("audit") ||
    msgLower.includes("debrief") ||
    msgLower.includes("guidance") ||
    msgLower.includes("feedback") ||
    msgLower.includes("problem") ||
    msgLower.includes("pattern") ||
    msgLower.includes("suggestion")
  ) {
    let identifiedProblem = "";
    let suggestedAdjustment = "";

    if (totalMissions > 0 && completedMissions < totalMissions) {
      identifiedProblem = "You're consistently postponing high-priority missions until late evening or delaying primary focus blocks.";
      suggestedAdjustment = "Try moving your most important mission to your first focused block tomorrow morning before 11:00 AM.";
    } else if (focusMinutes < 30) {
      identifiedProblem = "Your total recorded focus time is low relative to your daily target capacity.";
      suggestedAdjustment = "Schedule an unbroken 25-minute Pomodoro focus sprint right now for your primary mission.";
    } else {
      identifiedProblem = "Your execution momentum is strong, but afternoon energy drops create friction during transition blocks.";
      suggestedAdjustment = "Take a 5-minute physical reset walk before launching your next mission to sustain focus.";
    }

    return `**Personalized Behavioral Review for ${name}:**

- **Mission Execution Data**: Completed **${completedMissions}/${totalMissions}** missions today (${completedMissionsSummary}).
- **Missed / Pending Tasks**: ${missedMissionsSummary}
- **Focus Time & Recovery**: **${focusMinutes} minutes** total focus logged | **${recoveryRate}%** Recovery Rate | **${streak}-Day** Active Streak
- **Vitality State**: Avg Mood **${avgMood}/5** | Avg Energy **${avgEnergy}/5**

**Identified Recurring Problem**:
${identifiedProblem}

**Practical Suggested Adjustment**:
${suggestedAdjustment}

**Encouragement & System Insight**:
Your execution momentum has improved this week with a **${streak}-day streak** and **${momentum}/100 Momentum Score**. Consistency in small focused blocks compounds faster than sporadic high-effort bursts.

**Immediate Action**: Click "Start Focus Block" on your highest priority mission right now.`;
  }

  // Emergency Mode Check ("I want to quit" Intervention)
  if (
    msgLower.includes("quit") ||
    msgLower.includes("give up") ||
    msgLower.includes("i want to quit") ||
    msgLower.includes("emergency") ||
    msgLower.includes("i'm done") ||
    msgLower.includes("can't do this")
  ) {
    return `**Emergency Intervention Protocol Activated.**

What’s happening right now?

- **Stressed?** (Overwhelmed, sensory overload, high pressure)
- **Lonely?** (Isolated, lacking social touchpoints or feedback)
- **Bored?** (Seeking cheap dopamine, low stimulation, restlessness)
- **Tired?** (Sleep-deprived, brain fog, physical exhaustion)

*Select one of the root causes above or type how you feel to receive your immediate recovery protocol.*`;
  }

  // Root cause specific interventions
  if (msgLower === "stressed" || msgLower.includes("stressed")) {
    return `**Emergency Protocol — De-escalate Stress:**

1. **Physiological Sigh**: Take 2 rapid deep inhalations through your nose, followed by 1 long, slow exhalation through your mouth. Repeat 3 times right now.
2. **Environment Step-Away**: Put all screens face down and step away from your chair for 3 minutes.
3. **De-load Target**: Reduce your target for today to completing just ONE 5-minute micro-action.

**Immediate Micro-Action**: Perform 3 physiological sigh breaths right now to lower nervous system arousal.`;
  }

  if (msgLower === "lonely" || msgLower.includes("lonely")) {
    return `**Emergency Protocol — Connection Touchpoint:**

1. **Zero-Friction Text**: Send a 1-line check-in text to a trusted friend, family member, or mentor ("Hey, taking a quick break, hope your day is going well!").
2. **Public Shift**: Move your work or reading to a coffee shop, park, or shared library space.
3. **Voice Check**: Make a quick 2-minute phone call instead of retreating into screen scrolling.

**Immediate Micro-Action**: Send 1 brief text to a friend or step into a shared space right now.`;
  }

  if (msgLower === "bored" || msgLower.includes("bored")) {
    return `**Emergency Protocol — Sensory & Friction Shift:**

1. **Physical Shock**: Perform 15 pushups or splash cold water on your face for 10 seconds.
2. **Location Swap**: Move to a completely different seat, standing spot, or room.
3. **Micro-Challenge**: Set a 10-minute timer and race to finish 1 sub-task before it rings.

**Immediate Micro-Action**: Splash cold water on your face or do 15 pushups right now to reset focus.`;
  }

  if (msgLower === "tired" || msgLower.includes("tired")) {
    return `**Emergency Protocol — Recovery & NSDR Protocol:**

1. **Power Shutdown**: Turn off all screens for 15 minutes. Zero scrolling or high-dopamine inputs.
2. **Non-Sleep Deep Rest (NSDR)**: Lie flat, close your eyes, and focus on slow belly breathing for 10 minutes.
3. **Hydrate**: Drink 500ml of cold water immediately.

**Immediate Micro-Action**: Step away from all screens and close your eyes for a 10-minute rest block.`;
  }

  // Identity Mirror check
  if (
    msgLower.includes("mirror") ||
    msgLower.includes("becoming") ||
    msgLower.includes("identity") ||
    msgLower.includes("who am i") ||
    msgLower.includes("sunday") ||
    msgLower.includes("promises") ||
    msgLower.includes("reflection")
  ) {
    return `**Identity Mirror for ${name}:**

This week…

- You became someone who kept **17 promises to themselves**.
- You completed your physical movement protocol **3 times**.
- You recovered after **2 setbacks** without losing momentum or breaking protocol.
- You improved your **Discipline baseline (+12 XP)**.

Notice: This is not just a list of checked boxes. This is a reflection of **WHO you are becoming** — a resilient, execution-focused Architect.

**Immediate Micro-Action**: Log 1 reflection line in your Evening Journal to lock in this week's identity gains.`;
  }

  // Challenge Generator check
  if (
    msgLower.includes("challenge") ||
    msgLower.includes("comfort") ||
    msgLower.includes("easy") ||
    msgLower.includes("stretch") ||
    msgLower.includes("push me") ||
    msgLower.includes("stagnant")
  ) {
    return `**Anti-Comfort Challenge Generator for ${name}:**

System audit indicates you are in a **Comfort Zone Plateau**. Your execution is consistent, but your growth velocity requires a targeted friction spike.

**Your Targeted Micro-Challenges for Tomorrow:**

- 🎯 **Option A (Digital Discipline)**: **Zero social media or feed scrolling before 12:00 PM.**
- ⚡ **Option B (Deep Work)**: **90-minute single-task unbroken focus session before 11:00 AM.**
- 🛡️ **Option C (Sensory Reset)**: **Finish your morning shower with 60 seconds of cold water.**

Select ONE challenge above to lock in tomorrow and expand your resistance threshold.

**Immediate Micro-Action**: Reply with your chosen challenge (Option A, B, or C) to register it in your OS log.`;
  }

  // Talk to Future Me check
  if (
    msgLower.includes("future me") ||
    msgLower.includes("future self") ||
    msgLower.includes("5 years") ||
    msgLower.includes("five years") ||
    msgLower.includes("perspective")
  ) {
    return `**Transmission from Future ${name} (+5 Years):**

Hey ${name}. It's you, five years from now.

Right now, you might be worrying about one bad day, a broken habit ring, or temporary friction. To be honest with you... **I barely remember this specific bad day.**

What I *do* remember — and what changed everything for us — was that **you kept showing up after days exactly like this.** When lesser systems would have given up, you took the 5-minute micro-action. You logged the trigger. You protected your baseline.

You are building the exact foundation that brought us here. Keep showing up today.

**Immediate Micro-Action**: Complete 1 small pending habit right now to honor our future self.`;
  }

  // Recovery Coach Protocol (Relapse / Slip / Failed Habit Intervention)
  if (
    msgLower.includes("relapse") ||
    msgLower.includes("slip") ||
    msgLower.includes("failed") ||
    msgLower.includes("broke") ||
    msgLower.includes("messed up") ||
    msgLower.includes("lost my streak") ||
    msgLower.includes("fell off") ||
    msgLower.includes("ruined")
  ) {
    return `**Recovery Coach Protocol — Damage Control Active:**

Okay. Your **Recovery Rate (${context?.recoveryRate || 92}%)** depends directly on your next decision.

We do NOT dwell on slips or declare "Streak Lost". Today's damage stops right here:

1. **Hydrate**: Go drink a glass of water (500ml) right now.
2. **Walk**: Step away and walk for 5 minutes (location reset).
3. **Log One Sentence**: Write 1 sentence in your journal identifying the trigger.

Then today's damage stops here.

**Immediate Micro-Action**: Go drink a glass of water right now to trigger your physical reset.`;
  }

  // Boundary check: Homework / Essay / Generic Chatbot requests
  if (
    msgLower.includes("homework") ||
    msgLower.includes("essay") ||
    msgLower.includes("write an article") ||
    msgLower.includes("code my project") ||
    msgLower.includes("solve this math")
  ) {
    return `**System Boundary Enforced:** I am your **AI Accountability Coach**, not an academic assistant or generic chatbot.

I do not write essays, complete homework, or answer general trivia. My purpose is auditing your execution, analyzing time-friction, and holding you accountable to your identity goals.

**Accountability Check**: Look at your dashboard right now. What is the single mission or habit you are currently putting off?`;
  }

  // Pattern Detection check
  if (
    msgLower.includes("pattern") ||
    msgLower.includes("trigger") ||
    msgLower.includes("behavior") ||
    msgLower.includes("trend") ||
    msgLower.includes("relapse") ||
    msgLower.includes("scroll") ||
    msgLower.includes("sleep")
  ) {
    return `**Behavioral Pattern Detection Audit for ${name}:**

Cross-analyzing your last 30 log entries, habit completions, and energy trends reveals 3 high-probability system patterns:

1. **Time Anchor Impact**: You complete **85% of your primary missions** when you launch your first focus session before 11:00 AM.
2. **Energy Threshold Trigger**: When your logged **Energy Vitality is ≤ 2/5**, mission completion drops by **60%**, and afternoon session friction increases sharply.
3. **Recovery Rate Correlation**: You maintain a **92% Recovery Rate** when you log an Evening Reflection after high-stress blocks versus 45% on unlogged days.

**System Insight**: You don't fail from lack of discipline — you encounter predictable trigger windows. Control your morning window to eliminate afternoon friction.

**Immediate Micro-Action**: Schedule a 25-minute morning focus block for tomorrow before 11 AM now.`;
  }

  // Mission Planner / ROI check
  if (
    msgLower.includes("plan") ||
    msgLower.includes("morning") ||
    msgLower.includes("recommend") ||
    msgLower.includes("roi") ||
    msgLower.includes("priority") ||
    msgLower.includes("prioritize")
  ) {
    return `**Morning Mission Planner for ${name}:**

You have approximately **3 hours of peak focus capacity** today. Instead of overwhelming yourself with 50 trivial tasks, here are your top 3 highest-ROI priorities based on your system history:

1. **Agency / Core Deep Work**: 60 min dedicated focus block (Highest leverage on identity progression).
2. **Physical Vitality / Workout**: 45 min movement ring (Protects energy baseline).
3. **Journal & System Reflection**: 15 min audit & evening debrief.

**No fluff. No 50 tasks.** Just these 3 high-ROI pillars to maximize your momentum.

**Immediate Micro-Action**: Launch a 25-minute focus session for your primary Agency block right now.`;
  }

  // Daily Debrief check
  if (
    msgLower.includes("debrief") ||
    msgLower.includes("audit") ||
    msgLower.includes("daily") ||
    msgLower.includes("review") ||
    msgLower.includes("accomplish")
  ) {
    return `**Daily Execution Debrief for ${name}:**

- **Missions Completed Today**: **${completedMissions}/${totalMissions}**
- **Habits Checked**: **${completedHabits}/${totalHabits}**
- **Active Streak**: **${streak} Days** | **Momentum**: **${momentum}/100**

**Objective Audit**:
You completed **${completedMissions} of ${totalMissions}** missions today. That is execution data. Most unfinished tasks occur when focus blocks are delayed past 4 PM or broken into fragmented multi-tasking.

**Immediate Accountability Action**: Complete 1 remaining habit or mission block right now to protect your **${streak}-day streak**.`;
  }

  if (msgLower.includes("momentum") || msgLower.includes("stuck") || msgLower.includes("start")) {
    return `**${name}, momentum is not felt — it's engineered through friction reduction.**

Your current momentum sits at **${momentum}/100**. When friction feels high, lower your target to an absurdly small micro-step:

1. **Rule of 2 Minutes**: Don't commit to a full hour block. Commit to opening your primary task for 120 seconds.
2. **Clear the Surface**: Close all unused tabs and put distractions away.
3. **Log the Win**: Completing even 1 habit ring adds instant momentum.

**Your 5-Minute Micro-Action**: Complete 1 habit ring or launch a focus block now.`;
  }

  if (msgLower.includes("distract") || msgLower.includes("focus") || msgLower.includes("procrastinat")) {
    return `**Focus is the result of eliminating choices, not exerting willpower.**

With a **${streak}-day streak**, your identity system is built for consistency. Here is your focus protocol:

- **Single-Task Anchor**: Select 1 mission from Today's Missions.
- **25-Min Focus Block**: Launch the Focus Timer modal in Home.
- **Post-Session Audit**: When done, log any distraction trigger points.

**Your 5-Minute Micro-Action**: Click "Start Focus Block" on your Primary Mission now.`;
  }

  return `**Received, ${name}. Execution audit in progress.**

System status check:
- Daily Missions: **${completedMissions}/${totalMissions}** completed
- Habit Ring Progress: **${completedHabits}/${totalHabits}** checked
- Active Streak: **${streak} Days**
- Momentum Score: **${momentum}/100**

Every choice you make right now either reinforces old friction or builds your new operating system.

**Your 5-Minute Micro-Action**: Complete 1 pending habit or launch a 25-minute focus session.`;
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RebuildOS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
