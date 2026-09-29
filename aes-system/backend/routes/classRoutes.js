
import express                                           from "express";
import { createClass, getClasses, getClassById, joinClass, getClassResults, setExamSchedule, getStudentClassResults, getLeaderboard } from "../controllers/classController.js";
import { requireAuth, requireRole }                      from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",              requireAuth,                          getClasses);
router.get("/:class_id/results", requireAuth, requireRole("admin"), getClassResults);
router.patch("/:class_id/exam-schedule", requireAuth, requireRole("admin"), setExamSchedule);
router.get("/:class_id/student-results", requireAuth, requireRole("student"), getStudentClassResults);
router.get("/:class_id/leaderboard", requireAuth, getLeaderboard);
router.get("/:class_id",     requireAuth,                          getClassById);
router.post("/",             requireAuth, requireRole("admin"),     createClass);
router.post("/join",         requireAuth, requireRole("student"),   joinClass);
export default router;
