import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { success } from "../utils/response";
import { getDashboardSummary } from "../services/dashboard.service";

const router = Router();
router.use(requireAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const data = await getDashboardSummary(req.user!.tenantId);
    success(res, data);
  } catch (err) { next(err); }
});

export default router;
