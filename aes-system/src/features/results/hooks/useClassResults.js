// src/features/results/hooks/useClassResults.js
import { useState, useEffect } from "react";
import { ACCESS_TOKEN_NAME } from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetches aggregated score data for all questions in a class.
 * Used to render the class-level score distribution chart.
 *
 * @param {string|null} classId - UUID of the class
 * @returns {{
 *   classResults: Array,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: Function
 * }}
 *
 * classResults shape:
 * [
 *   {
 *     question_id:     string,
 *     question_short:  string,   // first 70 chars
 *     question:        string,   // full text
 *     is_published:    boolean,
 *     question_number: number,   // 1-based index
 *     total_answers:   number,
 *     scored_count:    number,
 *     avg_score:       number|null,
 *     min_score:       number|null,
 *     max_score:       number|null,
 *     released_count:  number,
 *     answers: [
 *       { student_code: string, score_ai: number|null, score_released: boolean }
 *     ]
 *   }
 * ]
 */
export function useClassResults(classId) {
  const [classResults, setClassResults] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (!classId) return;
    fetchClassResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function fetchClassResults() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res   = await fetch(`${API_BASE_URL}/classes/${classId}/results`, {
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setClassResults(data.classResults ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { classResults, loading, error, refetch: fetchClassResults };
}