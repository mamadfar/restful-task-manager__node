import { Request, Response } from "express";

import { rootPath } from "../index.js";

export default class HomeController {
  static homeController(req: Request, res: Response) {
    res.sendFile(rootPath + "/views/index.html");
  }
}
