import gulp from "gulp";
import gulp_pug from "gulp-pug";
import del from "del";
import gulp_webserver from "gulp-webserver";
import gulp_image from "gulp-image";
import gulp_sass from "gulp-sass";
import gulp_autoprefixer from "gulp-autoprefixer";
import gulp_csso from "gulp-csso";
import gulp_bro from "gulp-bro";
import babelify from "babelify";
import gulp_gh_pages from "gulp-gh-pages"

gulp_sass.compiler = require("node-sass");

const routes = {
    pug: {
        watcher: "src/**/*.pug",
        src: "src/*.pug",
        dest: "build"
    },
    images: {
        src: "src/Images/*",
        dest: "build/Images"
    },
    scss: {
        watcher: "src/Scss/**/*.scss",
        src: "src/Scss/style.scss",
        dest: "build/css"
    },
    js: {
        watcher: "src/Components/**/*.js",
        src: "src/Components/*.js",
        dest: "build/Components"
    },
    deploy: {
        src: "build/**/*"
    }
};

const pug = () => 
    gulp
     .src(routes.pug.src)
     .pipe(gulp_pug())
     .pipe(gulp.dest(routes.pug.dest));

const eraser = () => del(["build/", ".publish"]);

const watcher = () => { 
    gulp.watch(routes.pug.watcher, pug); 
    gulp.watch(routes.images.src, image_loader);
    gulp.watch(routes.scss.watcher, sass_loader);
    gulp.watch(routes.js.watcher, strong_brother);
};

const strong_brother = () => 
    gulp
     .src(routes.js.src)
     .pipe(gulp_bro({
        transform: [
            babelify.configure({ presets: ["@babel/preset-env"] }),
            ["uglifyify", { global: true }]
          ]
     }))
     .pipe(gulp.dest(routes.js.dest));

const image_loader = () => 
    gulp
     .src(routes.images.src)
     .pipe(gulp_image())
     .pipe(gulp.dest(routes.images.dest));

const sass_loader = () =>
    gulp
     .src(routes.scss.src)
     .pipe(gulp_sass().on("error", gulp_sass.logError))
     .pipe(gulp_autoprefixer({
        overrideBrowserslist: ["last 2 versions"]
     }))
     .pipe(gulp_csso())
     .pipe(gulp.dest(routes.scss.dest));

const webserver = () => 
    gulp
     .src("build")
     .pipe(gulp_webserver({ livereload: true, open: true }));

const preprocess = gulp.series([eraser, image_loader]);
const assets = gulp.series([pug, sass_loader, strong_brother]);
const postprocess = gulp.parallel([webserver, watcher]);

const gh_pages = () => gulp.src(routes.deploy.src).pipe(gulp_gh_pages());

export const build = gulp.series([preprocess, assets]);
export const deploy = gulp.series([build, gh_pages, eraser]);
export const dev = gulp.series([build, postprocess]);