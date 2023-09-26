import test from 'ava'
import {PDFPager} from "../src";
import {pdfContains, testPdf} from "./helpers";
import * as path from "path";

test('Can generate a PDF from a URL', async t => {

    const file = await PDFPager.create()
        .fromURL("http://localhost:4444/pdf/invoice/72?html=true").then((r) => r.combined)

    const doc = await testPdf(file);

    t.truthy(await doc.contains('Invoice'))

    await doc.save('mthealthy')
})
