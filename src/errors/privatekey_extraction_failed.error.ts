import { AppError } from "./_app.error.js";

export class PrivateKeyExtractionFailedError extends AppError {
    constructor() {
        super("Failed to extract private key from signature", 1008);
    }
}
