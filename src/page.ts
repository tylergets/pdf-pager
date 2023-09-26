import {Page} from "puppeteer";
import {PDFDocument} from 'pdf-lib'
import * as fs from "fs";

export class PagePDFOptions {
    height: string = "11in";
    width: string = "8.5in";
}

export class BrowserPage {

    page: Page;
    private config: PagePDFOptions;

    constructor(page: Page, options?: Partial<PagePDFOptions>) {
        const defaultOptions = new PagePDFOptions()
        Object.assign(defaultOptions, options);

        this.config = defaultOptions;
        this.page = page;

        // page.on("response", async (response) => {
        //     // console.log('Hooked into response');
        //     // const url = await response.url();
        //     // const text = await response.text();
        //     // console.log(text);
        // })
    }

    get paperHeight() {
        return this.config.height;
    }

    get paperWidth() {
        return this.config.width;
    }

    async load(data: string) {

        await this.page.emulateMediaType('print');

        if (data.startsWith("http")) {
            return this.loadUrl(data);
        }
        return this.loadString(data);
    }

    measureElement(elementId) {
        return this.page.evaluate((elementId) => {
            const element = document.getElementById(elementId);
            if (!element) {
                return null;
            }
            const rect = element.getBoundingClientRect();
            return {
                widthPx: rect.width, heightPx: rect.height,
            };
        }, elementId);
    }

    removeElement(elementId) {
        return this.page.evaluate((elementId) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.remove();
            }
        }, elementId);
    }

    async getAll() {

        const PtsPI = 72;

        const header = await this.extractElement("header");
        const footer = await this.extractElement("footer");

        await this.removeElement("header");
        await this.removeElement("footer");

        const heightPts = (parseFloat(this.paperHeight) * PtsPI) - ((header?.heightPts ?? 0) + (footer?.heightPts ?? 0));

        if (isNaN(heightPts / PtsPI)) {
            throw new Error(`Height of ${this.paperHeight} is not a number, header: ${header?.heightPts}, footer: ${footer?.heightPts}, heightPts: ${heightPts}`);
        } else if (heightPts < 0) {
            throw new Error(`Height of ${this.paperHeight} is less than 0, header: ${header?.heightPts}, footer: ${footer?.heightPts}, heightPts: ${heightPts}`);
        }

        let pageRenderHeight = heightPts / PtsPI + 'in';
        const allPages = await this.pdf({
            height: pageRenderHeight, width: this.paperWidth,
        });

        const pdfDoc = await PDFDocument.create()

        const pageDoc = await PDFDocument.load(allPages);

        const pages = await pdfDoc.copyPages(pageDoc, pageDoc.getPageIndices());

        for (let i = 0; i < pages.length; i++) {
            const newPage = pdfDoc.addPage();
            const page = pages[i];

            let pageHeight = page.getHeight();
            let newHeight = pageHeight + (header?.heightPts ?? 0) + (footer?.heightPts ?? 0);

            newPage.setSize(page.getWidth(), newHeight);

            if (header) {
                const [headerEmbed] = await pdfDoc.embedPdf(header.output)
                newPage.drawPage(headerEmbed, {
                    height: header.heightPts, width: newPage.getWidth(), x: 0, y: newPage.getHeight() - header.heightPts,
                })
            }

            if (footer) {
                const [footerEmbed] = await pdfDoc.embedPdf(footer.output)
                newPage.drawPage(footerEmbed, {
                    height: footer.heightPts, width: newPage.getWidth(), x: 0, y: 0,
                })
            }

            const embed = await pdfDoc.embedPage(page);
            newPage.drawPage(embed, {
                height: page.getHeight(), width: newPage.getWidth(), x: 0, y: footer?.heightPts || 0,
            })
        }

        const output = await pdfDoc.save();

        await this.page.close();

        return {
            header: header?.output, footer: footer?.output, combined: output.buffer,
        };
    }

    private async loadUrl(data: string) {
        await this.page.goto(data, {
            waitUntil: "networkidle0",
        });
    }

    private async extractElement(elementId) {

        const elementHeight = await this.measureElement(elementId);
        if (!elementHeight || elementHeight.heightPx <= 0) {
            return null;
        }

        await this.page.evaluate((elementId) => {
            let style = document.createElement('style');
            style.id = 'hideAllExceptElementId';

            // This one works, but generates a lot of extra pages, maybe we get just the first page
            // style.innerHTML = `body {  visibility: hidden; } #${elementId} { visibility: visible; position: absolute; left: 0; top: 0; width: 100% }`;

            style.innerHTML = `body > *:not(#${elementId}) { display: none !important; }`;
            document.head.appendChild(style);
        }, elementId);

        const output = await this.pdf({
            height: elementHeight.heightPx + 'px',
            width: this.paperWidth,
        })

        await this.page.evaluate(() => {
            // Find the style tag by its ID and remove it
            let style = document.getElementById('hideAllExceptElementId');
            if (style) {
                style.remove();
            }
        });

        await fs.promises.writeFile(`examples/${elementId}.pdf`, output);

        const pdfDocument = await PDFDocument.load(output, {
            updateMetadata: false,
        });

        return {
            output, pdfDocument, heightPts: pdfDocument.getPage(0).getHeight(), heightPx: elementHeight.heightPx,
        };
    }

    private async pdf(pdfOptions: PagePDFOptions) {

        if (parseFloat(pdfOptions.height) <= 0) {
            throw new Error(`Height of ${pdfOptions.height} is less than 0`);
        }

        return await this.page.pdf({
            height: pdfOptions.height, width: pdfOptions.width, omitBackground: false, printBackground: true, margin: {
                top: 0, left: 0, bottom: 0, right: 0
            },
        });
    }

    private async loadString(data: string) {
        await this.page.setContent(data, {
            waitUntil: ["load", "networkidle0", "domcontentloaded"]
        });
        await this.page.waitForNetworkIdle()
    }
}
