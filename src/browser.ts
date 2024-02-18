import puppeteer from "puppeteer";
import {BrowserPage, PagePDFOptions} from "./page";

export class BrowserHelper {

    static browser;

    async getPage(options?: Partial<PagePDFOptions>) {
        const page = await this.getBrowser().then(b => b.newPage());
        return new BrowserPage(this, page, options);
    }

    static close() {
        if (BrowserHelper.browser) {
            console.log(`Closing active browser`);
            BrowserHelper.browser.close();
            BrowserHelper.browser = null;
        }
    }

    async getBrowser() {
        if (!BrowserHelper.browser) {
            console.log(`Launching browser`);
            BrowserHelper.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            })
        }

        return BrowserHelper.browser;
    }

    async close() {
        return BrowserHelper.close();
    }
}
