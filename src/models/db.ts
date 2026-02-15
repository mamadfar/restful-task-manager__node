import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import chalk from 'chalk';
import type { ITask } from '../types/task.type.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filename = path.join(__dirname, process.env.DB_FILE || 'db.json');

const warn = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

export default class DB {
    //? [Best Practice] --- Always just return true/false and don't show any messages from methods
    static createDB() {
        if (fs.existsSync(filename)) {
            console.log(warn('Database already exists!'));
            return false
        }
        try {
            fs.writeFileSync(filename, '[]', 'utf-8');
            console.log(success('Database created successfully!'));
            return true;
        } catch (error) {
            throw new Error('Could not create database file!', error as any);
        }
    }
    static resetDB() {
        try {
            fs.writeFileSync(filename, '[]', 'utf-8');
            return true;
        } catch (error) {
            throw new Error('Could not reset database file!', error as any);
        }
    }
    static DBExists() {
        if (fs.existsSync(filename)) {
            return true;
        } else {
            return false;
        }
    }
    static getTaskById(id: number): ITask | false {
        let data;
        if (this.DBExists()) {
            data = fs.readFileSync(filename, 'utf-8');
        } else {
            this.createDB();
            return false;
        }

        try {
            data = JSON.parse(data);
            const task: ITask = data.find((task: ITask) => task.id === Number(id));
            return task ?? false
        } catch (error) {
            throw new Error("Syntax error. \nPlease check the DB file.", error as any);
        }
    }
        static getTaskByTitle(title: string): ITask | false {
        let data;
        if (this.DBExists()) {
            data = fs.readFileSync(filename, 'utf-8');
        } else {
            this.createDB();
            return false;
        }

        try {
            data = JSON.parse(data);
            const task: ITask = data.find((task: ITask) => task.title === title);
            return task ?? false
        } catch (error) {
            throw new Error("Syntax error. \nPlease check the DB file.", error as any);
        }
    }
    static getAllTasks(): ITask[] {
        let data;
        if (this.DBExists()) {
            data = fs.readFileSync(filename, 'utf-8');
        } else {
            this.createDB();
            return [];
        }

        try {
            return JSON.parse(data);
        } catch (error) {
            throw new Error("Syntax error. \nPlease check the DB file.", error as any);
        }
    }
    static saveTask(title: string, completed = false, id = 0): number {
        id = Number(id);
        if (id < 0 || id !== parseInt(id as any)) {
            throw new Error('ID must be a positive integer or zero.');
        } else if (typeof title !== 'string' || title.length < 3) {
            throw new Error('Title must be a string with at least 3 characters.');
        }

        let task = this.getTaskByTitle(title);
        if (task && task.id != id) {
            throw new Error('A task with this title already exists.');
        }

        let data = this.getAllTasks();

        //! New Task
        if (id === 0) {
            id = (data.at(-1)?.id ?? 0) + 1 || 1;

            data = [...data, {id, title, completed}]

            const str = JSON.stringify(data, null, "    ");
            try {
                fs.writeFileSync(filename, str, 'utf-8');
                return id;
            } catch (error) {
                throw new Error('Could not save task to database.', error as any);
            }
        //! Update Task
        } else {
            let taskIndex = data.findIndex((task: ITask) => task.id === id);
            if (taskIndex === -1 || data[taskIndex] === undefined) {
                throw new Error('Task with the given ID does not exist.');
            } else {
                data[taskIndex] = {...data[taskIndex], title, completed};
                const str = JSON.stringify(data, null, "    ");
                try {
                    fs.writeFileSync(filename, str, 'utf-8');
                    return id;
                } catch (error) {
                    throw new Error('Could not update task in database.', error as any);
                }
            }
        }
    }
    static insertBulkData(data: ITask[] | string): boolean | void {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                throw new Error("Invalid data format. Could not parse string to JSON.", error as any);
            }
        }
        if (data instanceof Array) {
            const str = JSON.stringify(data, null, "    ");
            try {
                fs.writeFileSync(filename, str, 'utf-8');
                return true;
            } catch (error) {
                throw new Error('Could not insert bulk data to database.', error as any);
            }
        }
    }
    static deleteTaskById(id: number): boolean | void {
        id = Number(id);
        if (id > 0 && id === parseInt(id as any)) {
            let task = this.getTaskById(id);
            if (!task) {
                throw new Error('Task with the given ID does not exist.');
            }
            let data = this.getAllTasks();
            if (data.length === 0) {
                throw new Error('No tasks available to delete.');
            }
            data = data.filter((task: ITask) => task.id !== id);
            const str = JSON.stringify(data, null, "    ");
            this.insertBulkData(str);
            return true;
        }
    }
}