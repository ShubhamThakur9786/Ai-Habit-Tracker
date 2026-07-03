import "dotenv/config";
import mongoose from "mongoose";
import { format, subDays } from "date-fns";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Habit from "../models/Habit.js";
import Habitlog from "../models/Habitlog.js";
import AIInsight from "../models/AIInsight.js";

const EMAIL = "shubham@example.com";
const PASSWORD = "password123";
const NAME = "Shubham Singh";

const HABITS = [
  {
    name: "Drink 2L of Water",
    description: "Stay hydrated throughout the day.",
    category: "Health",
    frequency: "daily",
    targetDays: 7,
    color: "#0ea5e9",
    icon: "💧",
    _streakProb: 0.95,
  },
  {
    name: "Morning Walk",
    description: "Take a 30-minute walk every morning.",
    category: "Fitness",
    frequency: "daily",
    targetDays: 7,
    color: "#22c55e",
    icon: "🚶",
    _streakProb: 0.85,
  },
  {
    name: "Read 20 Pages",
    description: "Read at least 20 pages of a book.",
    category: "Study",
    frequency: "daily",
    targetDays: 7,
    color: "#8b5cf6",
    icon: "📚",
    _streakProb: 0.8,
  },
  {
    name: "Meditate",
    description: "Practice mindfulness for 10 minutes.",
    category: "Health",
    frequency: "daily",
    targetDays: 7,
    color: "#f59e0b",
    icon: "🧘",
    _streakProb: 0.75,
  },
  {
    name: "Workout",
    description: "Complete a 45-minute workout session.",
    category: "Fitness",
    frequency: "daily",
    targetDays: 6,
    color: "#ef4444",
    icon: "🏋️",
    _streakProb: 0.7,
  },
  {
    name: "Code Practice",
    description: "Solve at least one coding problem.",
    category: "Work",
    frequency: "daily",
    targetDays: 7,
    color: "#6366f1",
    icon: "💻",
    _streakProb: 0.9,
  },
  {
    name: "Journal Writing",
    description: "Write down thoughts and reflections.",
    category: "Personal",
    frequency: "daily",
    targetDays: 7,
    color: "#ec4899",
    icon: "📓",
    _streakProb: 0.65,
  },
  {
    name: "Family Time",
    description: "Spend at least 30 minutes with family.",
    category: "Personal",
    frequency: "daily",
    targetDays: 7,
    color: "#14b8a6",
    icon: "👨‍👩‍👧‍👦",
    _streakProb: 0.88,
  },
];

const todayKey = () => format(new Date(), "yyyy-MM-dd");

const buildLogs = (habit, totalDays = 90) => {
  const logs = [];
  const today = new Date();
  for (let i = 0; i < totalDays; i++) {
    const d = subDays(today, i);
    const dow = d.getDay();
    const key = format(d, "yyyy-MM-dd");
    let p = habit._streakProb;

    if (habit._pattern === "weekdays") {
      if (dow === 0 || dow === 6) {
        p *= 0.35;
      }
    }
    if (habit._pattern === "dropoff") {
      if (i < 14) p *= 0.25;
    }
    if (habit.brokeAt && i >= habit.brokeAt - 2 && i <= habit.brokeAt + 2) {
      continue;
    }

    const seed = Math.sin(i * 9301 + habit.name.length * 49297) * 233280;
    const rnd = seed - Math.floor(seed);

    if (rnd < p) logs.push({ completedDate: key });
  }
  return logs;
};

const run = async () => {
  await connectDB();

  let user = await User.findOne({ email: EMAIL });

  if (user) {
    console.log(`Found existing user ${EMAIL} - clearing their data...`);
    await Habit.deleteMany({ userId: user._id });
    await Habitlog.deleteMany({ userId: user._id });
    await AIInsight.deleteMany({ userId: user._id });
    user.name = NAME;
    user.avatar = NAME.charAt(0).toUpperCase();
    user.morningMotivation = true;
    user.password = PASSWORD;
    await user.save();
  } else {
    user = await User.create({
      name: NAME,
      email: EMAIL,
      password: PASSWORD,
      avatar: NAME.charAt(0).toUpperCase(),
      morningMotivation: true,
    });
    console.log(`Created user ${EMAIL}`);
  }

  const createdHabits = [];
  for (let i = 0; i < HABITS.length; i++) {
    const h = HABITS[i];
    const habit = await Habit.create({
      userId: user._id,
      name: h.name,
      description: h.description,
      category: h.category,
      frequency: h.frequency,
      targetDays: h.targetDays,
      color: h.color,
      icon: h.icon,
      order: i,
      createdAt: subDays(new Date(), 89),
      updatedAt: subDays(new Date(), 89),
    });
    habit.createdAt = subDays(new Date(), 89);
    await habit.save({ timestamps: false });
    createdHabits.push({ habit, config: h });
  }

  let totalLogs = 0;
  for (const { habit, config } of createdHabits) {
    const logs = buildLogs(config);
    if (!logs.length) continue;
    const docs = logs.map((l) => ({
      userId: user._id,
      habitId: habit._id,
      completedDate: l.completedDate,
    }));
    await Habitlog.insertMany(docs, { ordered: false }).catch(() => {});
    totalLogs += docs.length;
  }

  const today = todayKey();
  const todayDoneHabits = createdHabits.slice(0, 4).map((c) => c.habit);
  for (const h of todayDoneHabits) {
    await Habitlog.updateOne(
      { userId: user._id, habitId: h._id, completedDate: today },
      {
        $setOnInsert: {
          userId: user._id,
          habitId: h._id,
          completedDate: today,
        },
      },
      { upsert: true }
    );
  }

  console.log(`\n✅ Seed complete`);
  console.log(`   User:     ${EMAIL}`);
  console.log(`   Password:     ${PASSWORD}`);
  console.log(`   Habits:     ${createdHabits.length}`);
  console.log(`   Logs:     -${totalLogs}`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error("Seed failed: ", err);
  await mongoose.disconnect();
  process.exit(1);
});
