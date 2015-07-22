'use strict';
var path = require('path');
var through = require('through2');
var spawn = require('child_process').spawn;
var merge = require('merge');
var chalk = require('chalk');
var gutil = require('gulp-util');
var phantomCLI = path.resolve(__dirname, './node_modules/phantomjs/bin/phantomjs');
var htmlcsRunner = path.resolve(__dirname, './node_modules/HTML_CodeSniffer/Contrib/PhantomJS/HTMLCS_Run.js');

var reports = {};
var lastReport = [];

module.exports = function(opts) {
    opts = merge({
        ignoreSSL: true,
        standard:  'WCAG2AA'
    }, opts);

    return through.obj(function(file, enc, next) {
        var args = [
            '--ignore-ssl-errors=' + opts.ignoreSSL,
            htmlcsRunner,
            file.path,
            opts.standard,
            'json'
        ];

        var child = spawn(phantomCLI, args);
        var output = '';

        child.stdout.pipe(through(function(chunk, encrypt, cb) {
            output += chunk.toString();
            cb(null, chunk);
        }));

        child.on('exit', function() {
            reports[file.path] = JSON.parse(output);
            lastReport = reports[file.path];
            file.htmlcs = {
                opts:   opts,
                report: reports[file.path]
            };
            this.push(file);
            next();
        }.bind(this));
    });
};

module.exports.getLastReport = function(filter) {
    var report = lastReport;
    if (filter) {
        report = lastReport.filter(function(item){
            return filter.indexOf(item.type) !== -1;
        });
    }
    return report;
};

module.exports.reporter = function(opts) {
    opts = merge({
        filter: null
    }, opts);
    return through.obj(function(file, enc, next) {
        var summary = {};
        file.htmlcs.report.forEach(function(item) {
            var key = item.type + 'S';
            if (!summary.hasOwnProperty(key)) {
                summary[key] = 0;
            }
            summary[key] += 1;
        });

        gutil.log(chalk.red(summary.ERRORS) + ' error' + (summary.ERRORS > 1 || summary.ERRORS < 1 ? 's' : '') +
            ' found in:', chalk.magenta(file.path));

        file.htmlcs.report.forEach(function(item) {
            if (!opts.filter || opts.filter.indexOf(item.type) !== -1) {
                console.log(
                    item.type + ': ' +
                    chalk.cyan(item.code.split('.').slice(0, 3).join(' ')));
                console.log('  ' + item.msg);
                console.log('  ' + item.outerHTML);
            }
        });

        next();
    });
};
