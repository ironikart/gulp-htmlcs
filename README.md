[HTMLCS]: https://github.com/squizlabs/HTML_CodeSniffer
[Gulp]: https://github.com/wearefractal/gulp
[PhantomJS]: https://github.com/ariya/phantomjs/

# gulp-htmlcs

gulp-htmlcs is a [Gulp]() plugin to run [HTML Code Sniffer]() and report on accessibility failures.

Ideally used in combination with other validators for a production workflow

## Install

```
$ npm install --save gulp-htmlcs
```

## Usage

```javascript
var htmlcs = require("gulp-htmlcs");

// Run the validation & output a report in the console
gulp.src('src/*.html')
  .pipe(htmlcs())
  .pipe(htmlcs.reporter())
  .pipe(gulp.dest('./dist'));

// Run the validation filtering on errors
gulp.src('src/*.html')
  .pipe(htmlcs())
  .pipe(htmlcs.reporter({
    filter: ['ERROR']
  }))
  .pipe(gulp.dest('./dist'));
```

## API

### htmlcs(options)

#### options

##### ignoreSSL

Type: `boolean`
Default: `true`

Property that maps to `--ignore-ssl-errors` for [PhantomJS]().

##### webSecurity

Type: `boolean`
Default: `false`

Property that maps to `--web-security` for [PhantomJS]().

##### standard

Type: `string`
Default: `WCAG2AA`

The standard to use for [HTMLCS]().

##### verbose

Type: `boolean`
Default: `false`

Display verbose output.

Useful for debugging the output of the PhantomJS process to capture issues that might be otherwise hidden, e.g. runtime errors.

##### timeout

Type: `integer`
Default: `60000`

Timeout for spawned child processes in milliseconds. Adjust this if your checks start to time out on complex pages.

### htmlcs.reporter(options)

#### options

##### filter

Type: `array`
Default: `null`

Optional whitelist style filter to restrict the types of messages you want from [HTMLCS](). A common scenario may be to filter only on error messages rather than notices and warnings.

Example:
```javascript
gulp.src('src/*.html')
  .pipe(htmlcs())
  .pipe(htmlcs.reporter({
    filter: ['ERROR']
  }));
```

##### showTrace

Type: `boolean`
Default: `false`

Show error traces for runtime errors generated in the [PhantomJS]() process.

Useful for displaying issues with the JavaScript runtime that were also captured along with [HTMLCS]() issues.

## Usage as an executable

Install globally:
```
npm install -g gulp-htmlcs
```

Invoke gulp htmlcs:
```
htmlcs ./path/to/test.html
```

## Unit tests

```
npm test
```

## License

The MIT License (MIT)

Copyright (c) Anthony Barnes <abarnes32@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.