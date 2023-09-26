import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as path from "path";

test('Can generate a PDF from a HTML file', async t => {

    const pager = PDFPager.create()

    const file = await pager.fromFile(path.join(__dirname, 'examples/headerFooter.html')).then((r) => r.combined)

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'My Big Header'));
    t.truthy(await pdfContains(file, 'Cats'));
    t.truthy(await pdfContains(file, 'Penguins'));

})

test('Can generate a PDF from a URL', async t => {

    const file = await PDFPager.create().fromURL("https://example.com").then((r) => r.combined)

    const doc = await testPdf(file);

    t.truthy(await doc.contains('Example Domain'))
    t.falsy(await doc.contains('Google'))

    await doc.save('example.com')
})
