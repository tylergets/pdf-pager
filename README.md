# pdf-pager

A library for rendering HTML to PDF, with support for headers and footers.

# Why?

I wanted a modern way to develop PDFs with static headers and footers, and I wanted to use a modern browser engine to do it. 

I tried a few solutions but was unable to find anything which worked exactly like how I wanted.

# How it works

- The process begins by rendering the HTML template using Puppeteer.
- Extracts and measures the dimensions of the header and footer, capturing each as a separate PDF.
- Rerenders the template excluding the header and footer.
- Captures the main content as a PDF, with careful attention to correct pagination.
- Calculates the height of the main content area by subtracting the combined heights of the header and footer from the total paper height.
- Ensures the calculated height is valid; throws an error if it's not.
- Captures the main content as a PDF using the adjusted height.
- Creates a new PDF document and loads the content from the main content PDF.
- Iterates through each page:
    - Adjusts each page's size to accommodate the header and footer.
    - If available, embeds the header at the top of the page.
    - If available, embeds the footer at the bottom of the page.
    - Embeds the main content between the header and footer.
- Saves and returns the modified document.

# Usage

```typescript
import {PDFPager} from "pdf-pager";

// see tests/examples/invoice.html
const file = await PDFPager.create().fromFile(path.join(__dirname, 'invoice.html'));
await fs.promises.writeFile('invoice.pdf', file);
```

# Template

The template should contain a #header and #footer element. These will be used to capture the header and footer. 

## Future Plans
* Support page numbers

## Other Solutions
 * https://wkhtmltopdf.org/ -- Uses WebKit to render HTML to PDF
 * https://www.princexml.com/ -- Commercial solution, uses an older browser engine
 * https://pdfkit.org/ -- Draw PDFs using a canvas like API
 * https://weasyprint.org/ -- Not browser based, no JS support

### References
https://github.com/Hopding/pdf-lib/issues/128
https://github.com/Hopding/pdf-lib/issues/143 -- PaperSizes
