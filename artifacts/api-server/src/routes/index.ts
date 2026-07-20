import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import projectsRouter from "./projects";
import resumeRouter from "./resume";
import certificationsRouter from "./certifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(projectsRouter);
router.use(resumeRouter);
router.use(certificationsRouter);

export default router;
