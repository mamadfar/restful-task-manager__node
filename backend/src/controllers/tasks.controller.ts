import { Request, Response } from "express";

import Task from "../models/task.js";
import DB from "../models/db.js";

export default class TasksController {
  static getTasks(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const finished =
      req.query.finished?.toString().toLowerCase() === "true"
        ? true
        : req.query.finished?.toString().toLowerCase() === "false"
          ? false
          : undefined;
    const search = req.query.search ? String(req.query.search) : "";
    try {
      const tasks = Task.getAllTasks();
      let filteredTasks = [...tasks].filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase()),
      );
      if (finished !== undefined) {
        filteredTasks = filteredTasks.filter((task) => task.completed === finished);
      }

      //! Pagination logic should be applied after filtering the tasks based on the search
      //! and finished query parameters to ensure that the pagination reflects the filtered results correctly.
      const start = (page - 1) * limit;
      const end = start + limit;
      const totalPages = Math.ceil(filteredTasks.length / limit);
      const totalTasks = filteredTasks.length;
      filteredTasks = filteredTasks.slice(start, end);

      res.json({
        success: true,
        pagination: {
          page,
          limit,
          totalPages,
          totalTasks,
        },
        body: filteredTasks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static getTaskById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const task = Task.getTaskById(id);
      if (task) {
        res.json({
          success: true,
          body: task,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Not Found: Task with the specified ID was not found.",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static createTask(req: Request, res: Response) {
    //? Always check the required fields in the request body before processing the request
    if (req.body.title) {
      const title = req.body.title;
      const completed = !!req.body.completed;

      if (typeof title !== "string" || title.length < 3) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Request: Title must be a string with at least 3 characters.",
        });
      } else if (Task.getTaskByTitle(title)) {
        return res.status(409).json({
          success: false,
          message:
            "Invalid Request: A task with the same title already exists.",
        });
      }

      try {
        const task = new Task(title, completed);
        task.save();
        res.status(201).json({ success: true, body: task });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid Request: Title is required.",
      });
    }
  }

  static updateTask(req: Request, res: Response) {
    if (req.body.title && req.body.completed !== undefined) {
      const { title, completed } = req.body;

      if (title.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Invalid Request: Title must be at least 3 characters long.",
        });
      }

      let task = Task.getTaskByTitle(title);
      if (task && task.id !== Number(req.params.id)) {
        return res.status(409).json({
          success: false,
          message:
            "Invalid Request: A task with the same title already exists.",
        });
      }

      task = Task.getTaskById(Number(req.params.id));
      if (task) {
        try {
          task.title = title;
          task.completed = completed;
          task.save();
          res.json({ success: true, body: task });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "Internal Server Error",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "Not Found: Task with the specified ID was not found.",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message:
          "Invalid Request: Task title and completed status are required.",
      });
    }
  }

  static deleteTask(req: Request, res: Response) {
    try {
      if (DB.deleteTaskById(Number(req.params.id))) {
        res.json({ success: true });
      } else {
        res.status(404).json({
          success: false,
          message: "Not Found: Task with the specified ID was not found.",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}
