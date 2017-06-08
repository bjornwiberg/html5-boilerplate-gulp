var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');

var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');

var concatCss = require('gulp-concat-css');
var rename = require('gulp-rename');
var cssnano = require('cssnano');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var baseDir = 'app/';
var build = baseDir + 'build/';
var assets = 'assets/';

var preprocessor = {
    compile: function() {
        var compiler = require('gulp-sass');
        return compiler(this.config);
    },
    config: {
    },
    src: {
        scss: [
            'node_modules/normalize.css/normalize.css',
            assets + 'scss/*.scss',
        ],
        js: [
            'node_modules/jquery/dist/jquery.min.js',
            assets +'js/*.js',
        ],
    },
    browserSyncWatch: [
        assets +'js/*.js',
        baseDir + '**/*.html',
    ],
}

var configurations = {
    plumber: {
        errorHandler: function(err) {
            notify.onError({
                title:    "Gulp Error",
                message:  "\n<%= error.message %>",
                sound:    "Bottle"
            })(err);
            this.emit('end');
        }
    },
    postCss: [
        cssnano(),
        cssnext({browsers: ['iOS 9', 'ie 9', 'last 3 versions']}), // autoprefix and fallback on future css
    ],
};

gulp.task('browserSync', function() {
    browserSync.init({
        server: baseDir
    });
    gulp.watch(preprocessor.browserSyncWatch, ['scripts']).on('change', browserSync.reload); // watch files, on change, minify and reload page
});

gulp.task('scripts', function() {
    return gulp.src(preprocessor.src.js)
        .pipe(concat('app.min.js')) // concatenate javascripts
        .pipe(uglify()) // minify file
        .pipe(gulp.dest(build)) // write file
});

gulp.task('scss', function() {
  var tmpplumber  = {
        errorHandler: function(err) {
            notify.onError({
                title:    "Gulp Error",
                message:  "\n<%= error.message %>",
                sound:    "Bottle"
            })(err);
            this.emit('end');
        }
    }
    return gulp.src(preprocessor.src.scss)
        .pipe(plumber(configurations.plumber))
        .pipe(preprocessor.compile()) // compile sass files
        .pipe(concatCss('app.css', {rebaseUrls: false})) // concatenate all css files
        .pipe(rename('app.min.css')) // rename file
        .pipe(postcss(configurations.postCss)) // run post css plugins
        .pipe(gulp.dest(build)) // write file
        .pipe(browserSync.reload({
            stream: true // stream css content to browser
        }));
});

gulp.task('watch', ['browserSync', 'scss', 'scripts'], function (){
    gulp.watch(preprocessor.src.scss, ['scss']);
});

gulp.task('default', ['scripts', 'scss']); // default task to run with only gulp
