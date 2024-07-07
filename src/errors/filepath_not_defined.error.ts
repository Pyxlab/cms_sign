import { AppError } from "./_app.error.js";

export class FilepathNotDefinedError extends AppError {
    constructor() {
        super("Filepath is not defined", 1003);
    }
}
