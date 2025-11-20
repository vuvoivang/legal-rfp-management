import { connectMongoDB } from "./config/db";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import rfpRoutes from "./routes/rfpRoutes";
import proposalRoutes from "./routes/proposalRoutes";
import commentRoutes from "./routes/commentRoutes";
import organisationsRoutes from "./routes/organisationRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";
import { protect } from "./middlewares/authMiddleware";
import { allowedOrigins } from "./utils/constant";

connectMongoDB();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true); // allow
      } else {
        callback(new Error("Not allowed by CORS")); // deny
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🧱 Helmet helps secure Express apps by setting various HTTP headers
// It prevents attacks like XSS, clickjacking, and hides framework info
app.use(helmet());

// 🪵 Morgan logs incoming HTTP requests (method, URL, status, response time)
// 'dev' mode gives concise color-coded logs for easy debugging
app.use(morgan("dev"));

// 🧩 Built-in middleware to parse incoming JSON request body
// Without this, req.body would be undefined for JSON payloads
app.use(express.json());

app.get("/", (_, res) =>
  res.json({ message: "Welcome to PERSUIT clone application!" })
);

app.use("/api/auth", authRoutes);

app.use("/api/organisations", protect, organisationsRoutes);
app.use("/api/rfps", protect, rfpRoutes);
app.use("/api/proposals", protect, proposalRoutes);
app.use("/api/comments", protect, commentRoutes);

// fallback error handler
app.use(errorHandler);

export default app;
