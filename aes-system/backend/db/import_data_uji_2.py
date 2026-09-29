import pandas as pd
import psycopg2
import random
import numpy as np
from psycopg2.extras import execute_values

# ========== HELPER: convert numpy types ==========
def convert_to_native(obj):
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return obj

# ========== CONFIGURATION (CHANGE THESE!) ==========
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "aes_db"
DB_USER = "postgres"
DB_PASSWORD = "password"          # <-- change

EXCEL_FILE = "Data Uji 2.xlsx"                      # your Excel file
SHEET_NAME = 0

# Replace with REAL UUIDs from your database
ADMIN_USER_ID = "df9980be-2b94-4bce-9218-4f10867f1ede"   # get from: SELECT user_id FROM users WHERE role='admin' LIMIT 1;
CLASS_ID      = "b9bddb46-4770-4540-970b-e987bb1fbe32"   # get from: SELECT class_id FROM classes LIMIT 1;

STUDENT_PASSWORD = "password123"

# ========== CONNECT ==========
conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)
conn.autocommit = False
cur = conn.cursor()

# ========== READ EXCEL ==========
df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_NAME, header=0)
df.columns = df.columns.str.lower().str.strip()

required_cols = ['question', 'student_id', 'student_answer', 'key_answer']
for col in required_cols:
    if col not in df.columns:
        raise ValueError(f"Excel must contain column '{col}'. Found: {list(df.columns)}")

# FORWARD FILL merged cells (question and key_answer)
df['question'] = df['question'].ffill()
df['key_answer'] = df['key_answer'].ffill()

# Remove rows where any required field is still empty
df = df.dropna(subset=['question', 'student_id', 'student_answer', 'key_answer'])

# Clean student_id (remove decimals if numeric)
df['student_id'] = df['student_id'].astype(str).str.replace(r'\.0$', '', regex=True)

# Remove duplicates (same student + same question) – keep first
df = df.drop_duplicates(subset=['student_id', 'question'])

print(f"Loaded {len(df)} valid rows from Excel.")

# ========== CREATE STUDENTS ==========
student_ids = df['student_id'].unique()
student_records = []

for sid in student_ids:
    sid = str(sid).strip()
    name = f"Student {sid}"
    cur.execute("SELECT user_id FROM users WHERE identifier = %s", (sid,))
    existing = cur.fetchone()
    if existing:
        user_id = existing[0]
    else:
        cur.execute("""
            INSERT INTO users (user_id, name, identifier, password_hash, role)
            VALUES (gen_random_uuid(), %s, %s, crypt(%s, gen_salt('bf')), 'student')
            RETURNING user_id
        """, (name, sid, STUDENT_PASSWORD))
        user_id = cur.fetchone()[0]
    student_records.append((user_id, sid))

print(f"Created/found {len(student_records)} students.")

# ========== ADD STUDENTS TO CLASS ==========
def generate_student_code():
    return "STU" + str(random.randint(1000, 9999))

for user_id, sid in student_records:
    cur.execute("SELECT 1 FROM class_members WHERE class_id = %s AND user_id = %s", (CLASS_ID, user_id))
    if not cur.fetchone():
        student_code = generate_student_code()
        cur.execute("""
            INSERT INTO class_members (class_id, user_id, student_code, role)
            VALUES (%s, %s, %s, 'student')
        """, (CLASS_ID, user_id, student_code))

# ========== CREATE QUESTIONS ==========
unique_q = df[['question', 'key_answer']].drop_duplicates().reset_index(drop=True)
question_ids = {}

for _, row in unique_q.iterrows():
    q_text = row['question'].strip()
    key_ans = row['key_answer'].strip()
    if not q_text or not key_ans:
        continue
    cur.execute("SELECT question_id FROM questions WHERE class_id = %s AND question = %s", (CLASS_ID, q_text))
    existing = cur.fetchone()
    if existing:
        qid = existing[0]
    else:
        cur.execute("""
            INSERT INTO questions (question_id, class_id, created_by, question, key_answer, is_published)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, TRUE)
            RETURNING question_id
        """, (CLASS_ID, ADMIN_USER_ID, q_text, key_ans))
        qid = cur.fetchone()[0]
    question_ids[q_text] = qid

print(f"Created/found {len(question_ids)} questions.")

# ========== INSERT/UPDATE ANSWERS ==========
inserted = 0
updated = 0

for _, row in df.iterrows():
    student_id_val = str(row['student_id']).strip()
    q_text = row['question'].strip()
    student_answer = row['student_answer'].strip()
    if not student_answer:
        continue

    cur.execute("SELECT user_id FROM users WHERE identifier = %s", (student_id_val,))
    user_row = cur.fetchone()
    if not user_row:
        print(f"Warning: Student {student_id_val} not found, skipping.")
        continue
    user_id = user_row[0]

    qid = question_ids.get(q_text)
    if not qid:
        print(f"Warning: Question '{q_text}' not found, skipping.")
        continue

    cur.execute("SELECT answer_id FROM answers WHERE question_id = %s AND user_id = %s", (qid, user_id))
    existing = cur.fetchone()

    if existing:
        cur.execute("""
            UPDATE answers 
            SET answer = %s, score_ai = NULL, feedback = NULL, score_released = FALSE, submitted_at = NOW()
            WHERE question_id = %s AND user_id = %s
        """, (student_answer, qid, user_id))
        updated += 1
    else:
        cur.execute("""
            INSERT INTO answers (answer_id, question_id, user_id, answer, score_ai, feedback, score_released)
            VALUES (gen_random_uuid(), %s, %s, %s, NULL, NULL, FALSE)
        """, (qid, user_id, student_answer))
        inserted += 1

# ========== COMMIT ==========
conn.commit()
cur.close()
conn.close()

print(f"Done: {len(student_records)} students, {len(question_ids)} questions, {inserted} answers inserted, {updated} answers updated.")