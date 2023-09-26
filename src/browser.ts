import puppeteer from "puppeteer";
import {BrowserPage} from "./page";

export class BrowserHelper {

    browser;

    async getPage() {
        const page = await this.getBrowser().then(b => b.newPage());


        return new BrowserPage(page);
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
