
import pool from "../db/index.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

export const evaluateAnswers = async (req, res) => {
  const { question_id } = req.params;

  // ────────── START STOPWATCH ──────────
  const startTime = process.hrtime();
  // ─────────────────────────────────────

  try {
    const result = await pool.query(`
      SELECT
        a.answer_id,
        a.answer AS student_answer,
        q.question,
        q.key_answer
      FROM answers a
      JOIN questions q ON a.question_id = q.question_id
      WHERE a.question_id = $1
    `, [question_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found or no answers submitted." });
    }

    const mlPayload = {
      answers: result.rows.map(row => ({
        answer_id: String(row.answer_id),
        student_answer: row.student_answer,
        question: row.question,
        key_answer: row.key_answer
      }))
    };

    const mlResponse = await fetch(`${ML_SERVICE_URL}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload)
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.text();
      throw new Error(err.details || "ML service evaluation failed.");
    }

    const { results } = await mlResponse.json();

    await Promise.all(
      results.map((r) =>
        pool.query(
          `UPDATE answers
           SET score_ai    = $1,
               feedback    = $2,
               reviewed_at = NOW()
           WHERE answer_id = $3`,
          [r.score_ai, r.feedback, r.answer_id]
        )
      )
    );

    // ────────── STOP STOPWATCH & LOG DURATION ──────────
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    console.log(`[EVALUATION] Question ${question_id} evaluated in ${elapsedMs} ms`);
    // ───────────────────────────────────────────────────

    return res.status(200).json({
      message: `Successfully evaluated ${results.length} answers for question ${question_id}.`,
      results,
      elapsedMs: parseFloat(elapsedMs)   // optional: return time to frontend
    });

  } catch (error) {
    console.error("Error evaluating answers:", error.message);
    return res.status(500).json({ message: "An error occurred while evaluating answers." });
  }
};

export const getResults = async (req, res) => {
  const { question_id } = req.params;
  const {userId, role} = req.user;

  try {
    let query;
    let params;

    if (role === "admin"){
        query = `
                    SELECT
          a.answer_id,
          cm.student_code,
          q.question,
          q.key_answer,
          q.class_id,
          a.answer,
          a.score_ai,
          a.feedback,
          a.score_released,
          a.submitted_at,
          a.reviewed_at
        FROM answers a
        JOIN questions    q  ON q.question_id  = a.question_id
        JOIN class_members cm ON cm.user_id    = a.user_id
                              AND cm.class_id  = q.class_id
        WHERE a.question_id = $1
        ORDER BY a.submitted_at
      `;
      params = [question_id];    
    } else {
        query = `
        SELECT
          a.answer_id,
          q.question,
          q.class_id,
          a.answer,
          a.score_ai,
          a.feedback,
          a.submitted_at,
          a.reviewed_at
        FROM answers  a
        JOIN questions q ON q.question_id = a.question_id
        WHERE a.question_id = $1
          AND a.user_id     = $2
          AND a.score_released = TRUE
      `;
      params = [question_id, userId];
    }

    const result = await pool.query(query, params);

    return res.status(200).json({ results: result.rows });

    } catch (error) {
        console.error("Error fetching results:", error.message);
        return res.status(500).json({ message: "An error occurred while fetching results." });
    }
};

export const releaseScores = async (req, res) => {
  const { question_id } = req.params;

  try{
    const result = await pool.query(
       `UPDATE answers SET score_released = TRUE
       WHERE question_id = $1
       RETURNING answer_id`,
      [question_id]
    );
    return res.status(200).json({ message: `Scores released for ${result.rowCount} answers.`, });
  } catch (error) {
    console.error("Error releasing scores:", error.message);
    return res.status(500).json({ message: "An error occurred while releasing scores." });
  }
};


