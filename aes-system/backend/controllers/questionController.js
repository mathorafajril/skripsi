import pool from "../db/index.js";

// ─── Create Question (admin only) ─────────────────────────────────────────────
export const createQuestion = async (req, res) => {
  const { class_id, question, key_answer, is_published } = req.body;
  const createdBy = req.user.userId;
  try {
    if (!class_id || !question?.trim() || !key_answer?.trim()) {
      return res.status(422).json({ message: "Class, question, and key answer are required." });
    }
    const cls = await pool.query(
      "SELECT class_id FROM classes WHERE class_id = $1 AND owner_id = $2",
      [class_id, createdBy]
    );
    if (cls.rows.length === 0) {
      return res.status(403).json({ message: "You do not own this class." });
    }
    const result = await pool.query(
      `INSERT INTO questions (class_id, created_by, question, key_answer, is_published)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING question_id, class_id, question, key_answer, is_published, created_at`,
      [class_id, createdBy, question.trim(), key_answer.trim(), is_published ?? false]
    );
    return res.status(201).json({
      message:  "Question created successfully.",
      question: result.rows[0],
    });
  } catch (error) {
    console.error("Create question error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ─── Get Questions for a Class ────────────────────────────────────────────────
export const getQuestions = async (req, res) => {
  const { class_id } = req.params;
  const { role, userId } = req.user;
  console.log(`[DEBUG] getQuestions - class_id: ${class_id}, userId: ${userId}, role: ${role}`);
  try {
    const result = await pool.query(
      `SELECT
         q.question_id,
         q.question,
         q.is_published,
         q.key_answer,
         q.created_at,
         EXISTS (
           SELECT 1 FROM answers a
           WHERE a.question_id = q.question_id AND a.user_id = $2
         ) AS is_answered
       FROM questions q
       WHERE q.class_id = $1
       ${role === "student" ? "AND q.is_published = TRUE" : ""}
       ORDER BY q.created_at DESC`,
      [class_id, userId]
    );
    console.log(`[DEBUG] Query returned ${result.rows.length} rows, first row is_answered: ${result.rows[0]?.is_answered}`);
    return res.status(200).json({ questions: result.rows });
  } catch (error) {
    console.error("Get questions error:", error.message);
    return res.status(500).json({ message: "Failed to fetch questions." });
  }
};

// ─── Toggle Publish (admin only) ─────────────────────────────────────────────
export const togglePublish = async (req, res) => {
  const { question_id } = req.params;
  const { userId }      = req.user;
  try {
    const check = await pool.query(
      `SELECT q.question_id, q.is_published
       FROM questions q
       JOIN classes c ON c.class_id = q.class_id
       WHERE q.question_id = $1 AND c.owner_id = $2`,
      [question_id, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to modify this question." });
    }
    const newState = !check.rows[0].is_published;
    const result = await pool.query(
      `UPDATE questions SET is_published = $1
       WHERE question_id = $2
       RETURNING question_id, question, is_published`,
      [newState, question_id]
    );
    return res.status(200).json({
      message:  `Question ${newState ? "published" : "unpublished"} successfully.`,
      question: result.rows[0],
    });
  } catch (error) {
    console.error("Toggle publish error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ─── Submit Answer (student) ──────────────────────────────────────────────────
export const submitAnswer = async (req, res) => {
  const { question_id } = req.params;
  const { answer } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    // 1. Validate input
    if (!answer || !answer.trim()) {
      return res.status(422).json({ message: "Answer cannot be empty." });
    }

    // 2. Get question details and its class
    const questionQuery = await pool.query(
      `SELECT q.question_id, q.question, q.is_published, q.class_id, c.exam_start_time, c.exam_duration_minutes
       FROM questions q
       JOIN classes c ON c.class_id = q.class_id
       WHERE q.question_id = $1`,
      [question_id]
    );

    if (questionQuery.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const question = questionQuery.rows[0];
    const classId = question.class_id;

    // 3. Check enrollment
    const enrollment = await pool.query(
      `SELECT 1 FROM class_members WHERE class_id = $1 AND user_id = $2`,
      [classId, userId]
    );
    if (enrollment.rows.length === 0) {
      return res.status(403).json({ message: "You are not enrolled in this class." });
    }

    // 4. Determine if exam is active (for students only)
    let examActive = false;
    if (role === "student") {
      const now = new Date();
      const examStart = question.exam_start_time ? new Date(question.exam_start_time) : null;
      let examEnd = null;
      if (examStart && question.exam_duration_minutes) {
        examEnd = new Date(examStart.getTime() + question.exam_duration_minutes * 60000);
      }
      examActive = examStart && examEnd && now >= examStart && now <= examEnd;
    }

    // 5. Publish check: allow if exam active OR question is published
    if (!examActive && !question.is_published) {
      return res.status(403).json({ message: "Question is not published yet." });
    }

    // 6. Generate a student code if not already exists (should exist from class join)
    //    but ensure we have it for upsert (not strictly needed for answer submission)

    // 7. Upsert answer (insert or update)
    const upsertQuery = `
      INSERT INTO answers (answer_id, question_id, user_id, answer, score_ai, feedback, score_released)
      VALUES (gen_random_uuid(), $1, $2, $3, NULL, NULL, false)
      ON CONFLICT (question_id, user_id) 
      DO UPDATE SET 
        answer = EXCLUDED.answer,
        score_ai = NULL,
        feedback = NULL,
        score_released = false,
        submitted_at = NOW()
      RETURNING answer_id, answer, submitted_at
    `;
    const result = await pool.query(upsertQuery, [question_id, userId, answer.trim()]);

    return res.status(200).json({
      message: "Answer submitted successfully.",
      answer: result.rows[0],
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getStudentAnswer = async (req, res) => {
  const { id: question_id } = req.params;
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT answer, score_ai, feedback, score_released, submitted_at
       FROM answers
       WHERE question_id = $1 AND user_id = $2`,
      [question_id, userId]
    );
    if (result.rows.length === 0) {
      return res.json({ answer: null, score_ai: null, feedback: null, score_released: false });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch answer" });
  }
};

export const updateQuestion = async (req, res) => {
  const { question_id } = req.params;
  const { question, key_answer } = req.body;
  const userId = req.user.userId;

  if (!question || !key_answer) {
    return res.status(400).json({ error: "Question and key_answer are required" });
  }

  try {
    // Verify question exists and user is admin of the class
    const checkQuery = `
      SELECT q.class_id, c.owner_id
      FROM questions q
      JOIN classes c ON q.class_id = c.class_id
      WHERE q.question_id = $1
    `;
    const checkRes = await pool.query(checkQuery, [question_id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    if (checkRes.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Not authorized to edit this question" });
    }

    // Update the question
    const updateQuery = `
      UPDATE questions
      SET question = $1, key_answer = $2, updated_at = NOW()
      WHERE question_id = $3
      RETURNING question_id, question, key_answer, is_published, created_at, updated_at
    `;
    const result = await pool.query(updateQuery, [question, key_answer, question_id]);
    res.json({ message: "Question updated successfully", question: result.rows[0] });
  } catch (err) {
    console.error("updateQuestion error:", err);
    res.status(500).json({ error: "Failed to update question" });
  }
};

export const deleteQuestion = async (req, res) => {
  const { question_id } = req.params;
  const userId = req.user.userId;

  try {
    // Verify ownership and fetch answer count
    const checkQuery = `
      SELECT q.class_id, c.owner_id,
        (SELECT COUNT(*) FROM answers WHERE question_id = q.question_id) as answer_count
      FROM questions q
      JOIN classes c ON q.class_id = c.class_id
      WHERE q.question_id = $1
    `;
    const checkRes = await pool.query(checkQuery, [question_id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    if (checkRes.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this question" });
    }
    const answerCount = parseInt(checkRes.rows[0].answer_count, 10);
    if (answerCount > 0) {
      return res.status(400).json({
        error: "Cannot delete question because student answers already exist. Delete answers first or archive the question."
      });
    }

    // Delete the question (answers cascade? We already checked count >0, safe to delete)
    const deleteQuery = `DELETE FROM questions WHERE question_id = $1 RETURNING question_id`;
    await pool.query(deleteQuery, [question_id]);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("deleteQuestion error:", err);
    res.status(500).json({ error: "Failed to delete question" });
  }
};