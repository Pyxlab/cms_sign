import { AppError } from "./_app.error.js";

export class CertificateExtractionFailedError extends AppError {
    constructor() {
        super("Failed to extract certificate from signature", 1009);
    }
}
