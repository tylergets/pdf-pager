import {BrowserHelper} from "./browser";
import * as fs from "fs";

class PDFPagerOptions {
    height: string = "11in";
    width: string = "8.5in";
    browser = new BrowserHelper();
}

export class PDFPager {


    constructor(defaultConfig: PDFPagerOptions) {
        this.config = defaultConfig;
    }

    private config: PDFPagerOptions;


    static create(options?: Partial<PDFPagerOptions>): PDFPager {
        const defaultConfig = new PDFPagerOptions();
        Object.assign(defaultConfig, options);
        return new PDFPager(defaultConfig);
    }

    async fromFile(filePath: string) {
        let htmlContent = await fs.promises.readFile(filePath).then((buffer) => buffer.toString());
        return this.load(htmlContent);
    }

    async fromString(htmlContent: string) {
        return this.load(htmlContent);
    }

    async fromURL(url: string) {
        return this.load(url);
    }

    private async load(data) {
        const page = await this.config.browser.getPage({
            height: this.config.height,
            width: this.config.width,
        });

        await page.load(data);

        return page.getAll();
    }
}
