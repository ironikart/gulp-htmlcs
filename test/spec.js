'use strict';
/*eslint no-unused-vars: 0*/
/*globals describe, it, afterEach*/
var should = require('chai').should();
var expect = require('chai').expect;
var gulp = require('gulp');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');
var child = require('child_process');

describe('gulp-htmlcs', function() {
    var fixtures = path.join(__dirname, 'fixtures');
    var tmpDir = path.resolve(__dirname, '.tmp');

    afterEach(function (done) {
        rimraf(tmpDir, done);
    });

    it('can be required without throwing', function() {
        this.htmlcs = require('../index.js');
    });

    it('processes passing HTML', function(done) {
        this.timeout(10*1000);
        gulp.src(path.join(fixtures, 'pass.html'))
            .pipe(this.htmlcs())
            .resume()
            .on('finish', function() {
                var report = this.htmlcs.getLastReport();
                expect(report).not.to.be.equal(null);
                expect(report.messages.length).to.be.equal(1);
                var errors = this.htmlcs.getLastReport(['ERROR']);
                expect(errors.messages.length).to.be.equal(0);
                done();
            }.bind(this));
    });

    it('processes failing HTML', function(done) {
        this.timeout(10*1000);
        gulp.src(path.join(fixtures, 'fail.html'))
            .pipe(this.htmlcs())
            .resume()
            .on('finish', function() {
                var report = this.htmlcs.getLastReport();
                expect(report).not.to.be.equal(null);
                expect(report.messages.length).to.be.equal(4);
                var errors = this.htmlcs.getLastReport(['ERROR']);
                expect(errors.messages.length).to.be.equal(3);
                done();
            }.bind(this));
    });

    it('processes a larger amount of HTML', function(done) {
        this.timeout(20*1000);
        gulp.src(path.join(fixtures, 'large.html'))
            .pipe(this.htmlcs())
            .resume()
            .on('finish', function() {
                var report = this.htmlcs.getLastReport(['ERROR']);
                expect(report).not.to.be.equal(null);
                expect(report.messages.length).to.be.equal(0);
                done();
            }.bind(this));
    });

    it('can report', function(done) {
        this.timeout(10*1000);
        gulp.src(path.join(fixtures, 'fail.html'))
            .pipe(this.htmlcs())
            .pipe(this.htmlcs.reporter())
            .resume()
            .on('finish', function() {
                var report = this.htmlcs.getLastReport(['ERROR']);
                expect(report).not.to.be.equal(null);
                expect(report.messages.length).to.be.equal(3);
                done();
            }.bind(this));
    });

    it('can be run as an executable', function(done) {
        this.timeout(10*10000);
        var pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), {encoding: 'utf8'}));
        var binPath = path.resolve(__dirname, '../', pkg.bin[Object.keys(pkg.bin).shift()]);
        child.execFile(binPath, [path.resolve(__dirname, '../test/fixtures/pass.html')], {}, function(err, stdout, stderr) {
            expect(err).to.be.equal(null);
            expect(stdout).to.contain('NOTICE: WCAG2AA Principle2 Guideline2_4');
            done();
        });
    });
});
