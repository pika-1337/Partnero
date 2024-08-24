import gulp from 'gulp';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify-es';
import browserSync from 'browser-sync';
import clean from 'gulp-clean';
import avif from 'gulp-avif';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';
import fonter from 'gulp-fonter';
import ttf2woff2 from 'gulp-ttf2woff2';
import svgSprite from 'gulp-svg-sprite';
import include from 'gulp-include';
import postcssUrl from 'postcss-url';

const { src, dest, watch, parallel, series } = gulp;
const sass = gulpSass(dartSass);
const browserSyncInstance = browserSync.create();

function styles() {
  const plugins = [
    autoprefixer({ overrideBrowserslist: ['last 10 versions'] }),
    postcssUrl({
      url: 'inline', // або 'copy' якщо потрібно копіювати зображення
      basePath: 'app/',
      assetsPath: 'dist/'
    })
  ];

  return src('app/scss/style.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(concat('style.min.css'))
    .pipe(dest('app/css'))
    .pipe(browserSyncInstance.stream());
}

function pages() {
  return src('app/pages/*.html')
    .pipe(include({
      includePaths: 'app/components'
    }))
    .pipe(dest('app'))
    .pipe(browserSyncInstance.stream());
}

function fonts() {
  return src('app/fonts/src/*.*')
    .pipe(fonter({
      formats: ['woff', 'ttf']
    }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'));
}

function images() {
  return src(['app/images/src/**/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({ quality: 50 }))
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(webp())
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(imagemin())
    .pipe(dest('app/images'));
}

function sprite() {
  return src('app/images/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('app/images'));
}

function script() {
  return src(['app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify.default())
    .pipe(dest('app/js'))
    .pipe(browserSyncInstance.stream());
}

function watching() {
  browserSyncInstance.init({
    server: {
      baseDir: 'app/'
    }
  });
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/images/src'], images);
  watch(['app/js/main.js'], script);
  watch(['app/components/*', 'app/pages/*'], pages);
  watch(['app/*.html']).on('change', browserSyncInstance.reload);
}

function cleanDist() {
  return src('dist', { read: false, allowEmpty: true })
    .pipe(clean());
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/css/slick.css',
    'app/images/**/**.*',
    '!app/images/*.svg',
    'app/fonts/*.*',
    'app/js/main.js',
    'app/js/main.min.js',
    'app/js/slick.min.js',
    'app/**/*.html'
  ], { base: 'app' })
    .pipe(dest('dist'));
}

export {
  styles,
  images,
  fonts,
  pages,
  cleanDist,
  building,
  sprite,
  script,
  watching
};

export const build = series(cleanDist, building);
export default parallel(styles, images, script, pages, watching);
