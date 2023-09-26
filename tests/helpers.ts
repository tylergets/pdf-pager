const PDFExtract = require('pdf.js-extract').PDFExtract;

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
