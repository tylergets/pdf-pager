import {BrowserHelper} from "./browser";
import * as fs from "fs";
import path from "path";

export class PDFPager {

    browser = new BrowserHelper();

    static async fromTemplate(html: string) {
        const browser = new BrowserHelper();

        const page = await browser.getPage();
        let htmlContent = await fs.promises.readFile(html).then((buffer) => buffer.toString());

        await page.load(htmlContent);

        const pdf = await page.getAll();

        console.log('Finished...');

        const fileName = path.basename(html);
        fs.writeFileSync(`examples/${fileName.split(".")[0]}.pdf`, pdf);

        return pdf
    }

    static async fromURL(url: string) {
        const browser = new BrowserHelper();

        const page = await browser.getPage();
        await page.load(url);

        const pdf = await page.getAll();

        console.log('Finished...');

        return pdf;
    }
}
