import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as path from "path";

test.only('Can generate a PDF from a HTML file with Header and Footers from nested elements', async t => {

    const pager = PDFPager.create()

    const file = await pager.fromFile(path.join(__dirname, 'examples/headerFooterNested.html')).then((r) => r.combined);

    const doc = await testPdf(file);

    await doc.save('headerFooterNested');

    t.truthy(await doc.contains('Big Header'))

})
