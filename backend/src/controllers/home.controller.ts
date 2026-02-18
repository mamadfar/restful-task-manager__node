import { Request, Response } from "express";

// import { rootPath } from "../index.js";

//! TODO: can be removed since we moved the frontend files to somewhere else
export default class HomeController {
  static getHomePage(req: Request, res: Response) {
    // res.sendFile(rootPath + "/views/index.html");
  }
}
