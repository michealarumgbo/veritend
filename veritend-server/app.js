import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoute.js";
import authRouter from "./routes/authRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";
import reportRouter from "./routes/reportRoute.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { NotFoundError } from "./errors.js";

const app = express();
const prod = process.env.NODE_ENV === "production";
if (prod) app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: prod
      ? process.env.CLIENT_URL
      : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: "100kb" }));

const base = "/veritend/api/v1";
app.get(`${base}/health`, (req, res) => res.json({ ok: true }));
app.use(`${base}/auth`, authRouter);
app.use(`${base}/users`, userRouter);
app.use(`${base}/attendance`, attendanceRouter);
app.use(`${base}/report`, reportRouter);

app.use((req, res, next) => next(NotFoundError("Route not found")));
app.use(errorMiddleware);
export default app;
