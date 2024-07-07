import { SignatureProvider } from "./provider.js";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * SignatureBuilder class for building signatures.
 */
export class SignatureBuilder {
    #dataLocation: string | null = null;
    #data: Buffer | null = null;
    #signaturePath: string | null = null;
    #passphrase: string | null = null;
    #outputPath: string | null = null;
    #filename: string | null = null;
    #compression: boolean = false;

    /**
     * Sets the data buffer for the signature builder.
     * @param data The data buffer.
     * @returns The SignatureBuilder instance.
     */
    setDataBuffer(data: Buffer): SignatureBuilder {
        this.#data = data;
        return this;
    }

    /**
     * Sets the data path for the signature builder.
     * @param dataPath The data path.
     * @returns The SignatureBuilder instance.
     */
    setDataPath(dataPath: string): SignatureBuilder {
        this.#dataLocation = dataPath;
        return this;
    }

    /**
     * Sets the signature path for the signature builder.
     * @param signaturePath The signature path.
     * @returns The SignatureBuilder instance.
     */
    setSignaturePath(signaturePath: string): SignatureBuilder {
        this.#signaturePath = signaturePath;
        return this;
    }

    /**
     * Sets the passphrase for the signature builder.
     * @param passphrase The passphrase.
     * @returns The SignatureBuilder instance.
     */
    setPassphrase(passphrase: string): SignatureBuilder {
        this.#passphrase = passphrase;
        return this;
    }

    /**
     * Sets the output path for the signature builder.
     * @param outputPath The output path.
     * @returns The SignatureBuilder instance.
     */
    setOutputPath(outputPath: string): SignatureBuilder {
        this.#outputPath = outputPath;
        return this;
    }

    /**
     * Sets the filename for the signature builder.
     * @param filename The filename.
     * @returns The SignatureBuilder instance.
     */
    setFilename(filename: string): SignatureBuilder {
        this.#filename = filename;
        return this;
    }

    /**
     * Sets the compression flag for the signature builder.
     * @param compression The compression flag.
     * @returns The SignatureBuilder instance.
     */
    setCompression(compression: boolean): SignatureBuilder {
        this.#compression = compression;
        return this;
    }

    /**
     * Builds the signature.
     * @returns A promise that resolves to the built signature.
     * @throws Error if data, signature path, or passphrase is not found.
     */
    async build(): Promise<string> {
        if (!this.#data && this.#dataLocation) {
            try {
                this.#data = await readFile(path.resolve(this.#dataLocation));
            } catch (error) {
                throw new Error("Data file not found");
            }
        } else if (!this.#data) {
            throw new Error("Data not found");
        }

        if (!this.#signaturePath) {
            throw new Error("Signature file not found");
        }

        if (!this.#passphrase) {
            throw new Error("Passphrase not found");
        }

        const signatureFile = await readFile(path.resolve(this.#signaturePath));
        const provider = new SignatureProvider(
            this.#data,
            signatureFile,
            this.#passphrase
        );

        const signature = provider.sign();
        const builder = signature.builder();

        if (this.#outputPath) {
            builder.setOutputPath(this.#outputPath);
        }

        if (this.#filename) {
            builder.setFilename(this.#filename);
        }

        if (this.#compression) {
            builder.setCompression(this.#compression);
        }

        return builder.build();
    }
}
