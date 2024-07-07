import crypto from "node:crypto";
import forge from "node-forge";

import errors from "./errors/index.js";
import { SignatureEntity } from "./signature.js";

export class SignatureProvider {
    readonly #data: Buffer;
    readonly #privateKey: forge.pki.rsa.PrivateKey;
    readonly #certificate: forge.pki.Certificate;
    readonly #eol: "/r/n" | "/n";

    constructor(
        data: Buffer,
        signature: Buffer,
        passphrase: string,
        end_of_line: "LF" | "CRLF" = "LF"
    ) {
        this.#data = data;
        this.#eol = end_of_line === "LF" ? "/n" : "/r/n";

        const { privateKey, certificate } = SignatureProvider.parseSignature(
            signature,
            passphrase
        );

        this.#privateKey = privateKey;
        this.#certificate = certificate;
    }

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

    private static parseSignature(signature: Buffer, passphrase: string) {
        const p12Asn1 = forge.asn1.fromDer(signature.toString("binary"));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);

        const keyBag = p12.getBags({ bagType: forge.pki.oids.keyBag });
        if (!keyBag[forge.pki.oids.keyBag]) {
            throw new errors.PRIVATEKEY_NOT_FOUND();
        }

        const keyObj = keyBag[forge.pki.oids.keyBag]![0];

        const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
        if (!certBag[forge.pki.oids.certBag]) {
            throw new errors.CERT_NOT_FOUND();
        }

        const certObj = certBag[forge.pki.oids.certBag]![0];

        const privateKey = forge.pki.privateKeyToPem(keyObj.key!);
        const parsedPrivateKey = forge.pki.privateKeyFromPem(privateKey);

        return {
            privateKey: parsedPrivateKey,
            certificate: certObj.cert!,
        };
    }

    private calculateChecksum(line: string): string {
        return crypto.createHash("sha256").update(line, "utf8").digest("hex");
    }
}
