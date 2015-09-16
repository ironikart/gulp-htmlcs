'use strict';
/*eslint no-unused-vars: 0*/
/*globals describe, it, afterEach*/
var should = require('chai').should();
var expect = require('chai').expect;
var gulp = require('gulp');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

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
        this.timeout(8000);
        gulp.src(path.join(fixtures, 'pass.html'))
            .pipe(this.htmlcs())
            .resume()
            .on('finish', function() {
                var report = this.htmlcs.getLastReport();
                expect(report).not.to.be.equal(null);
                expect(report.length).to.be.equal(1);
                var errors = this.htmlcs.getLastReport(['ERROR']);
                expect(errors.length).to.be.equal(0);
                done();
            }.bind(this));
    });

    it('processes failing HTML', function(done) {
        this.timeout(8000);
        gulp.src(path.join(fixtures, 'fail.html'))
            .pipe(this.htmlcs())
            .resume()
            .on('finish', function() {
                var report = this.htmlcs.getLastReport();
                expect(report).not.to.be.equal(null);
                expect(report.length).to.be.equal(4);
                var errors = this.htmlcs.getLastReport(['ERROR']);
                expect(errors.length).to.be.equal(3);
                done();
            }.bind(this));
    });

    it('processes a larger amount of HTML', function(done) {
        this.timeout(8000);
        gulp.src(path.join(fixtures, 'large.html'))
            .pipe(this.htmlcs())
            .resume()
            .on('finish', function() {
                var report = this.htmlcs.getLastReport();
                expect(report).not.to.be.equal(null);
                // expect(report.length).to.be.equal(4);
                // var errors = this.htmlcs.getLastReport(['ERROR']);
                // expect(errors.length).to.be.equal(3);
                done();
            }.bind(this));
    });

    it('can report', function(done) {
        this.timeout(8000);
        gulp.src(path.join(fixtures, 'fail.html'))
            .pipe(this.htmlcs())
            .pipe(this.htmlcs.reporter())
            .resume()
            .on('finish', done);
    });
});
