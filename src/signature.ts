import { resolve } from "node:path";
import { access, mkdir, rm, writeFile } from "node:fs/promises";
import AdmZip from "adm-zip";
import errors from "./errors/index.js";

export interface ISignatureEntity {
    readonly data: Buffer;
    readonly signature: Buffer;
    builder(): SignatureEntityBuilder;
}

export class SignatureEntityBuilder {
    #data: Buffer;
    #signature: Buffer;

    #compression = false;
    #filePath = "";
    #filename = "";

    constructor(data: Buffer, signature: Buffer) {
        if (!data) throw new errors.DATA_NOT_PROVIDED();
        if (!signature) throw new errors.SIGNATURE_NOT_PROVIDED();

        this.#data = data;
        this.#signature = signature;
    }

    public setCompression(compression: boolean): this {
        this.#compression = compression;

        return this;
    }

    public setOutputPath(directory: string): this {
        this.#filePath = directory;

        return this;
    }

    public setFilename(filename: string): this {
        this.#filename = filename;

        return this;
    }

    public async build(): Promise<string> {
        if (!this.#filePath) throw new errors.FILEPATH_NOT_DEFINED();
        if (!this.#filename) throw new errors.FILENAME_NOT_DEFINED();

        const basename = this.#filename.split(".")[0];
        const extension = this.#filename.split(".")[1] || "txt";
        const filename = `${basename}.${extension}`;
        const directory = await this.prepareFolder(this.#filePath, basename);

        console.log({ directory });

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

    private async prepareFolder(filepath: string, basename: string) {
        const directory = resolve(
            __dirname,
            filepath,
            `${basename}-${Date.now()}`
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
        public readonly signature: Buffer
    ) {
        this.#builder = new SignatureEntityBuilder(data, signature);
    }

    public builder(): SignatureEntityBuilder {
        return this.#builder;
    }
}
