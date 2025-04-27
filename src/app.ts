import express, { Application, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is running my lil bro!");
});

// Error handling middleware
app.use(errorHandler);

export default app;
