import { AppError } from "./_app.error.js";

export class SignatureNotProvidedError extends AppError {
    constructor() {
        super("Signature not provided", 1006);
    }
}
