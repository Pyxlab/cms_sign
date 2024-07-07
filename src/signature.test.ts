import { rm, rmdir } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import { SignatureEntity, SignatureEntityBuilder } from "./signature.js";
import { DataNotProvidedError } from "./errors/data_not_provided.error.js";
import { FilenameNotDefinedError } from "./errors/filename_not_defined.error.js";
import { FilepathNotDefinedError } from "./errors/filepath_not_defined.error.js";

describe("SignatureEntity", () => {
    describe("constructor", () => {
        it("should create a SignatureEntity instance with the provided data and signature", () => {
            const testData = Buffer.from("Test data", "utf8");
            const testSignature = Buffer.from("Test signature", "utf8");

            const signatureEntity = new SignatureEntity(
                testData,
                testSignature
            );

            expect(signatureEntity).toBeInstanceOf(SignatureEntity);
            expect(signatureEntity.data).toEqual(testData);
            expect(signatureEntity.signature).toEqual(testSignature);
        });

        it("should throw an error if the data is not provided", () => {
            try {
                new SignatureEntity(
                    undefined!,
                    Buffer.from("Test signature", "utf8")
                );
            } catch (error) {
                expect(error).toBeInstanceOf(DataNotProvidedError);
            }
        });

        it("should throw an error if the signature is not provided", () => {
            try {
                new SignatureEntity(
                    Buffer.from("Test data", "utf8"),
                    undefined!
                );
            } catch (error) {
                expect(error).toBeInstanceOf(DataNotProvidedError);
            }
        });

        it("should return a SignatureEntityBuilder instance", () => {
            const testData = Buffer.from("Test data", "utf8");
            const testSignature = Buffer.from("Test signature", "utf8");
            const signatureEntity = new SignatureEntity(
                testData,
                testSignature
            );

            const builder = signatureEntity.builder;

            expect(builder).toBeInstanceOf(SignatureEntityBuilder);
        });
    });

    describe("builder", () => {
        it("should return a SignatureEntityBuilder instance", () => {
            const testData = Buffer.from("Test data", "utf8");
            const testSignature = Buffer.from("Test signature", "utf8");
            const signatureEntity = new SignatureEntity(
                testData,
                testSignature
            );

            const builder = signatureEntity.builder;

            expect(builder).toBeInstanceOf(SignatureEntityBuilder);
        });

        it("should not build if no filename is provided", async () => {
            const testData = Buffer.from("Test data", "utf8");
            const testSignature = Buffer.from("Test signature", "utf8");
            const signatureEntity = new SignatureEntity(
                testData,
                testSignature
            );

            try {
                await signatureEntity.builder.setOutputPath("test").build();
            } catch (error) {
                expect(error).toBeInstanceOf(FilenameNotDefinedError);
            }
        });

        it("should not build if no filepath is provided", async () => {
            const testData = Buffer.from("Test data", "utf8");
            const testSignature = Buffer.from("Test signature", "utf8");
            const signatureEntity = new SignatureEntity(
                testData,
                testSignature
            );

            try {
                await signatureEntity.builder.setFilename("test").build();
            } catch (error) {
                expect(error).toBeInstanceOf(FilepathNotDefinedError);
            }
        });

        it("should build the signature", async () => {
            const testData = Buffer.from("Test data", "utf8");
            const testSignature = Buffer.from("Test signature", "utf8");
            const signatureEntity = new SignatureEntity(
                testData,
                testSignature
            );

            const directory = "../tmp/signatures";
            const filename = "test.txt";
            const result = await signatureEntity.builder
                .setOutputPath(directory)
                .setFilename(filename)
                .build();

            expect(result).toContain("tmp/signatures/test");

            await rmdir(result, { recursive: true });
        });

        it("should build the compressed signature", async () => {
            const testData = Buffer.from("Test data", "utf8");
            const testSignature = Buffer.from("Test signature", "utf8");
            const signatureEntity = new SignatureEntity(
                testData,
                testSignature
            );

            const directory = "../tmp/signatures";
            const filename = "test-compression.txt";
            const result = await signatureEntity.builder
                .setOutputPath(directory)
                .setFilename(filename)
                .setCompression(true)
                .build();

            expect(result).toContain(".zip");

            await rm(result, { recursive: true });
        });
    });
});
