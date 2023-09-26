import {Page} from "puppeteer";
import {PDFDocument} from 'pdf-lib'

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

        return await pdfDoc.save();
    }

    private async loadUrl(data: string) {
        await this.page.goto(data, {
            waitUntil: "networkidle0",
        });
    }

    private async extractElement(elementId) {

        const elementHeight = await this.measureElement(elementId);
        if (!elementHeight) {
            return null;
        }

        await this.page.evaluate((elementId) => {
            // Hide all elements on the page
            let style = document.createElement('style');
            style.id = 'hideAllExceptElementId';
            style.innerHTML = `body > *:not(#${elementId}) { display: none !important; }`;
            document.head.appendChild(style);

            // Return the outerHTML of the desired element for further processing (if needed)
            let element = document.getElementById(elementId);
            return element ? element.outerHTML : null;
        }, elementId);

        // Capture the element as a PDF

        const MARGIN = 0; // Needed to avoid getting two pages

        const output = await this.pdf({
            height: elementHeight.heightPx + MARGIN + 'px', // Need to consider what the effect of measuring this in pixels is
            width: this.paperWidth,
        })

        await this.page.evaluate(() => {
            // Find the style tag by its ID and remove it
            let style = document.getElementById('hideAllExceptElementId');
            if (style) {
                style.remove();
            }
        });

        const pdfDocument = await PDFDocument.load(output, {
            updateMetadata: false,
        });

        return {
            output, pdfDocument, heightPts: pdfDocument.getPage(0).getHeight(), heightPx: elementHeight.heightPx,
        };
    }

    private async pdf(pdfOptions: PagePDFOptions) {
        return await this.page.pdf({
            height: pdfOptions.height, width: pdfOptions.width, omitBackground: false, margin: {
                top: 0, left: 0, bottom: 0, right: 0
            }, printBackground: true,
        });
    }

    private async loadString(data: string) {
        await this.page.setContent(data, {
            waitUntil: [
                "load",
                "networkidle0",
                "domcontentloaded"
            ]
        });
        await this.page.waitForNetworkIdle()
    }
}
