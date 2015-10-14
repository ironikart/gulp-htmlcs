#!/usr/bin/env node
'use strict';

var args = process.argv.slice(1);
var htmlcs = require('../index.js');
var gulp = require('gulp');
var chalk = require('chalk');

function usage() {
    console.log('HTML Code Sniffer Usage:');
    console.log('\thtmlcs [file]');
}

if (!args[1]) {
    usage();
} else {
    console.log('Parsing', chalk.yellow(args[1]));
    gulp.src(args[1])
        .pipe(htmlcs())
        .pipe(htmlcs.reporter());
}
