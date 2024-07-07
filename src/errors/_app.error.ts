export abstract class AppError extends Error {
    readonly #code: number;

    constructor(message: string, code: number) {
        super(message);

        this.#code = code;
    }

    public get code() {
        return this.#code;
    }

    public toJSON() {
        return {
            code: this.#code,
            message: this.message,
        };
    }

    public toString() {
        return `${this.name} [${this.#code}]: ${this.message}`;
    }
}
