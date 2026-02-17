import path from 'path'
import {fileURLToPath} from 'url'

import express from 'express'
import 'dotenv/config'

import HomeRoute from './routes/home.route.js'
import TasksRoute from './routes/tasks.route.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(express.static(path.join(__dirname, '..', 'public')))
// app.use(express.urlencoded({extended: false})); //? to parse form data - usually used in HTML form submissions
app.use(express.json()); //? to parse JSON data - usually used in API requests

app.use(HomeRoute)
app.use(TasksRoute)

app.use('/', (req, res) => {
    res.status(404).send('<h1>404 Not Found</h1><br/><p>The requested resource was not found on this server.</p>')
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})

export {__dirname as rootPath}



//! Cycle dependeny issue: It means that two or more modules depend on each other, creating a circular reference.
//! In this case, the index.ts file imports TaskController from task.controller.ts, and task.controller.ts imports rootPath from index.ts.
//! This creates a cycle because both modules are trying to access each other's exports before they have been fully defined.
//! To resolve this issue, you can either remove the import of rootPath from task.controller.ts if it's not necessary,
//! or refactor your code to avoid the circular dependency.
//? If we used rootPath in a middleware, we wouldn't get the error because middlewares are executed after all modules have been loaded,
//? so the circular reference would not cause an issue at that point.