import express from "express";
import { protect } from "../middleware/auth.js";
import {
  archiveHabit,
  createdHabit,
  deleteHabit,
  getHabits,
  reorderHabits,
  updateHabit,
} from "../controllers/habitController.js";

const router = express.Router();

router.use(protect);

router.get("/", getHabits);
router.post("/", createdHabit);
router.put("/reorder", reorderHabits);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);
router.put("/:id/archive", archiveHabit);

export default router;
