import {Router} from 'express'

import TasksController from '../controllers/tasks.controller.js';

const router = Router()

router.get('/tasks', TasksController.getTasksController);

router.get('/tasks/:id', TasksController.getTaskByIdController);

router.post("/tasks", TasksController.addTaskController);

router.post("/toggle-task", TasksController.toggleTaskController);

router.put("/edit-task", TasksController.editTaskController);

router.delete("/delete-task", TasksController.deleteTaskController);

export default router