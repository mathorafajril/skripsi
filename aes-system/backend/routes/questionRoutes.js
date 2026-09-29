
import express                                           from "express";
import { createQuestion, getQuestions, togglePublish, submitAnswer, getStudentAnswer, updateQuestion, deleteQuestion }  from "../controllers/questionController.js";
import { evaluateAnswers, getResults, releaseScores }   from "../controllers/evaluationController.js";
import { requireAuth, requireRole }                     from "../middlewares/authMiddleware.js";

const router = express.Router();

// Questions
router.get("/:class_id/questions",              requireAuth,                        getQuestions);
router.post("/questions",                        requireAuth, requireRole("admin"),  createQuestion);
router.put("/questions/:question_id",          requireAuth, requireRole("admin"),  updateQuestion);
router.delete("/questions/:question_id",         requireAuth, requireRole("admin"),  deleteQuestion);
router.patch("/questions/:question_id/publish",  requireAuth, requireRole("admin"),  togglePublish);

// Answer submission (student)
router.post("/questions/:question_id/answer",    requireAuth, requireRole("student"),  submitAnswer);
// GET student's own answer for a question
router.get("/questions/:question_id/answer", requireAuth, getStudentAnswer);
// Evaluation
router.post("/questions/:question_id/evaluate",  requireAuth, requireRole("admin"),  evaluateAnswers);
router.patch("/questions/:question_id/release",  requireAuth, requireRole("admin"),  releaseScores);
router.get("/questions/:question_id/results",    requireAuth,                        getResults);

export default router;
