var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  PDFPager: () => PDFPager
});
module.exports = __toCommonJS(src_exports);

// src/browser.ts
var import_puppeteer = __toESM(require("puppeteer"));

// src/page.ts
var import_pdf_lib = require("pdf-lib");
var PagePDFOptions = class {
  constructor() {
    this.height = "11in";
    this.width = "8.5in";
  }
};
var BrowserPage = class {
  constructor(browser, page, options) {
    this.browser = browser;
    const defaultOptions = new PagePDFOptions();
    Object.assign(defaultOptions, options);
    this.config = defaultOptions;
    this.page = page;
  }
  get paperHeight() {
    return this.config.height;
  }
  get paperWidth() {
    return this.config.width;
  }
  load(data) {
    return __async(this, null, function* () {
      yield this.page.emulateMediaType("print");
      if (data.startsWith("http")) {
        yield this.loadUrl(data);
      } else {
        yield this.page.exposeFunction("pdfPagerLog", (data2) => {
          console.log(`PDFPager - From page: ${data2}`);
        });
        yield this.page.evaluate(() => {
          window.PagerPDF = {
            ping() {
              return "pong";
            },
            currentPage() {
              return 1;
            },
            totalPages() {
              return 1;
            },
            log(...args) {
              window.pdfPagerLog(args);
            }
          };
        });
        yield this.loadString(data);
      }
    });
  }
  measureElement(elementId) {
    return this.page.evaluate((elementId2) => {
      const element = document.getElementById(elementId2);
      if (!element) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      return {
        widthPx: rect.width,
        heightPx: rect.height
      };
    }, elementId);
  }
  removeElement(elementId) {
    return this.page.evaluate((elementId2) => {
      const element = document.getElementById(elementId2);
      if (element) {
        element.remove();
      }
    }, elementId);
  }
  getAll() {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const PtsPI = 72;
      const header = yield this.extractElement("header");
      const footer = yield this.extractElement("footer");
      yield this.removeElement("header");
      yield this.removeElement("footer");
      const heightPts = parseFloat(this.paperHeight) * PtsPI - (((_a = header == null ? void 0 : header.heightPts) != null ? _a : 0) + ((_b = footer == null ? void 0 : footer.heightPts) != null ? _b : 0));
      if (isNaN(heightPts / PtsPI)) {
        throw new Error(`Height of ${this.paperHeight} is not a number, header: ${header == null ? void 0 : header.heightPts}, footer: ${footer == null ? void 0 : footer.heightPts}, heightPts: ${heightPts}`);
      } else if (heightPts < 0) {
        throw new Error(`Height of ${this.paperHeight} is less than 0, header: ${header == null ? void 0 : header.heightPts}, footer: ${footer == null ? void 0 : footer.heightPts}, heightPts: ${heightPts}`);
      }
      let pageRenderHeight = heightPts / PtsPI + "in";
      const allPages = yield this.pdf({
        height: pageRenderHeight,
        width: this.paperWidth
      });
      const pdfDoc = yield import_pdf_lib.PDFDocument.create();
      const pageDoc = yield import_pdf_lib.PDFDocument.load(allPages);
      const pages = yield pdfDoc.copyPages(pageDoc, pageDoc.getPageIndices());
      for (let i = 0; i < pages.length; i++) {
        const newPage = pdfDoc.addPage();
        const page = pages[i];
        let pageHeight = page.getHeight();
        let newHeight = pageHeight + ((_c = header == null ? void 0 : header.heightPts) != null ? _c : 0) + ((_d = footer == null ? void 0 : footer.heightPts) != null ? _d : 0);
        newPage.setSize(page.getWidth(), newHeight);
        if (header) {
          const [headerEmbed] = yield pdfDoc.embedPdf(header.output);
          newPage.drawPage(headerEmbed, {
            height: header.heightPts,
            width: newPage.getWidth(),
            x: 0,
            y: newPage.getHeight() - header.heightPts
          });
        }
        if (footer) {
          const [footerEmbed] = yield pdfDoc.embedPdf(footer.output);
          newPage.drawPage(footerEmbed, {
            height: footer.heightPts,
            width: newPage.getWidth(),
            x: 0,
            y: 0
          });
        }
        const embed = yield pdfDoc.embedPage(page);
        newPage.drawPage(embed, {
          height: page.getHeight(),
          width: newPage.getWidth(),
          x: 0,
          y: (footer == null ? void 0 : footer.heightPts) || 0
        });
      }
      const output = yield pdfDoc.save();
      yield this.page.close();
      yield this.browser.close();
      return {
        header: header == null ? void 0 : header.output,
        footer: footer == null ? void 0 : footer.output,
        combined: output.buffer
      };
    });
  }
  loadUrl(data) {
    return __async(this, null, function* () {
      yield this.page.goto(data, {
        waitUntil: "networkidle0"
      });
    });
  }
  extractElement(elementId) {
    return __async(this, null, function* () {
      const elementHeight = yield this.measureElement(elementId);
      if (!elementHeight || elementHeight.heightPx <= 0) {
        return null;
      }
      yield this.page.evaluate((elementId2) => {
        let style = document.createElement("style");
        style.id = "hideAllExceptElementId";
        style.innerHTML = `body > *:not(#${elementId2}) { display: none !important; }`;
        document.head.appendChild(style);
      }, elementId);
      const output = yield this.pdf({
        height: elementHeight.heightPx + "px",
        width: this.paperWidth
      });
      yield this.page.evaluate(() => {
        let style = document.getElementById("hideAllExceptElementId");
        if (style) {
          style.remove();
        }
      });
      const pdfDocument = yield import_pdf_lib.PDFDocument.load(output, {
        updateMetadata: false
      });
      return {
        output,
        pdfDocument,
        heightPts: pdfDocument.getPage(0).getHeight(),
        heightPx: elementHeight.heightPx
      };
    });
  }
  pdf(pdfOptions) {
    return __async(this, null, function* () {
      if (parseFloat(pdfOptions.height) <= 0) {
        throw new Error(`Height of ${pdfOptions.height} is less than 0`);
      }
      yield this.page.evaluate(() => {
        var _a;
        (_a = window.PagerPDF) == null ? void 0 : _a.log("About to print PDF, injecting handler");
      });
      return yield this.page.pdf({
        height: pdfOptions.height,
        width: pdfOptions.width,
        omitBackground: false,
        printBackground: true,
        margin: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        }
      });
    });
  }
  loadString(data) {
    return __async(this, null, function* () {
      yield this.page.setContent(data, {
        waitUntil: ["load", "networkidle0", "domcontentloaded"]
      });
      yield this.page.waitForNetworkIdle();
    });
  }
};

