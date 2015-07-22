# gulp-htmlcs

gulp-htmlcs is a [gulp](https://github.com/wearefractal/gulp) plugin to run [HTML Code Sniffer](https://github.com/squizlabs/HTML_CodeSniffer) and report on accessibility failures.

Ideally used in combination with other validators for a production workflow

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