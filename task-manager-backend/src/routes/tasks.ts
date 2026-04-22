import { tasksController } from "@/controllers/tasks";
import {
  authenticate,
  extractDeviceInfo,
  requireEmailVerified,
} from "@/middlewares/auth";
import { Router } from "express";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  tasksController.getTasksByWorkspaceId.bind(tasksController),
);

router.post(
  "/",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  tasksController.createTask.bind(tasksController),
);

router.put(
  "/:taskId",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  tasksController.updateTask.bind(tasksController),
);

router.delete(
  "/:taskId",
  authenticate,
  requireEmailVerified,
  extractDeviceInfo,
  tasksController.deleteTask.bind(tasksController),
);

export default router;
