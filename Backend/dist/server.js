"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const authRoutes_1 = require("./routes/authRoutes");
const userRoutes_1 = require("./routes/userRoutes");
const buildingRoutes_1 = require("./routes/buildingRoutes");
const apartmentRoutes_1 = require("./routes/apartmentRoutes");
const maintenanceRoutes_1 = require("./routes/maintenanceRoutes");
const contractorRoutes_1 = require("./routes/contractorRoutes");
const paymentRoutes_1 = require("./routes/paymentRoutes");
const documentRoutes_1 = require("./routes/documentRoutes");
const securityRoutes_1 = require("./routes/securityRoutes");
const announcementRoutes_1 = require("./routes/announcementRoutes");
const notificationRoutes_1 = require("./routes/notificationRoutes");
const dashboardRoutes_1 = require("./routes/dashboardRoutes");
const reportRoutes_1 = require("./routes/reportRoutes");
const auditRoutes_1 = require("./routes/auditRoutes");
const profileRoutes_1 = require("./routes/profileRoutes");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || env_1.env.FRONTEND_URLS.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, cookie_parser_1.default)());
app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "homenest-backend" });
});
app.use("/api/auth", authRoutes_1.authRouter);
app.use("/api/users", userRoutes_1.userRouter);
app.use("/api/buildings", buildingRoutes_1.buildingRouter);
app.use("/api/apartments", apartmentRoutes_1.apartmentRouter);
app.use("/api/maintenance", maintenanceRoutes_1.maintenanceRouter);
app.use("/api/contractors", contractorRoutes_1.contractorRouter);
app.use("/api/payments", paymentRoutes_1.paymentRouter);
app.use("/api/documents", documentRoutes_1.documentRouter);
app.use("/api/security-reports", securityRoutes_1.securityRouter);
app.use("/api/announcements", announcementRoutes_1.announcementRouter);
app.use("/api/notifications", notificationRoutes_1.notificationRouter);
app.use("/api/dashboard", dashboardRoutes_1.dashboardRouter);
app.use("/api/reports", reportRoutes_1.reportRouter);
app.use("/api/audit-logs", auditRoutes_1.auditRouter);
app.use("/api/profile", profileRoutes_1.profileRouter);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(env_1.env.PORT, () => {
    console.log(`HomeNest backend listening on ${env_1.env.PORT}`);
});
exports.default = app;
