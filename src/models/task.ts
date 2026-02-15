/* As a convention, it's better to import modules in this order: built-in, third-party, local */
import util from 'util'

import chalk from 'chalk'

import DB from './db.js'
import { ITask } from '../types/task.type.js';

export default class Task {
    #id = 0;
    #title = '';
    #completed = false;

    constructor(title: string, completed = false) {
        this.#title = title;
        this.#completed = completed;
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    get completed() {
        return this.#completed;
    }

    set title(title: string) {
        if (typeof title !== 'string' || title.length < 3) {
            throw new Error('Title must be a string with at least 3 characters.');
        }
        this.#title = title;
    }
    set completed(completed: boolean) {
        if (typeof completed !== 'boolean') {
            throw new Error('Completed must be a boolean value.');
        }
        this.#completed = completed;
    }

    [util.inspect.custom]() {
        return `Task {
    id: ${chalk.yellowBright(this.#id)}
    title: ${chalk.green(`"${this.#title}"`)}
    completed: ${chalk.blueBright(this.#completed)}
}`
    }

    save() {
        try {
            const id = DB.saveTask(this.#title, this.#completed, this.#id);
            this.#id = id;
        } catch (error) {
            throw new Error((error as any).message);
        }
    }

    static getTaskById(id: number): Task | false {
        const data = DB.getTaskById(id);
        if (data) {
            const task = new Task(data.title, data.completed);
            task.#id = data.id;
            return task;
        } else {
            return false;
        }
    }

    static getTaskByTitle(title: string): Task | false {
        const data = DB.getTaskByTitle(title);
        if (data) {
            const task = new Task(data.title, data.completed);
            task.#id = data.id;
            return task;
        } else {
            return false;
        }
    }

    static getAllTasks(rawObject = false): ITask[] | Task[] {
        const data = DB.getAllTasks();
        if (rawObject) {
            return data;
        }
        return data.map(task => {
            const t = new Task(task.title, task.completed);
            t.#id = task.id;
            return t;
        })
    }
}