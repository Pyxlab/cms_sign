import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import AdmZip from "adm-zip";
import errors from "./errors/index.js";

export interface ISignatureEntity {
    readonly data: Buffer;
    readonly signature: Buffer;
    builder(): SignatureEntityBuilder;
}

/**
 * SignatureEntityBuilder class represents a builder for creating signature entities.
 */
export class SignatureEntityBuilder {
    #data: Buffer;
    #signature: Buffer;

    #compression = false;
    #filePath = "";
    #filename = "";

    /**
     * Creates an instance of SignatureEntityBuilder.
     * @param {Buffer} data - The data buffer.
     * @param {Buffer} signature - The signature buffer.
     * @throws {errors.DATA_NOT_PROVIDED} - If data is not provided.
     * @throws {errors.SIGNATURE_NOT_PROVIDED} - If signature is not provided.
     */
    constructor(data: Buffer, signature: Buffer) {
        if (!data) throw new errors.DATA_NOT_PROVIDED();
        if (!signature) throw new errors.SIGNATURE_NOT_PROVIDED();

        this.#data = data;
        this.#signature = signature;
    }

    /**
     * Sets the compression flag.
     * @param {boolean} compression - The compression flag.
     * @returns {this} The SignatureEntityBuilder instance.
     */
    public setCompression(compression: boolean): this {
        this.#compression = compression;

        return this;
    }

    /**
     * Sets the output path.
     * @param {string} directory - The output directory path.
     * @returns {this} The SignatureEntityBuilder instance.
     */
    public setOutputPath(directory: string): this {
        this.#filePath = directory;

        return this;
    }

    /**
     * Sets the filename.
     * @param {string} filename - The filename.
     * @returns {this} The SignatureEntityBuilder instance.
     */
    public setFilename(filename: string): this {
        this.#filename = filename;

        return this;
    }

    /**
     * Builds the signature entity.
     * @returns {Promise<string>} A promise that resolves to the path of the built signature entity.
     * @throws {errors.FILEPATH_NOT_DEFINED} - If the output path is not defined.
     * @throws {errors.FILENAME_NOT_DEFINED} - If the filename is not defined.
     */
    public async build(): Promise<string> {
        if (!this.#filePath) throw new errors.FILEPATH_NOT_DEFINED();
        if (!this.#filename) throw new errors.FILENAME_NOT_DEFINED();

        const basename = this.#filename.split(".")[0];
        const extension = this.#filename.split(".")[1] || "txt";
        const filename = `${basename}.${extension}`;
        const directory = await this.prepareFolder(this.#filePath, basename);

        const txt = resolve(directory, filename);
        const p7s = resolve(directory, filename.concat(".p7s"));

        if (this.#compression) {
            const zip = new AdmZip();

            await writeFile(txt, this.#data);
            await writeFile(p7s, this.#signature);

            zip.addLocalFolder(directory);
            await zip.writeZipPromise(directory.concat(".zip"));

            await rm(directory, { recursive: true });

            return directory.concat(".zip");
        }

        await writeFile(txt, this.#data);
        await writeFile(p7s, this.#signature);

        return directory;
    }

    /**
     * Prepares the folder for storing the signature entity.
     * @param {string} filepath - The output directory path.
     * @param {string} basename - The basename of the filename.
     * @returns {Promise<string>} A promise that resolves to the path of the prepared folder.
     */
    private async prepareFolder(filepath: string, basename: string) {
        const directory = resolve(
            __dirname,
            filepath,
            `${basename}-${Date.now()}`,
        );

        try {
            await access(directory);
            await rm(directory, { recursive: true });
            await mkdir(directory, { recursive: true });
        } catch (error) {
            await mkdir(directory, { recursive: true });
        }

        return directory;
    }
}

export class SignatureEntity implements ISignatureEntity {
    readonly #builder: SignatureEntityBuilder;

    constructor(
        public readonly data: Buffer,
        public readonly signature: Buffer,
    ) {
        this.#builder = new SignatureEntityBuilder(data, signature);
    }

    public builder(): SignatureEntityBuilder {
        return this.#builder;
    }
}
