import { AppError } from "./_app.error.js";

export class DataNotProvidedError extends AppError {
    constructor() {
        super("Data not provided", 1005);
    }
}
