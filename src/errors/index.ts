import { CertificateNotFoundError } from "./cert_not_found.error.js";
import { FilenameNotDefinedError } from "./filename_not_defined.error.js";
import { FilepathNotDefinedError } from "./filepath_not_defined.error.js";
import { PrivateKeyNotFoundError } from "./privatekey_not_found.error.js";
import { DataNotProvidedError } from "./data_not_provided.error.js";
import { SignatureNotProvidedError } from "./signature_not_provided.error.js";

const errors = {
    CERT_NOT_FOUND: CertificateNotFoundError,
    PRIVATEKEY_NOT_FOUND: PrivateKeyNotFoundError,
    FILEPATH_NOT_DEFINED: FilepathNotDefinedError,
    FILENAME_NOT_DEFINED: FilenameNotDefinedError,
    DATA_NOT_PROVIDED: DataNotProvidedError,
    SIGNATURE_NOT_PROVIDED: SignatureNotProvidedError,
} as const;

export default errors;
