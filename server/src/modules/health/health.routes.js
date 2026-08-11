import { Router } from "express";

import { getHealthStatus } from "./health.controller.js";

const healthRouter = Router();

healthRouter.get("/", getHealthStatus);

export default healthRouter;
