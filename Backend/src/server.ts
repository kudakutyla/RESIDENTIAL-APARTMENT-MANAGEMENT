import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { authRouter } from "./routes/authRoutes";
import { userRouter } from "./routes/userRoutes";
import { buildingRouter } from "./routes/buildingRoutes";
import { apartmentRouter } from "./routes/apartmentRoutes";
import { maintenanceRouter } from "./routes/maintenanceRoutes";
import { contractorRouter } from "./routes/contractorRoutes";
import { paymentRouter } from "./routes/paymentRoutes";
import { documentRouter } from "./routes/documentRoutes";
import { securityRouter } from "./routes/securityRoutes";
import { announcementRouter } from "./routes/announcementRoutes";
import { notificationRouter } from "./routes/notificationRoutes";
import { dashboardRouter } from "./routes/dashboardRoutes";
import { reportRouter } from "./routes/reportRoutes";
import { auditRouter } from "./routes/auditRoutes";
import { profileRouter } from "./routes/profileRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "homenest-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/buildings", buildingRouter);
app.use("/api/apartments", apartmentRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/contractors", contractorRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/documents", documentRouter);
app.use("/api/security-reports", securityRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportRouter);
app.use("/api/audit-logs", auditRouter);
app.use("/api/profile", profileRouter);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(env.PORT, () => {
    console.log(`HomeNest backend listening on ${env.PORT}`);
  });
}

export default app;
