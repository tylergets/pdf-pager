import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as path from "path";

test('Can see with the window script', async t => {

    const file = await PDFPager.create({
        height: '7in',
        width: '7in'
    }).fromFile(path.join(__dirname, 'examples/scripting.html')).then((r) => r.combined)

    t.truthy(await pdfContains(file, 'Page script exists'));

    const doc = await testPdf(file);

})

test('Can call a function on the window script', async t => {

    const file = await PDFPager.create({
        height: '7in',
        width: '7in'
    }).fromFile(path.join(__dirname, 'examples/scripting.html')).then((r) => r.combined)

    t.truthy(await pdfContains(file, 'Script says pong'));

    const doc = await testPdf(file);

})
