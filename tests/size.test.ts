import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as fs from "fs";
import * as path from "path";
test('An A4 Test PDF reports the correct size', async t => {

    const file = await fs.promises.readFile(path.join(__dirname, 'fixtures', 'a4.pdf'))

    const doc = await testPdf(file);
    t.is(Math.floor(await doc.width), 858)
    t.is(Math.floor(await doc.height), 612)

})
