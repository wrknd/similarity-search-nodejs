// eslint-disable-next-line
'use strict'
require('dotenv').config();
const gulp = require('gulp');
const gls = require('gulp-live-server');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const debug = require('debug')('demo:gulp');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const paths = {
  main_css: ['client/stylesheets/main.scss'],
  css: ['client/stylesheets/**/*.scss'],
  main_js: ['client/app.js'],
  js: ['client/**/*.js*'],
};

gulp.task('css', () =>
  gulp.src(paths.main_css)
    .pipe(
      sass({
        errLogToConsole: true,
        includePaths: ['./node_modules'],
        outputStyle: IS_PRODUCTION ? 'compressed' : 'nested',
      }).on('error', sass.logError)
    )
    .pipe(gulp.dest('static/css/'))
);

gulp.task('js', () => {
  let bundler = browserify({
    extensions: ['.js', '.jsx'],
    entries: paths.main_js,
  })
  .transform('babelify', {
    presets: ['es2015', 'react'],
    plugins: ['transform-object-assign'],
  });

  if (IS_PRODUCTION) {
    bundler = bundler.plugin('minifyify', {
      map: false,
      compress: {
        drop_debugger: true,
        drop_console: true,
      },
    });
    bundler = bundler.plugin('uglifyify', { global: true });
  }

  bundler.bundle().on('error', (err) =>
    debug('[browserify error]', err.message)
  ).pipe(source('bundle.js'))
  .pipe(gulp.dest('static/js'));
});

gulp.task('serve', ['css', 'js'], () => {
  // Generic watch tasks for SASS and Browserify
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.js, ['js']);

  // Start the app server.
  const server = gls('server/index.js', { stdio: 'inherit' });
  server.start();

  // Reload server when backend files change.
  gulp.watch(['server/**/*.js*'], () =>
    server.start.bind(server)()
  );

  // Notify server when frontend files change.
  gulp.watch(['static/**/*.{css,js,html}'], (file) =>
    server.notify(file)
  );
});

gulp.task('default', ['css', 'js']);
