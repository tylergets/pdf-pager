import * as assert from "assert";

const PDFExtract = require('pdf.js-extract').PDFExtract;
import { PDFDocument } from 'pdf-lib'

// Could probably be rewritten, first pass at it.

export async function pdfContains(pdf: Buffer | Uint8Array, text: string) {
    const pdfExtract = new PDFExtract();

    const options = {};
    const elements = await new Promise<any>((resolve, reject) => {
        pdfExtract.extractBuffer(pdf, options, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });

    for (const page of elements.pages) {
        for (const content of page.content) {
            const elementText = content.str;
            if (elementText) {
                if (elementText.toLowerCase().includes(text.toLowerCase())) {
                    console.log(`Matches: ${elementText}`)
                    return true
                }
            }
        }
    }

    return false
}

class PdfAssertions {
    file: Buffer | Uint8Array;

    constructor(file: Buffer | Uint8Array) {
        this.file = file;
    }

    get document() {
        return PDFDocument.load(this.file, {
            updateMetadata: false,
        });
    }

    get height() {
        return this.document.then((doc) => doc.getPage(0).getHeight());
    }

    get width() {
        return this.document.then((doc) => doc.getPage(0).getWidth());
    }

    get heightIn() {
        return this.document.then((doc) => doc.getPage(0).getHeight() * 72);
    }
    get widthIn() {
        return this.document.then((doc) => doc.getPage(0).getWidth() * 72);
    }
}

export async function testPdf(pdf: Buffer | Uint8Array) {
    return new PdfAssertions(pdf);
}
