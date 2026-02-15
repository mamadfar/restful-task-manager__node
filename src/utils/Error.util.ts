import chalk from "chalk";

export default class ErrorUtil {

    private static error = chalk.redBright.bold;
    private static warn = chalk.yellowBright.bold;
    private static success = chalk.greenBright.bold;

    static handleError(msg: string, commands: readonly string[]) {
                const message = `${this.error(msg)}
Available commands are:
${this.warn(commands.join("\n"))}`;
    console.log(message);
    }

    static consoleMessage(message: string, type: 'error' | 'warn' | 'success') {
        console.log(this[type](message))
    }
}