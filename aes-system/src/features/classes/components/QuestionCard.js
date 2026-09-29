import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cardBaseStyle,
  cardHoveredStyle,
  cardRowStyle,
  indexBadgeStyle,
  cardTextWrapperStyle,
  cardQuestionTextStyle,
  cardDateStyle,
  cardActionsStyle,
  publishedBadgeStyle,
  draftBadgeStyle,
  answeredBadgeStyle,
  notAnsweredBadgeStyle,
  chevronStyle,
} from "../../../styles/questionCardStyles";

export default function QuestionCard({ question, index, classId }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const handleClick = () => {
    navigate(`/questions/${question.question_id}`, {
      state: { classId, question },
    });
  };

  return (
    <div
      style={hovered ? cardHoveredStyle : cardBaseStyle}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={cardRowStyle}>
        <div style={indexBadgeStyle}>{index + 1}</div>

        <div style={cardTextWrapperStyle}>
          <p style={cardQuestionTextStyle}>{question.question}</p>
          <p style={cardDateStyle}>
            Created{" "}
            {new Date(question.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div style={cardActionsStyle}>
        {isAdmin ? (
          /* Admin sees Published / Draft badge */
          <span style={question.is_published ? publishedBadgeStyle : draftBadgeStyle}>
            {question.is_published ? "Published" : "Draft"}
          </span>
        ) : (
          /* Student sees Answered / Not Answered badge */
          <span style={question.is_answered ? answeredBadgeStyle : notAnsweredBadgeStyle}>
            {question.is_answered ? "Answered" : "Not Answered"}
          </span>
        )}
        <span style={chevronStyle}>›</span>
      </div>
    </div>
  );
}