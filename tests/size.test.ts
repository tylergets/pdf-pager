import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as fs from "fs";
import * as path from "path";

test('Can generate a basic 7x7 PDF', async t => {

    const file = await PDFPager.create({
        height: '7in',
        width: '7in'
    }).fromFile(path.join(__dirname, 'examples/basic.html')).then((r) => r.combined)

    t.falsy(await pdfContains(file, 'Dogs'));
    t.truthy(await pdfContains(file, 'Item 8'));
    t.truthy(await pdfContains(file, '$10.00'));

    const doc = await testPdf(file);
    t.is(await doc.width,  await doc.height)

    await doc.save('7x7');

})

test('Will generate a Letter paper size by default', async t => {

    const file = await PDFPager.create().fromFile(path.join(__dirname, 'examples/invoice.html')).then((r) => r.combined)

    t.falsy(await pdfContains(file, 'Dogs'));

    t.truthy(await pdfContains(file, 'Invoice'));
    t.truthy(await pdfContains(file, '$10.00'));

    const doc = await testPdf(file);

    t.is(await doc.widthIn, 8.5)
    t.is(await doc.heightIn, 11)

    await doc.save('A4');

})
