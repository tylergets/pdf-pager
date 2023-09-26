# pdf-pager

Expansions on puppeteers PDF API to allow for some extra features. 

Currently, being developed to use internally on a project, but will be expanded to be more generic and useful for others. 

## TODO
* Support page numbers
 
# How it works

* Renders your HTML template using puppeteer
* Measures the header and footer, then captures each as a PDF blob
* Renders the template again, but without the header and footer
* Capture the smaller viewport as a PDF blob, ensuring that pagination works correctly
* Loop through each page, applying the header and footer to it and adjusting the size of the content to fit the page

# Usage

```typescript
import {PDFPager} from "pdf-pager";

// see tests/examples/invoice.html
const file = await PDFPager.fromTemplate(path.join(__dirname, 'invoice.html'));
await fs.promises.writeFile('invoice.pdf', file);
```

### References
https://github.com/Hopding/pdf-lib/issues/128
https://github.com/Hopding/pdf-lib/issues/143 -- PaperSizes
