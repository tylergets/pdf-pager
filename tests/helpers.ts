const PDFExtract = require('pdf.js-extract').PDFExtract;
import { PDFDocument } from 'pdf-lib'
import * as fs from "fs";

export async function pdfContains(pdf: ArrayBufferLike, text: string) {
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
                    return true
                }
            }
        }
    }

    return false
}

class PdfAssertions {
    file: ArrayBufferLike;

    constructor(file: ArrayBufferLike) {
        this.file = file;
    }

    get document() {
        return PDFDocument.load(this.file, {
            updateMetadata: false,
        });
    }

    contains(text) {
        return pdfContains(this.file, text);
    }

    get height() {
        return this.document.then((doc) => doc.getPage(0).getHeight());
    }

    get width() {
        return this.document.then((doc) => doc.getPage(0).getWidth());
    }

    get heightIn() {
        return this.document.then((doc) => doc.getPage(0).getHeight() / 72).then((n) => {
            return Math.round(n * 100) / 100;
        })
    }

    get widthIn(): Promise<number> {
        return this.document.then((doc) => doc.getPage(0).getWidth() / 72).then((n) => {
            return Math.round(n * 100) / 100;
        })
    }

    async save(s: string) {
        await fs.promises.writeFile(`examples/${s}.pdf`, Buffer.from(this.file));
        console.log(`${s}.pdf saved to disk`);
    }
}

export async function testPdf(pdf: ArrayBufferLike) {
    return new PdfAssertions(pdf);
}
