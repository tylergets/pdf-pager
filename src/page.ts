import {Page, PaperFormat} from "puppeteer";
import * as fs from "fs";
import { PDFDocument } from 'pdf-lib'

interface PagePDFOptions {
    height: string,
    width: string,
}

export class BrowserPage {
    page: Page;

    format: PaperFormat = "A4";

    constructor(page: Page) {
        this.page = page;

        page.on("response", async (response) => {
            // console.log('Hooked into response');
            // const url = await response.url();
            // const text = await response.text();
            // console.log(text);
        })
    }

    async load(data: string) {

        await this.page.emulateMediaType('print');

        if (data.startsWith("http")) {
            return this.loadUrl(data);
        }
        return this.loadString(data);
    }

    private async loadUrl(data: string) {
        await this.page.goto(data, {
            waitUntil: "networkidle0",
        });
    }

    measureElement(elementId) {
        return this.page.evaluate((elementId) => {
            const element = document.getElementById(elementId);
            if (!element) {
                return null;
            }
            const rect = element.getBoundingClientRect();
            return {
                widthPx: rect.width,
                heightPx: rect.height,
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

    private async extractElement(elementId) {

        const elementHeight = await this.measureElement(elementId);
        if(!elementHeight) {
            return null;
        }

        console.log(`We have ${elementId}, with pixel height ${elementHeight.heightPx}`);

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

        fs.writeFileSync(__dirname + `/../examples/${elementId}.pdf`, output);

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
            output,
            pdfDocument,
            heightPts: pdfDocument.getPage(0).getHeight(),
            heightPx: elementHeight.heightPx,
        };
    }

    paperWidth: string = '8.3in';
    paperHeight: string = "11.7in";

    async getAll() {

        const PtsPI = 72;

        const header = await this.extractElement("header");
        const footer = await this.extractElement("footer");

        await this.removeElement("header");
        await this.removeElement("footer");

        const heightPts = (parseFloat(this.paperHeight) * PtsPI) - (header.heightPts + footer.heightPts);

        let pageRenderHeight = heightPts / PtsPI + 'in';
        console.log(`Rendering all pages with height of ${pageRenderHeight}`)
        const allPages = await this.pdf({
            height: pageRenderHeight,
            width: this.paperWidth,
        });

        fs.writeFileSync(__dirname + `/../examples/all.pdf`, allPages);

        const pdfDoc = await PDFDocument.create()

        const pageDoc = await PDFDocument.load(allPages);

        const pages = await pdfDoc.copyPages(pageDoc, pageDoc.getPageIndices());

        for (let i = 0; i < pages.length; i++){
            const newPage = pdfDoc.addPage();
            const page = pages[i];

            // TODO The values below are wrong because they are in pixels
            let pageHeight = page.getHeight();
            console.log('Page height: ' + pageHeight);
            let newHeight = pageHeight + (header?.heightPts) + (footer?.heightPts);
            console.log('New height: ' + newHeight);
            newPage.setSize(page.getWidth(), newHeight);

            if (header) {
                const [headerEmbed] = await pdfDoc.embedPdf(header.output)
                newPage.drawPage(headerEmbed, {
                    height: header.heightPts , // TODO This needs to be converted to points
                    width: newPage.getWidth(),
                    x: 0,
                    y: newPage.getHeight() - header.heightPts,  // TODO This needs to be converted to points
                })
            }

            if (footer) {
                const [footerEmbed] = await pdfDoc.embedPdf(footer.output)
                newPage.drawPage(footerEmbed, {
                    height: footer.heightPts, // TODO This needs to be converted to points
                    width: newPage.getWidth(),
                    x: 0,
                    y: 0,
                })
            }

            const embed = await pdfDoc.embedPage(page);
            console.log(`page ${i} height: ${page.getHeight()}`)
            newPage.drawPage(embed, {
                height: page.getHeight(),
                width: newPage.getWidth(),
                x: 0,
                y: footer?.heightPts || 0, // TODO This needs to be converted to points
            })
        }

        return await pdfDoc.save();
    }

    private async pdf(pdfOptions: PagePDFOptions) {

        console.log(`Paper height: ${pdfOptions.height}, paper width: ${pdfOptions.width}`)

        return await this.page.pdf({
            height: pdfOptions.height,
            width: pdfOptions.width,
            omitBackground: false,
            margin: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            },
            printBackground: true,
        });
    }

    private async loadString(data: string) {
        await this.page.setContent(data);
        await this.page.waitForNetworkIdle()
    }
}
