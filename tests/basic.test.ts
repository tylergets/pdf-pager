import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains} from "./helpers";
import * as fs from "fs";
import * as path from "path";

test('Can pass any test', async t => {

    t.truthy(true);

})

test.skip('Can generate a PDF from a HTML file', async t => {

    const file = await PDFPager.fromTemplate(path.join(__dirname, 'examples/headerFooter.html'));

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'My Big Header'));
    t.truthy(await pdfContains(file, 'Cats'));
    t.truthy(await pdfContains(file, 'Penguins'));

})

test('Can generate a Invoice PDF from a HTML file', async t => {

    const file = await PDFPager.fromTemplate(path.join(__dirname, 'examples/invoice.html'));

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'Invoice'));
    t.truthy(await pdfContains(file, '$10.00'));

})

test.skip('Can generate a PDF from a URL', async t => {

    const file = await PDFPager.fromURL("http://localhost:4444/pdf/invoice/72");

    t.truthy(file);

    t.falsy(await pdfContains(file, 'Dogs'));
    t.truthy(await pdfContains(file, 'Invoice'));
})
