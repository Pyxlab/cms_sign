# @pyxlab/cms_sign

<br />

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

## Introduction

The `@pyxlab/cms_sign` package is a robust solution for creating and managing digital signatures in your projects. With an intuitive and flexible API, this package allows for the generation of digital signatures, verification of existing signatures, and manipulation of signature-related data in a secure and efficient manner.

## Features

- **Digital Signature Creation**: Easily generate digital signatures for your documents and data.
- **Signature Verification**: Verify the authenticity of digital signatures.
- **Compression Support**: Option to compress signed data, reducing the final file size.
- **Output Customization**: Set custom output paths, file names, and more.

## Installation

You can install the `@pyxlab/cms_sign` package using npm:

```sh
npm install @pyxlab/cms_sign
```

Or using yarn:

```sh
yarn add @pyxlab/cms_sign
```

## Usage

### Creating a Digital Signature

To create a digital signature, you can use the SignatureBuilder class:

```ts
import { SignatureBuilder } from '@pyxlab/cms_sign';

const builder = new SignatureBuilder();

try {
    const file = await builder.setDataBuffer(/* your data Buffer here */)
       .setSignaturePath(/* path to the signature file */)
       .setPassphrase(/* your passphrase here */)
       .setOutputPath(/* output path */)
       .setFilename(/* output file name */)
       .setCompression(true); // Enables compression
       .build();
} catch (error) {
  console.error('Error creating digital signature:', error);
}
```

### Verifying a Digital Signature

To verify a digital signature, you can use `node-forge`:

```ts
import fs from 'fs';
import forge from 'node-forge';

// Load the text file and signature
const txtFilePath = 'path/to/your/file.txt';
const signatureFilePath = 'path/to/your/file.txt.p7s';

const txtFileContent = fs.readFileSync(txtFilePath, 'utf8');
const signatureContent = fs.readFileSync(signatureFilePath, 'binary');

// Decode the signature
const p7 = forge.pkcs7.messageFromPem(signatureContent);

// Verify if the text file was correctly signed
const verified = p7.verify({content: txtFileContent});

if (verified) {
  console.log('The signature is valid.');
} else {
  console.log('The signature is invalid.');
}
```

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

To understand how to submit an issue, commit and create pull requests, check our [Contribution Guidelines](/.github/CONTRIBUTING.md).

### Code of Conduct

We expect you to follow our [Code of Conduct](/.github/CODE_OF_CONDUCT.md). You can read it to understand what kind of behavior will and will not be tolerated.

## License

Distributed under the ISC License. See [LICENSE](/LICENSE) for more information.

<div align="center">
  <sub>Built with ❤︎ by <a href="https://github.com/lncitador">Walaff Fernandes</a>
</div>


[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/pyxlab/cms_sign/checks.yml?style=for-the-badge
[gh-workflow-url]: https://github.com/pyxlab/cms_sign/actions/workflows/checks.yml "Github action"

[npm-image]: https://img.shields.io/npm/v/@pyxlab/cms_sign/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@pyxlab/cms_sign/v/latest "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/pyxlab/cms_sign?style=for-the-badge