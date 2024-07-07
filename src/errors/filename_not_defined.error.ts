import { AppError } from "./_app.error.js";

export class FilenameNotDefinedError extends AppError {
    constructor() {
        super("Filename is not defined", 1004);
    }
}
