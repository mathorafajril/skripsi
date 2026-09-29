# AES CRNN (CNN+LSTM) evaluation service — real model inference.
# Model:     ml/final_lstm_model_with_test.h5  (CNN+LSTM, input (80, 300))
# Embeddings: FastText Indonesian cc.id.300.bin
# Set FASTTEXT_MODEL_PATH env var to override the default path below.

import os
import re
import logging

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────

MODEL_PATH       = os.getenv("LSTM_MODEL_PATH",    "ml//data/final_lstm_model_with_test.h5")
FASTTEXT_PATH    = os.getenv("FASTTEXT_MODEL_PATH", "ml/data/cc.id.300.bin")

MAX_LEN  = 80   # sequence length the model was trained on
EMB_DIM  = 300  # cc.id.300.bin produces 300-d vectors; matches input_shape=(80,300)

# ── Globals (populated at startup) ───────────────────────────────────────────

ft_model   = None   # FastText model
lstm_model = None   # Keras CNN+LSTM model

# ── Model definitions ─────────────────────────────────────────────────────────

def build_model():
    """Rebuild the exact architecture so Keras can load the weights."""
    from tensorflow.keras.layers import (
        LSTM, Dense, Dropout, Masking, Conv1D, MaxPooling1D
    )
    from tensorflow.keras.models import Sequential

    model = Sequential()
    model.add(Masking(mask_value=0.0, input_shape=(MAX_LEN, EMB_DIM)))

    # CNN block 1
    model.add(Conv1D(filters=64,  kernel_size=3, activation='relu', padding='same'))
    model.add(MaxPooling1D(pool_size=2))

    # CNN block 2
    model.add(Conv1D(filters=128, kernel_size=3, activation='relu', padding='same'))
    model.add(MaxPooling1D(pool_size=2))

    # RNN block
    model.add(LSTM(64, dropout=0.25, recurrent_dropout=0.2))

    # Output
    model.add(Dropout(0.3))
    model.add(Dense(1, activation='sigmoid'))

    model.compile(optimizer='adam', loss='mae')
    return model


# ── Preprocessing ─────────────────────────────────────────────────────────────

def essay_to_sequence(essay_text: str) -> np.ndarray:
    """
    Tokenise *essay_text*, look up FastText vectors, and return a padded
    array of shape (MAX_LEN, EMB_DIM).
    """
    try:
        from nlp_id.tokenizer import Tokenizer as NlpTokenizer
        words = NlpTokenizer().tokenize(essay_text.lower())
    except Exception:
        # Fallback: simple whitespace tokeniser
        words = essay_text.lower().split()

    vectors = [ft_model.get_word_vector(w) for w in words[:MAX_LEN]]

    # Pad to MAX_LEN
    pad_needed = MAX_LEN - len(vectors)
    if pad_needed > 0:
        vectors.extend([np.zeros(EMB_DIM)] * pad_needed)

    return np.array(vectors, dtype=np.float32)   # shape (MAX_LEN, EMB_DIM)


def predict_score(text: str) -> float:
    """
    Return a raw sigmoid score in [0, 1] for *text*.
    Returns 0.0 for blank / whitespace-only input.
    """
    if not text or not text.strip():
        return 0.0

    X = essay_to_sequence(text)                 # (MAX_LEN, EMB_DIM)
    X = X[np.newaxis, ...]                       # (1, MAX_LEN, EMB_DIM)
    pred = lstm_model.predict(X, verbose=0)
    return float(pred.flatten()[0])

# ── ADDED FOR JACCARD: word-level similarity helper ──────────────────────────

def jaccard_word_similarity(text1: str, text2: str) -> float:
    """
    Compute Jaccard similarity between two texts based on word tokens.
    Returns a float in [0, 1] where 0 = no common words, 1 = identical word sets.
    """
    # Normalise: lower case, extract words (alphanumeric only)
    def token_set(txt: str):
        txt = txt.lower()
        words = re.findall(r'\b\w+\b', txt)
        return set(words)
    
    set1 = token_set(text1)
    set2 = token_set(text2)
    
    if not set1 and not set2:
        return 1.0
    if not set1 or not set2:
        return 0.0
    
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union

# ── Scoring ───────────────────────────────────────────────────────────────────

