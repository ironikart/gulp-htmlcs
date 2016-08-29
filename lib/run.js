/**
 * HTMLCS Run Script for phantomJS to replace HTML_CodeSniffer/Contrib/PhantomJS/HTMLCS_Run.js
 *
 * Outputs only JSON for safer parsing
 */
/*globals phantom, HTMLCS_RUNNER*/
'use strict';
var page = require('webpage').create();
var args = require('system').args.slice(1);
var fs = require('fs');

var messages = [];
var errors = [];

function error(msg, trace) {
    console.log(JSON.stringify({
        error: {
            msg:   msg,
            trace: trace
        }
    }, true, '    '));
    phantom.exit();
}

function usage() {
    error('Unable to run HTMLCS, please check supplied arguments match expected usage\n\t' +
          'phantomjs lib/run.js [url] [WCAG2A|WCAG2AA|WCAG2AAA]');
}

if (args.length < 2) {
    usage();
    phantom.exit();
}

// Get the absolute working directory from the PWD var and
// and the command line $0 argument.
var rootDir = require('system').args[0].split(/\//g);
rootDir = rootDir.slice(0, rootDir.length-2).join('/');
var address = args[0];
var standard = args[1];
var moduleDir = rootDir + '/node_modules/HTML_CodeSniffer/';

page.onError = function(msg, trace) {
    errors.push({
        msg:   msg,
        trace: trace
    });
};

// Collect messages
page.onConsoleMessage = function (msg) {
    if (msg.indexOf('{') === 0) {
        messages.push(JSON.parse(msg));
    } else if (msg === 'done') {
        console.log(JSON.stringify({
            url:      address,
            standard: standard,

            dir: {
                module:  moduleDir,
                working: fs.workingDirectory
            },

            messages: messages,
            errors:   errors
        }, true, '    '));
        phantom.exit();
    }
};

page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit();
    } else {
        window.setTimeout(function () {

            // Include all sniff files.
            var injectAllStandards = function(dir) {
                var files = fs.list(dir),
                    filesLen = files.length,
                    absPath = '';
                for (var i = 0; i < filesLen; i+=1) {
                    if (files[i] === '.' || files[i] === '..') {
                        continue;
                    }

                    absPath = fs.absolute(dir + '/' + files[i]);
                    if (fs.isDirectory(absPath) === true) {
                        injectAllStandards(absPath);
                    } else if (fs.isFile(absPath) === true) {
                        page.injectJs(absPath);
                    }
                }
            };

            injectAllStandards(moduleDir + 'Standards/');
            page.injectJs(moduleDir + 'HTMLCS.js');
            page.injectJs(moduleDir + 'HTMLCS.Util.js');
            if (page.injectJs(rootDir + '/lib/HTMLCS_RUNNER.js')) {
                page.evaluate(function(standard) {
                    HTMLCS_RUNNER.run(standard);
                }, standard);
            } else {
                throw 'Unable to evaluate runtime code';
            }
        }, 400);
    }//end if
});//end
