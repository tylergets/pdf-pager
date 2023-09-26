import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as path from "path";

test('Can generate a PDF from a HTML file', async t => {

    const pager = PDFPager.create()

    const file = await pager.fromFile(path.join(__dirname, 'examples/headerFooter.html'));

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'My Big Header'));
    t.truthy(await pdfContains(file, 'Cats'));
    t.truthy(await pdfContains(file, 'Penguins'));

})

test('Will generate a Letter paper size by default', async t => {

    const file = await PDFPager.create().fromFile(path.join(__dirname, 'examples/invoice.html'));

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'Invoice'));
    t.truthy(await pdfContains(file, '$10.00'));

    const doc = await testPdf(file);

    t.is(await doc.widthIn, 8.5)
    t.is(await doc.heightIn, 11)

    await doc.save('A4');

})

test('Can generate a basic 7x7 PDF', async t => {

    const file = await PDFPager.create({
        height: '7in',
        width: '7in'
    }).fromFile(path.join(__dirname, 'examples/basic.html'));

    t.falsy(await pdfContains(file, 'Dogs'));
    t.truthy(await pdfContains(file, 'Item 8'));
    t.truthy(await pdfContains(file, '$10.00'));

    const doc = await testPdf(file);
    t.is(await doc.width,  await doc.height)

    await doc.save('7x7');

})

test('Can generate a PDF from a URL', async t => {

    const file = await PDFPager.create().fromURL("https://example.com");

    const doc = await testPdf(file);

    t.truthy(await doc.contains('Example Domain'))
    t.falsy(await doc.contains('Google'))

    await doc.save('example.com')
})
