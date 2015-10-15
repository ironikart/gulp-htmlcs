'use strict';
var path = require('path');
var fs = require('fs');
var through = require('through2');
var spawn = require('child_process').spawn;
var merge = require('merge');
var chalk = require('chalk');
var gutil = require('gulp-util');
var phantomCLI = path.resolve(__dirname, './node_modules/phantomjs/bin/phantomjs');
var run = path.resolve(__dirname, './lib/run.js');

var reports = {};
var lastReport = [];

module.exports = function(opts) {
    opts = merge({
        ignoreSSL:   true,
        webSecurity: false,
        standard:    'WCAG2AA',
        verbose:     false
    }, opts);

    return through.obj(function(file, enc, next) {
        var running = true;
        var args = [
            '--ignore-ssl-errors=' + opts.ignoreSSL,
            '--web-security=' + opts.webSecurity,
            run,
            file.path,
            opts.standard
        ];

        if (opts.verbose) {
            gutil.log('Running PhantomJS', phantomCLI, args);
        }

        var child = spawn(phantomCLI, args);
        var output = '';

        var timeout = 60;
        setTimeout(function() {
            if (running) {
                gutil.log(chalk.red('HTMLCS timeout ('+timeout+' seconds)'), file.path);
                child.kill();
            }
        }, timeout*1000);

        child.stdout.on('data', function(data) {
            if (opts.verbose) {
                gutil.log('received data:', data.toString().length, 'bytes');
            }
            output += data.toString();
        });

        child.stderr.on('data', function(data) {
            console.log(chalk.red(data.toString()));
        });

        child.on('exit', function() {
            running = false;
            try {
                reports[file.path] = JSON.parse(output);
                lastReport = reports[file.path];
                file.htmlcs = {
                    opts:   opts,
                    report: reports[file.path]
                };
            } catch(e) {
                console.log(chalk.red(e.message));
                console.log(chalk.red(e.stack));
                console.log(chalk.red('Writing temporary output to htmlcs-debug.log'));
                fs.writeFileSync(path.join(process.cwd(), 'htmlcs-debug.log'), output);
            }
            this.push(file);
            next();
        }.bind(this));
    });
};

module.exports.getLastReport = function(filter) {
    var report = lastReport;
    if (filter) {
        report.messages = lastReport.messages.filter(function(item){
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
        file.htmlcs.report.messages.forEach(function(item) {
            var key = item.type + 'S';
            if (!summary.hasOwnProperty(key)) {
                summary[key] = 0;
            }
            summary[key] += 1;
        });

        gutil.log(chalk.red(summary.ERRORS) + ' sniff error' +
            (summary.ERRORS > 1 || summary.ERRORS < 1 ? 's' : '') +
            ' found in:', chalk.magenta(file.path));

        file.htmlcs.report.messages.forEach(function(item) {
            if (!opts.filter || opts.filter.indexOf(item.type) !== -1) {
                console.log(
                    item.type + ': ' +
                    chalk.cyan(item.code.split('.').slice(0, 3).join(' ')));
                console.log('  ' + item.msg);
                console.log('  ' + item.outerHTML);
            }
        });

        if (file.htmlcs.report.errors.length) {
            gutil.log(chalk.red(file.htmlcs.report.errors.length) + ' runtime error' +
                (file.htmlcs.report.errors.length > 1 || file.htmlcs.report.errors.length < 1 ? 's' : '') +
            ' found in:', chalk.magenta(file.path));
            file.htmlcs.report.errors.forEach(function(error) {
                console.log(chalk.red(error.msg));
                console.log(chalk.red(error.trace));
            });
        }

        next();
    });
};
