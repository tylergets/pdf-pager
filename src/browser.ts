import puppeteer from "puppeteer";
import {BrowserPage, PagePDFOptions} from "./page";

export class BrowserHelper {

    browser;

    async getPage(options?: Partial<PagePDFOptions>) {
        const page = await this.getBrowser().then(b => b.newPage());

        return new BrowserPage(page, options);
    }

    async getBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: !process.env.DEBUG,
            })
        }

        return this.browser;
    }
}
