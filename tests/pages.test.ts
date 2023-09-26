import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as path from "path";

test.skip('Can get the total number of pages', async t => {

    const file = await PDFPager.create({
        height: '7in',
        width: '7in'
    }).fromFile(path.join(__dirname, 'examples/pages.html')).then((r) => r.combined)

    t.truthy(await pdfContains(file, 'This is page 1 of 50'));

    const doc = await testPdf(file);

    doc.save('pages');

})

test.skip('Can get the current page number', async t => {

    const file = await PDFPager.create({
        height: '7in',
        width: '7in'
    }).fromFile(path.join(__dirname, 'examples/pages.html')).then((r) => r.combined)

    t.truthy(await pdfContains(file, 'This is page 1 of 50'));

    const doc = await testPdf(file);

})
