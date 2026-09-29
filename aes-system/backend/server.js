
import express         from "express";
import cors            from "cors";
import helmet          from "helmet";
import rateLimit       from "express-rate-limit";
import "dotenv/config";

import authRoutes      from "./routes/authRoutes.js";
import classRoutes     from "./routes/classRoutes.js";
import questionRoutes  from "./routes/questionRoutes.js";

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.use(express.json({ limit: "10kb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/user",    authLimiter, authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/classes", questionRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
