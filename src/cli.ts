#!/usr/bin/env node
import {program} from 'commander';
import {PDFPager} from "./index";
import * as fs from "fs";

program
    .version('0.0.1')
    .description('PDF-Pager CLI')
    .argument('<input>', 'input, either a file name or a url')
    .argument('<output>', 'output file name')
    .action(async (input: string, output: string) => {
        const startTime = Date.now();
        const pager = PDFPager.create();
        let outputData;
        if (input.startsWith("http")) {
            outputData = await pager.fromURL(input).then((r) => r.combined);
        } else {
            outputData = await pager.fromFile(input).then((r) => r.combined);
        }

        fs.writeFileSync(output, Buffer.from(outputData));
        console.log(`Wrote to ${output} in ${Date.now() - startTime}ms`);
    });

program.parse(process.argv);
