import {Router} from 'express'

import TasksController from '../controllers/tasks.controller.js';

const router = Router()

router.get('/tasks', TasksController.getTasks);

router.get('/tasks/:id', TasksController.getTaskById);

router.post("/tasks", TasksController.createTask);

router.put("/tasks/:id", TasksController.updateTask);

router.delete("/tasks/:id", TasksController.deleteTask);

export default router



//? The PUT and DELETE routes should always idempotent, meaning that making the same request multiple times should have the same effect as making it once.
//? And the GET route should always be safe, meaning that it should not have any side effects on the server or the data.