def compute_score_and_feedback(
    student_answer: str,
    key_answer: str,
) -> dict:

    student_pred = predict_score(student_answer)
    key_pred     = predict_score(key_answer)
    if key_pred < 1e-6:
        lstm_score = student_pred * 4 + 1
    else:
        ratio = student_pred / key_pred
        lstm_score = min(ratio, 1.0) * 4 + 1
    lstm_score = max(1, min(5, lstm_score))

    # 2. Jaccard similarity (scaled 1‑5)
    jaccard_sim = jaccard_word_similarity(student_answer, key_answer)
    jaccard_score = jaccard_sim * 4 + 1

    # 3. Hybrid combination (85% LSTM, 15% Jaccard)
    alpha = 0.85   # weight for LSTM
    final_score = alpha * lstm_score + (1 - alpha) * jaccard_score
    final_score = round(max(1, min(5, final_score)), 2)
    
    print(f"\n📊 Scoring breakdown:")
    print(f"   LSTM score: {lstm_score:.2f}")
    print(f"   Jaccard similarity: {jaccard_sim:.4f} → Jaccard score: {jaccard_score:.2f}")
    print(f"   Hybrid (α={alpha}): {final_score}")
    print(f"   Student answer snippet: {student_answer[:80]}...")
    print(f"   Key answer snippet: {key_answer[:80]}...")

    # 4. Feedback thresholds (based on final score)
    if final_score >= 4:
        feedback = (
            "Excellent answer! The response closely matches the key answer "
            "both semantically and in vocabulary. All main concepts are present."
        )
    elif final_score >= 3:
        feedback = (
            "Good answer. The core idea is present, but a few key points "
            "from the model answer are missing or underdeveloped. "
            "The wording is reasonably close to the expected answer."
        )
    elif final_score >= 2:
        feedback = (
            "Partial answer. Several important concepts from the key answer "
            "are absent, and the word choice differs significantly from the "
            "expected answer. Please review the topic more carefully."
        )
    elif final_score >= 1:
        feedback = (
            "Weak answer. The response shows minimal alignment with the "
            "expected answer in both meaning and vocabulary. "
            "Significant revision is needed."
        )
    else:
        feedback = (
            "Answer needs substantial improvement. Key concepts are largely "
            "missing, and the vocabulary does not match the expected answer. "
            "The response is too brief or off‑topic to evaluate meaningfully."
        )

    return {"score_ai": final_score, "feedback": feedback}


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ft_model, lstm_model

    # --- Load FastText ---
    logger.info("Loading FastText model from %s …", FASTTEXT_PATH)
    if not os.path.exists(FASTTEXT_PATH):
        raise RuntimeError(
            f"FastText model not found at '{FASTTEXT_PATH}'. "
            "Set the FASTTEXT_MODEL_PATH environment variable to the correct path."
        )
    import fasttext
    ft_model = fasttext.load_model(FASTTEXT_PATH)
    logger.info("FastText model loaded (dim=%d).", ft_model.get_dimension())

    # --- Build & load LSTM weights ---
    logger.info("Building LSTM model and loading weights from %s …", MODEL_PATH)
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"LSTM weights not found at '{MODEL_PATH}'. "
            "Set the LSTM_MODEL_PATH environment variable to the correct path."
        )
    lstm_model = build_model()
    lstm_model.load_weights(MODEL_PATH)
    logger.info("LSTM model ready.")

    yield   # application runs

    # (cleanup here if needed)
    logger.info("Shutting down AES evaluation service.")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AES CRNN Evaluation Service",
    version="2.0.0",
    lifespan=lifespan,
)

# ── Schemas ───────────────────────────────────────────────────────────────────

class AnswerItem(BaseModel):
    answer_id:      str
    question:       str
    key_answer:     str
    student_answer: str

class EvaluationResult(BaseModel):
    answer_id: str
    score_ai:  float
    feedback:  str

class EvaluateRequest(BaseModel):
    answers: List[AnswerItem]

class EvaluateResponse(BaseModel):
    results: List[EvaluationResult]

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model":   "CNN+LSTM (real weights)",
        "scoring": "LSTM sigmoid normalised against key answer",
    }


@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_answers(payload: EvaluateRequest):
    if not payload.answers:
        raise HTTPException(status_code=422, detail="No answers provided.")

    results = []
    for item in payload.answers:
        try:
            scores = compute_score_and_feedback(
                student_answer=item.student_answer,
                key_answer=item.key_answer,
            )
        except Exception as exc:
            logger.exception("Scoring failed for answer_id=%s", item.answer_id)
            raise HTTPException(
                status_code=500,
                detail=f"Scoring failed for answer_id={item.answer_id}: {exc}",
            )

        results.append(EvaluationResult(
            answer_id=item.answer_id,
            score_ai =scores["score_ai"],
            feedback =scores["feedback"],
        ))

    return EvaluateResponse(results=results)