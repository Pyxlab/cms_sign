import { AppError } from "./_app.error.js";

export class PrivateKeyNotFoundError extends AppError {
    constructor() {
        super("Private key not found in the signature", 1001);
    }
}
