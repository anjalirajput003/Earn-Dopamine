import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import env from "./config/env.js";
import apiRouter from "./routes/index.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

app.use(cookieParser());

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

app.use("/api/v1", apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
