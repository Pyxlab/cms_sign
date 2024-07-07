import crypto from "node:crypto";
import forge from "node-forge";

import errors from "./errors/index.js";
import { SignatureEntity } from "./signature.js";

/**
 * SignatureProvider class for signing data using a private key and certificate.
 */
export class SignatureProvider {
    /**
     * The data to be signed.
     */
    readonly #data: Buffer;
    /**
     * The private key used for signing.
     */
    readonly #privateKey: forge.pki.rsa.PrivateKey;
    /**
     * The certificate associated with the private key.
     */
    readonly #certificate: forge.pki.Certificate;
    /**
     * The end-of-line character sequence used in the data.
     */
    readonly #eol: "/r/n" | "/n";

    /**
     * Creates a new SignatureProvider instance.
     * @param data The data to be signed.
     * @param signature The signature buffer.
     * @param passphrase The passphrase for the private key.
     * @param end_of_line The end-of-line character sequence used in the data. Default is "LF".
     */
    constructor(
        data: Buffer,
        signature: Buffer,
        passphrase: string,
        end_of_line: "LF" | "CRLF" = "LF"
    ) {
        this.#data = data;
        this.#eol = end_of_line === "LF" ? "/n" : "/r/n";

        const { privateKey, certificate } = SignatureProvider.unpackP12(
            signature,
            passphrase
        );

        this.#privateKey = privateKey;
        this.#certificate = certificate;
    }

    /**
     * Signs the data and returns the signature entity.
     * @returns The signature entity containing the signed data and signature.
     */
    public sign(): SignatureEntity {
        const lines = this.#data.toString("utf-8").split(this.#eol);
        const checksums = lines.map(this.calculateChecksum);

        const signedChecksums = checksums.map((checksum) => {
            const md = forge.md.sha256.create();
            md.update(checksum, "utf8");
            const signature = this.#privateKey.sign(md);
            return forge.util.encode64(signature);
        });

        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(
            signedChecksums.join(this.#eol),
            "utf8"
        );
        p7.addCertificate(this.#certificate);
        p7.addSigner({
            key: this.#privateKey,
            certificate: this.#certificate,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data,
                },
                {
                    type: forge.pki.oids.messageDigest,
                    value: forge.util.encode64(
                        forge.md.sha256.create().digest().getBytes()
                    ),
                },
                {
                    type: forge.pki.oids.signingTime,
                    value: new Date().toISOString(),
                },
            ],
        });

        p7.sign({ detached: true });

        const p7Asn1 = p7.toAsn1();
        const p7Der = forge.asn1.toDer(p7Asn1).getBytes();
        const p7Txt = forge.util.encode64(p7Der);

        const data = Buffer.from(checksums.join(this.#eol), "utf8");
        const signature = Buffer.from(p7Txt, "base64");

        return new SignatureEntity(data, signature);
    }

    /**
     * Unpacks the P12 signature and returns the private key and certificate.
     * @param signature The signature buffer.
     * @param passphrase The passphrase for the private key.
     * @returns An object containing the private key and certificate.
     * @throws {errors.PRIVATEKEY_EXTRACTION_FAILED} If the private key extraction fails.
     * @throws {errors.CERTIFICATE_EXTRACTION_FAILED} If the certificate extraction fails.
     */
    private static unpackP12(signature: Buffer, passphrase: string) {
        const p12Asn1 = forge.asn1.fromDer(signature.toString("binary"));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);

        const keyBags = p12.getBags({
            bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
        });

        const keyObj = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]![0];

        if (!keyObj || !keyObj.key) {
            throw new errors.PRIVATEKEY_EXTRACTION_FAILED();
        }

        const pkiKey = forge.pki.privateKeyToPem(keyObj.key);
        const privateKey = forge.pki.privateKeyFromPem(pkiKey);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certObj = certBags[forge.pki.oids.certBag]![0];

        if (!certObj || !certObj.cert) {
            throw new errors.CERTIFICATE_EXTRACTION_FAILED();
        }

        const certificate = certObj.cert;

        return {
            privateKey,
            certificate,
        };
    }

    /**
     * Calculates the checksum for a given line of text.
     * @param line The line of text.
     * @returns The calculated checksum.
     */
    private calculateChecksum(line: string): string {
        return crypto.createHash("sha256").update(line, "utf8").digest("hex");
    }
}
