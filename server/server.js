const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

connectDB();

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://food-delivery-ecru-five.vercel.app",
  process.env.CLIENT_API_URL,
].filter(Boolean);

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ── Rate limiting ─────────────────────────────────────────
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many login attempts." },
  }),
);

// ── Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// ── Health check ───────────────────────────────────────────
app.get("/api/health", (_, res) =>
  res.json({
    success: true,
    message: `${process.env.RESTAURANT_NAME || "Food Delivery"} API running 🍕`,
    env: process.env.NODE_ENV,
  }),
);

app.use("*", (req, res) =>
  res
    .status(404)
    .json({ success: false, message: `${req.originalUrl} not found` }),
);
app.use(errorHandler);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`🍕 Food Delivery server on port ${PORT}`));
