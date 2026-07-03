import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getAllStats,
  getHabitStats,
  getHeatMap,
  getRange,
  getToday,
  markComplete,
  unmarkComplete,
} from "../controllers/logController.js";

const router = express.Router();

router.use(protect);

router.post("/", markComplete);
router.delete("/", unmarkComplete);
router.get("/today", getToday);
router.get("/range", getRange);
router.get("/heatmap", getHeatMap);
router.get("/stats", getAllStats);
router.get("/stats/:habitId", getHabitStats);

export default router;
