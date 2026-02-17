import { Request, Response } from "express";

import Task from "../models/task.js";
import DB from "../models/db.js";
import { rootPath } from "../index.js";

export default class TasksController {
  static getTasksController(req: Request, res: Response) {
    try {
      const tasks = Task.getAllTasks();
      res.json({
        success: true,
        body: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error: " + (error as any).message
      });
    }
  }

  static getTaskByIdController(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const task = Task.getTaskById(id);
      if (task) {
        res.json({
          success: true,
          body: task
        })
      } else {
        res.status(404).json({
          success: false,
          message: "Not Found: Task with the specified ID was not found."
        });
      }
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error: " + (error as any).message
      });
    }
  }
  static addTaskController(req: Request, res: Response) {
    if (req.body.title) {
      const title = req.body.title;
      const completed = req.body.completed === "on";

      try {
        const task = new Task(title, completed);
        task.save();
        res.json({ success: true, body: task });
      } catch (error) {
        res
          .status(400)
          .json({
            success: false,
            message: `Invalid Request: ${(error as any).message}`,
          });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid Request: Title is required." });
    }
  }
  
  static toggleTaskController(req: Request, res: Response) {
    if (req.body.id) {
        const task = Task.getTaskById(Number(req.body.id));
    
        if (task) {
          task.completed = !task.completed;
          task.save();
          res.json({ success: true, body: task });
        } else {
          res
            .status(404)
            .json({ success: false, message: "Not Found: Task with the specified ID was not found." });
        }
      } else {
        res
          .status(400)
          .json({ success: false, message: "Invalid Request: Task ID is required." });
      }
  }

  static editTaskController(req: Request, res: Response) {
    if (req.body.id && req.body.title) {
        const task = Task.getTaskById(Number(req.body.id));
        if (task) {
          try {
            task.title = req.body.title;
            task.save();
            res.json({ success: true, body: task });
          } catch (error) {
            res.status(400).json({ success: false, message: "Invalid Request: " + (error as any).message });
          }
        } else {
          res
            .status(404)
            .json({ success: false, message: "Not Found: Task with the specified ID was not found." });
        }
      } else {
        res.status(400).json({ success: false, message: "Invalid Request: Task ID and Title are required." });
      }
  }

  static deleteTaskController(req: Request, res: Response) {
    if (req.body.id) {
      try {
        if (DB.deleteTaskById(Number(req.body.id))) {
          res.json({ success: true });
        } else {
          res
            .status(404)
            .json({ success: false, message: "Not Found: Task with the specified ID was not found." });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error: " + (error as any).message });
      }
  } else {
    res.status(400).json({ success: false, message: "Invalid Request: Task ID is required." });
  }
  }
}
