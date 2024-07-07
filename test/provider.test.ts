import { describe, it, expect } from "vitest";
import { SignatureProvider } from "../src/provider.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

describe("SignatureProvider", async () => {
    const data = Buffer.from("Test data", "utf8");
    const signature = await readFile(resolve(__dirname, "certificate.p12"));
    const passphrase = "1234";

    it("should sign the data and return a SignatureEntity", async () => {
        const signatureProvider = new SignatureProvider(
            data,
            signature,
            passphrase
        );

        expect(signatureProvider).toBeInstanceOf(SignatureProvider);
    });
});
