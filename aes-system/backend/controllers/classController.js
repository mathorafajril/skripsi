
import pool   from "../db/index.js";
import crypto from "crypto";

// ─── Generate a unique student code ──────────────────────────────────────────
const generateStudentCode = () =>
  crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "A3F9BC12"

// ─── Generate a short human-friendly join code ────────────────────────────────
// This is what the admin shares with students so they can enroll.
// 6 uppercase alphanumeric characters, e.g. "BIO202", "XY9K3F"
const generateJoinCode = () =>
  crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars

// ─── Create Class (admin only) ────────────────────────────────────────────────

export const createClass = async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.userId;

  try {
    if (!name || !name.trim()) {
      return res.status(422).json({ message: "Class name is required." });
    }

    let joinCode;
    let isUnique = false;
    while (!isUnique) {
      joinCode = generateJoinCode();
      const check = await pool.query(
        "SELECT 1 FROM classes WHERE join_code = $1",
        [joinCode]
      );
      isUnique = check.rows.length === 0;
    }

    const result = await pool.query(
      `INSERT INTO classes (owner_id, name, description, join_code)
       VALUES ($1, $2, $3, $4)
       RETURNING class_id, name, description, is_active, created_at`,
      [ownerId, name.trim(), description?.trim() || null, joinCode]
    );

    // Admin who creates the class is also added as a member
    const newClass = result.rows[0];
    const studentCode = generateStudentCode();

    await pool.query(
      `INSERT INTO class_members (class_id, user_id, student_code, role)
       VALUES ($1, $2, $3, 'admin')`,
      [newClass.class_id, ownerId, studentCode]
    );

    return res.status(201).json({
      message: "Class created successfully.",
      class:   newClass,
    });

  } catch (error) {
    console.error("Create class error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ─── Get All Classes (admin sees own, student sees enrolled) ──────────────────

export const getClasses = async (req, res) => {
  const { userId, role } = req.user;

  try {
    let query, params;

    if (role === "admin") {
      query = `
        SELECT c.class_id, c.name, c.description, c.join_code,
               c.is_active, c.created_at,
               COUNT(cm.user_id) AS member_count
        FROM classes      c
        LEFT JOIN class_members cm ON cm.class_id = c.class_id
        WHERE c.owner_id = $1
        GROUP BY c.class_id
        ORDER BY c.created_at DESC
      `;
      params = [userId];
    } else {
      query = `
        SELECT c.class_id, c.name, c.description, c.is_active,
               cm.student_code, cm.joined_at
        FROM classes      c
        JOIN class_members cm ON cm.class_id = c.class_id
        WHERE cm.user_id = $1
        ORDER BY cm.joined_at DESC
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    return res.status(200).json({ classes: result.rows });

  } catch (error) {
    console.error("Get classes error:", error.message);
    return res.status(500).json({ message: "Failed to fetch classes." });
  }
};

// ─── Get Single Class ─────────────────────────────────────────────────────────

export const getClassById = async (req, res) => {
  const { class_id } = req.params;
  const { userId, role } = req.user;

  try {
    // ── 1. Fetch class metadata ──────────────────────────────
    const classResult = await pool.query(
      `SELECT c.class_id,
              c.name,
              c.description,
              c.join_code,
              c.is_active,
              c.owner_id,
              c.exam_start_time,
              c.exam_duration_minutes,
              c.created_at,
              c.updated_at,
              COUNT(cm.user_id) FILTER (WHERE cm.role = 'student') AS member_count
         FROM classes c
         LEFT JOIN class_members cm ON cm.class_id = c.class_id
        WHERE c.class_id = $1
        GROUP BY c.class_id`,
      [class_id]
    );

    if (!classResult.rows.length) {
      return res.status(404).json({ error: "Class not found" });
    }

    const classData = classResult.rows[0];

    // ── 2. Compute exam status server-side ───────────────────
    let examStatus = "none";
    let examEndTime = null;

    if (classData.exam_start_time && classData.exam_duration_minutes) {
      const now = new Date();
      const startTime = new Date(classData.exam_start_time);
      const durationMs = classData.exam_duration_minutes * 60 * 1000;
      examEndTime = new Date(startTime.getTime() + durationMs);

      if (now < startTime) {
        examStatus = "upcoming";
      } else if (now < examEndTime) {
        examStatus = "active";
      } else {
        examStatus = "ended";
      }
    }

    // ── 3. Build response base ───────────────────────────────
    const responseBase = {
      ...classData,
      exam_status: examStatus,
      exam_end_time: examEndTime ? examEndTime.toISOString() : null,
    };

    // ── 4. Fetch questions ───────────────────────────────────
    if (role === "admin") {
      // Admin sees every question regardless of exam status
      const questionsResult = await pool.query(
        `SELECT q.question_id,
                q.question,
                q.is_published,
                q.created_at,
                EXISTS(
                  SELECT 1 FROM answers a WHERE a.question_id = q.question_id
                ) AS is_answered
           FROM questions q
          WHERE q.class_id = $1
          ORDER BY q.created_at ASC`,
        [class_id]
      );

      return res.json({ ...responseBase, questions: questionsResult.rows });
    }

    // Student: only show questions when exam is active OR no exam is scheduled
    const canSeeQuestions = examStatus === "active" || examStatus === "none";

    if (!canSeeQuestions) {
      return res.json({ ...responseBase, questions: [] });
    }

    // Build query – during active exam, ignore is_published flag
    let questionsQuery = `
      SELECT q.question_id,
            q.question,
            q.is_published,
            q.created_at,
            EXISTS(
              SELECT 1 FROM answers a
              WHERE a.question_id = q.question_id
                AND a.user_id = $2
            ) AS is_answered
      FROM questions q
      WHERE q.class_id = $1
    `;
    if (examStatus !== "active") {
      questionsQuery += " AND q.is_published = TRUE";
    }
    questionsQuery += " ORDER BY q.created_at ASC";

    const questionsResult = await pool.query(questionsQuery, [class_id, userId]);

    return res.json({ ...responseBase, questions: questionsResult.rows });
  } catch (err) {
    console.error("getClassById error:", err);
    res.status(500).json({ error: "Failed to fetch class" });
  }
};

// ─── Set Exam Schedule ─────────────────────────────────────────────────────────

export const setExamSchedule = async (req, res) => {
  const { class_id } = req.params;
  const { exam_start_time, exam_duration_minutes } = req.body;
  const { userId, role } = req.user;

  // Validate duration when a start time is provided
  if (exam_start_time !== null && exam_start_time !== undefined) {
    const mins = parseInt(exam_duration_minutes, 10);
    if (!mins || mins < 1 || mins > 1440) {
      return res.status(400).json({
        error: "exam_duration_minutes must be between 1 and 1440 (24 h)",
      });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE classes
         SET exam_start_time      = $1,
             exam_duration_minutes = $2,
             updated_at           = NOW()
       WHERE class_id = $3
         AND owner_id = $4
       RETURNING class_id, name, exam_start_time, exam_duration_minutes`,
      [
        exam_start_time ? new Date(exam_start_time) : null,
        exam_duration_minutes ? parseInt(exam_duration_minutes, 10) : null,
        class_id,
        userId,
      ]
    );

    if (!result.rows.length) {
      return res
        .status(404)
        .json({ error: "Class not found or you are not the owner" });
    }

    res.json({ message: "Exam schedule updated", class: result.rows[0] });
  } catch (err) {
    console.error("setExamSchedule error:", err);
    res.status(500).json({ error: "Failed to update exam schedule" });
  }
};


// ─── Join Class (student only) ────────────────────────────────────────────────

export const joinClass = async (req, res) => {
  const { join_code } = req.body;
  const userId        = req.user.userId;

  try {
    if (!join_code || !join_code.trim()) {
      return res.status(422).json({ message: "Join code is required." });
    }

    // Look up class by join_code (case-insensitive)
    const cls = await pool.query(
      `SELECT class_id, name
       FROM classes
       WHERE UPPER(join_code) = UPPER($1) AND is_active = TRUE`,
      [join_code.trim()]
    );

    if (cls.rows.length === 0) {
      return res.status(404).json({ message: "Invalid join code. Please check and try again." });
    }

    const { class_id, name } = cls.rows[0];

    // Check if already enrolled
    const existing = await pool.query(
      "SELECT 1 FROM class_members WHERE class_id = $1 AND user_id = $2",
      [class_id, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "You are already enrolled in this class." });
    }

    // Generate a unique anonymous student code for this enrollment
    let studentCode;
    let isUnique = false;
    while (!isUnique) {
      studentCode = generateStudentCode();
      const check = await pool.query(
        "SELECT 1 FROM class_members WHERE class_id = $1 AND student_code = $2",
        [class_id, studentCode]
      );
      isUnique = check.rows.length === 0;
    }

    await pool.query(
      `INSERT INTO class_members (class_id, user_id, student_code, role)
       VALUES ($1, $2, $3, 'student')`,
      [class_id, userId, studentCode]
    );

    return res.status(201).json({
      message:      `Successfully joined ${name}!`,
      student_code: studentCode,
    });

  } catch (error) {
    console.error("Join class error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getClassResults = async (req, res) => {
  const { class_id } = req.params;
 
  try {
    const result = await pool.query(
      `SELECT
         q.question_id,
         LEFT(q.question, 70)                          AS question_short,
         q.question,
         q.is_published,
         ROW_NUMBER() OVER (ORDER BY q.created_at ASC) AS question_number,
         COUNT(a.answer_id)                            AS total_answers,
         COUNT(a.score_ai)                             AS scored_count,
         ROUND(AVG(a.score_ai)::numeric, 1)            AS avg_score,
         MIN(a.score_ai)                               AS min_score,
         MAX(a.score_ai)                               AS max_score,
         COUNT(a.answer_id) FILTER (WHERE a.score_released = true) AS released_count,
         COALESCE(
           json_agg(
             json_build_object(
               'student_code', cm.student_code,
               'score_ai',     a.score_ai,
               'score_released', a.score_released
             ) ORDER BY cm.student_code
           ) FILTER (WHERE a.answer_id IS NOT NULL),
           '[]'::json
         ) AS answers
       FROM questions q
       LEFT JOIN answers      a  ON a.question_id = q.question_id
       LEFT JOIN class_members cm ON cm.user_id = a.user_id
                                  AND cm.class_id = q.class_id
       WHERE q.class_id = $1
       GROUP BY q.question_id, q.question, q.is_published, q.created_at
       ORDER BY q.created_at ASC`,
      [class_id]
    );
 
    res.json({ classResults: result.rows });
  } catch (err) {
    console.error("getClassResults error:", err);
    res.status(500).json({ error: "Failed to fetch class results" });
  }
};

export const getStudentClassResults = async (req, res) => {
  const { class_id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT 
         q.question_id,
         q.question,
         q.is_published,
         a.answer,
         a.score_ai,
         a.feedback,
         a.score_released,
         a.submitted_at
       FROM questions q
       LEFT JOIN answers a 
         ON a.question_id = q.question_id AND a.user_id = $2
       WHERE q.class_id = $1
       ORDER BY q.created_at ASC`,
      [class_id, userId]
    );

    res.json({ results: result.rows });
  } catch (err) {
    console.error("getStudentClassResults error:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

// ========== LEADERBOARD ==========
export const getLeaderboard = async (req, res) => {
  const { class_id } = req.params;
  const userId = req.user.userId;

  try {
    // Verify user is a member of the class OR the class owner
    const membership = await pool.query(
      `SELECT 1 FROM class_members WHERE class_id = $1 AND user_id = $2
   UNION
   SELECT 1 FROM classes WHERE class_id = $1 AND owner_id = $2`,
      [class_id, userId]
    );
    if (membership.rowCount === 0) {
      return res.status(403).json({ error: "You are not a member of this class" });
    }

    // Leaderboard query:
    // For each student in the class, compute average AI score across all questions
    // where score_released = true. Only include questions that are published.
    const leaderboard = await pool.query(
      `SELECT 
         cm.student_code,
         COUNT(a.score_ai) AS answers_scored,
         ROUND(AVG(a.score_ai)::numeric, 1) AS average_score,
         SUM(a.score_ai) AS total_score
       FROM class_members cm
       JOIN users u ON cm.user_id = u.user_id
       LEFT JOIN answers a ON a.user_id = cm.user_id
       LEFT JOIN questions q ON a.question_id = q.question_id
       WHERE cm.class_id = $1
         AND u.role = 'student'
         AND q.class_id = $1
         AND a.score_released = true
         AND q.is_published = true
       GROUP BY cm.student_code
       ORDER BY average_score DESC NULLS LAST`,
      [class_id]
    );

    // Add rank
    const rows = leaderboard.rows;
    let rank = 1;
    let prevScore = null;
    for (let i = 0; i < rows.length; i++) {
      if (prevScore !== null && rows[i].average_score < prevScore) {
        rank = i + 1;
      }
      rows[i].rank = rank;
      prevScore = rows[i].average_score;
    }

    res.json({ leaderboard: rows });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};