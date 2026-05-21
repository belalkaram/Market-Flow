import { Router } from "express";
import platformAuthRouter from "./auth";
import platformStoresRouter from "./stores";
import platformPlansRouter from "./plans";
import platformDashboardRouter from "./dashboard";
import platformAdminsRouter from "./admins";
import platformSystemHealthRouter from "./system-health";
import platformActivityLogsRouter from "./activity-logs";
import platformSecurityRouter from "./security";

const router = Router();

router.use("/auth", platformAuthRouter);
router.use("/stores", platformStoresRouter);
router.use("/plans", platformPlansRouter);
router.use("/dashboard", platformDashboardRouter);
router.use("/admins", platformAdminsRouter);
router.use("/system-health", platformSystemHealthRouter);
router.use("/activity-logs", platformActivityLogsRouter);
router.use("/security", platformSecurityRouter);

export default router;
