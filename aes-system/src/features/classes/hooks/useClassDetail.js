// src/features/classes/hooks/useClassDetail.js
//
// Fetches class info + question list from GET /classes/:class_id.
// Now also returns exam schedule fields:
//   classData.exam_start_time, classData.exam_duration_minutes,
//   classData.exam_end_time, classData.exam_status
//
// Returns: { classData, questions, loading, error, refetch }

import { useState, useEffect, useCallback } from "react";
import { ACCESS_TOKEN_NAME } from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function useClassDetail(classId) {
  const [classData, setClassData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClassDetail = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch class");
      }

      const data = await res.json();

      // Separate questions from the rest of the class data
      const { questions: qs = [], ...rest } = data;
      setClassData(rest);
      setQuestions(qs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassDetail();
  }, [fetchClassDetail]);

  return { classData, questions, loading, error, refetch: fetchClassDetail };
}
