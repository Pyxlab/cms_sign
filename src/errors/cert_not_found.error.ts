import { AppError } from "./_app.error.js";

export class CertificateNotFoundError extends AppError {
    constructor() {
        super("Certificate not found in the signature", 1002);
    }
}
