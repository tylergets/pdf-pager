#!/usr/bin/env node

// src/cli.ts
var import_commander = require("commander");
import_commander.program.version("0.0.1").description("PDF-Pager CLI").option("-o, --output <type>", "Input string to be reversed").action((cmd) => {
  console.log(cmd);
});
import_commander.program.parse(process.argv);