// src/browser.ts
var BrowserHelper = class _BrowserHelper {
  getPage(options) {
    return __async(this, null, function* () {
      const page = yield this.getBrowser().then((b) => b.newPage());
      return new BrowserPage(this, page, options);
    });
  }
  static close() {
    if (_BrowserHelper.browser) {
      console.log(`Closing active browser`);
      _BrowserHelper.browser.close();
      _BrowserHelper.browser = null;
    }
  }
  getBrowser() {
    return __async(this, null, function* () {
      if (!_BrowserHelper.browser) {
        console.log(`Launching browser`);
        _BrowserHelper.browser = yield import_puppeteer.default.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
      }
      return _BrowserHelper.browser;
    });
  }
  close() {
    return __async(this, null, function* () {
      return _BrowserHelper.close();
    });
  }
};

// src/index.ts
var fs = __toESM(require("fs"));
var PDFPagerOptions = class {
  constructor() {
    this.height = "11in";
    this.width = "8.5in";
    this.browser = new BrowserHelper();
  }
};
var PDFPagerResult = class {
  constructor(options) {
    Object.assign(this, options);
  }
};
var PDFPager = class _PDFPager {
  constructor(defaultConfig) {
    this.config = defaultConfig;
  }
  static create(options) {
    const defaultConfig = new PDFPagerOptions();
    Object.assign(defaultConfig, options);
    return new _PDFPager(defaultConfig);
  }
  fromFile(filePath) {
    return __async(this, null, function* () {
      let htmlContent = yield fs.promises.readFile(filePath).then((buffer) => buffer.toString());
      return this.load(htmlContent);
    });
  }
  fromString(htmlContent) {
    return __async(this, null, function* () {
      return this.load(htmlContent);
    });
  }
  fromURL(url) {
    return __async(this, null, function* () {
      return this.load(url);
    });
  }
  load(data) {
    return __async(this, null, function* () {
      const page = yield this.config.browser.getPage({
        height: this.config.height,
        width: this.config.width
      });
      yield page.load(data);
      const output = yield page.getAll();
      return new PDFPagerResult(__spreadValues({}, output));
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PDFPager
});
