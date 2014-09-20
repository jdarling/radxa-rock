var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    path = require('path'),
    gcheerio = require('gulp-cheerio'),
    cheerio = require('cheerio'),
    async = require('async'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    glob = require('glob'),
    imagemin = require('gulp-imagemin'),
    replace = require('gulp-replace'),
    fs = require('fs')
    ;

gulp.task('styles', function() {
  return gulp.src('web/src/style/main.less')
    .pipe(less())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename({basename: 'style'}))
    .pipe(gulp.dest('web/site/style'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('web/site/style'))
    ;
});

gulp.task('scripts', function() {
  var sources = glob.sync('./web/src/js/controllers/**/*.js');
  sources.unshift('./web/src/js/app.js');
  return browserify({
      entries: sources,
      fullPaths: true
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('web/site/js'))
    ;
});

gulp.task('html', function(){
  var doReplaceEmbeds = function($, done){
    var els = $('[embed-src]');
    async.each(els, function reformEmbed(elem, next){
      var el = $(elem);
      var srcFile = 'web/src/'+el.attr('embed-src');
      var src = fs.readFile(srcFile, function loadSource(err, src){
        if(err){
          console.error(err);
          src = 'File not found: '+srcFile;
        }
        el.removeAttr('embed-src');
        replaceEmbeds(src.toString(), function(err, src){
          el.html(src);
          next();
        });
      });
    }, function(){
      done(null, $.html());
    });
  };

  var replaceEmbeds = function replaceEmbeds(src, done){
    var $ = cheerio.load(src);
    doReplaceEmbeds($, done);
  };

  return gulp.src('web/src/*.html')
  .pipe(gcheerio({
    cheerio: cheerio,
    run: function($, done){
      doReplaceEmbeds($, function globalReplace(err, src){
        done();
      });
    }
  }))
  .pipe(replace(/{{&gt;/g, '{{>'))
  .pipe(gulp.dest('web/site'))
  ;
});

gulp.task('vendor', function(){
  return gulp.src('web/src/vendor/**/*')
    .pipe(gulp.dest('web/site/vendor'))
    ;
});

gulp.task('images', function() {
  return gulp.src('web/src/images/**/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('web/site/images'))
    ;
});

gulp.task('clean', function() {
  return gulp.src(['web/site/style', 'web/site/js', 'web/site/partials', 'web/site/images', 'web/site/vendor', 'web/site/index.html'], {read: false})
    .pipe(clean());
});

gulp.task('watch', ['clean'], function() {
  // Watch .less files
  gulp.watch('web/src/style/**/*.less', ['styles']);
  // Watch .css files
  gulp.watch('web/src/style/**/*.css', ['styles']);
  // Watch .js files
  gulp.watch('web/src/js/**/*.js', ['scripts']);
  gulp.watch('web/src/lib/**/*.js', ['scripts']);
  // Watch image files
  gulp.watch('web/src/images/**/*', ['images']);
  // Watch the html files
  gulp.watch('web/src/**/*.html', ['html']);
  gulp.watch('web/src/**/*.md', ['html']);
  // Watch the vendor files
  gulp.watch('web/src/vendor/**/*', ['vendor']);

  gulp.start('styles', 'scripts', 'html', 'vendor', 'images');
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'vendor', 'html', 'images');
});