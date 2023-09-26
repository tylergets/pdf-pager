#!/usr/bin/env node

// src/cli.ts
import { program } from "commander";
program.version("0.0.1").description("PDF-Pager CLI").option("-o, --output <type>", "Input string to be reversed").action((cmd) => {
  console.log(cmd);
});
program.parse(process.argv);
