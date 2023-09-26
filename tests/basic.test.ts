import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as fs from "fs";
import * as path from "path";

test('Can pass any test', async t => {

    t.truthy(true);

})

test.skip('Can generate a PDF from a HTML file', async t => {

    const file = await PDFPager.fromFile(path.join(__dirname, 'examples/headerFooter.html'));

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'My Big Header'));
    t.truthy(await pdfContains(file, 'Cats'));
    t.truthy(await pdfContains(file, 'Penguins'));

})
test('An A4 Test PDF reports the correct size', async t => {

    const file = await fs.promises.readFile(path.join(__dirname, 'fixtures', 'a4.pdf'))

    const doc = await testPdf(file);
    t.is(Math.floor(await doc.height), 612)
    t.is(Math.floor(await doc.width), 858)

})

test('Can generate a Invoice PDF from a HTML file', async t => {

    const file = await PDFPager.fromFile(path.join(__dirname, 'examples/invoice.html'));

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'Invoice'));
    t.truthy(await pdfContains(file, '$10.00'));

    const doc = await testPdf(file);
    t.is(Math.round(await doc.width), 598)
    t.is(Math.round(await doc.height), 843)

})

test.skip('Can generate a PDF from a URL', async t => {

    const file = await PDFPager.fromURL("http://localhost:4444/pdf/invoice/72");

    t.truthy(file);

    t.falsy(await pdfContains(file, 'Dogs'));
    t.truthy(await pdfContains(file, 'Invoice'));
})
