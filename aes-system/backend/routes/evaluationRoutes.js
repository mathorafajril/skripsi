
import express from "express";
import { evaluateAnswers, getResults, releaseScores } from "../controllers/evaluationController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:question_id/evaluate", requireAuth, requireRole("admin"), evaluateAnswers);
router.post("/:question_id/release", requireAuth, requireRole("admin"), releaseScores);
router.get("/:question_id/results", requireAuth, getResults);

export default router;