import { Page } from 'puppeteer';

declare class PagePDFOptions {
    height: string;
    width: string;
}
declare class BrowserPage {
    page: Page;
    private config;
    private browser;
    constructor(browser: BrowserHelper, page: Page, options?: Partial<PagePDFOptions>);
    get paperHeight(): string;
    get paperWidth(): string;
    load(data: string): Promise<void>;
    measureElement(elementId: any): Promise<{
        widthPx: number;
        heightPx: number;
    }>;
    removeElement(elementId: any): Promise<void>;
    getAll(): Promise<{
        header: Buffer;
        footer: Buffer;
        combined: ArrayBufferLike;
    }>;
    private loadUrl;
    private extractElement;
    private pdf;
    private loadString;
}

declare class BrowserHelper {
    static browser: any;
    getPage(options?: Partial<PagePDFOptions>): Promise<BrowserPage>;
    static close(): void;
    getBrowser(): Promise<any>;
    close(): Promise<void>;
}

declare class PDFPagerOptions {
    height: string;
    width: string;
    browser: BrowserHelper;
}
declare class PDFPagerResult {
    header?: ArrayBufferLike;
    footer?: ArrayBufferLike;
    combined: ArrayBufferLike;
    constructor(options: Partial<PDFPagerResult>);
}
declare class PDFPager {
    constructor(defaultConfig: PDFPagerOptions);
    private config;
    static create(options?: Partial<PDFPagerOptions>): PDFPager;
    fromFile(filePath: string): Promise<PDFPagerResult>;
    fromString(htmlContent: string): Promise<PDFPagerResult>;
    fromURL(url: string): Promise<PDFPagerResult>;
    private load;
}

export { PDFPager };
