import {Router} from 'express'

import TaskController from '../controllers/task.controller.js';

const router = Router()

router.get('/', TaskController.homeController);

router.get('/get-tasks', TaskController.getTasksController);

router.post("/add-task", TaskController.addTaskController);

router.post("/toggle-task", TaskController.toggleTaskController);

router.put("/edit-task", TaskController.editTaskController);

router.delete("/delete-task", TaskController.deleteTaskController);

export default router