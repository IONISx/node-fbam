const gulp = require('gulp');

const $    = require('gulp-load-plugins')();

// ## //

// Configuration

var config = {
    reports: process.env.CIRCLE_TEST_REPORTS || 'reports'
};

// Log errors

var _logErrors = function (err) {
    $.util.log(
        $.util.colors.red(err)
    );

    process.exit(1);
};

gulp.task('eslint', function () {
    return gulp
        .src([
            'gulpfile.js',
            'index.js',
            'lib/**/*.js',
            'test/**/*.js'
        ])
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError());
});

gulp.task('mocha', function () {
    return gulp
        .src([
            'test/*.test.js'
        ], {
            read: false
        })
        .pipe($.mocha({
            timeout: 5000,
            reporter: 'spec',
            require: [
                './test/bootstrap/node'
            ]
        }));
});

gulp.task('pre-cover', function () {
    return gulp
        .src([
            'index.js',
            'lib/**/*.js'
        ])
        .pipe($.istanbul({
            includeUntested: true
        }))
        .pipe($.istanbul.hookRequire());
});

gulp.task('cover', ['pre-cover'], function () {
    process.env.XUNIT_FILE = config.reports + '/xunit.xml';

    return gulp
        .src([
            'test/*.test.js'
        ], {
            read: false
        })
        .pipe($.mocha({
            timeout: 5000,
            reporter: require('xunit-file'),
            require: [
                './test/bootstrap/node'
            ]
        }))
        .on('error', _logErrors)
        .pipe($.istanbul.writeReports({
            reporters: ['lcov', 'text-summary']
        }));
});

// ## //

gulp.task('default', [
    'test'
]);

gulp.task('test', [
    'eslint',
    'mocha'
]);

gulp.task('test:ci', [
    'eslint',
    'cover'
]);
