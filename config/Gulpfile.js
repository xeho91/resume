require("dotenv").config();

var gulp = require("gulp");
var gulpClean = require("gulp-clean");
var gulpClone = require("gulp-clone");
var gulpRename = require("gulp-rename");
var gulpIf = require("gulp-if");
var gulpSourcemaps = require("gulp-sourcemaps");
var gulpPostHTML = require("gulp-posthtml");
var gulpHTMLnano = require("gulp-htmlnano");
var gulpPostCSS = require("gulp-postcss");
var gulpCSSO = require("gulp-csso");
var gulpSVGstore = require("gulp-svgstore");
var gulpSVGmin = require("gulp-svgmin");
var gulpBrotli = require("gulp-brotli");
var browserSync = require("browser-sync").create();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
console.log(`Environment: ${process.env.NODE_ENV}`);

var directoriesPaths = {
	// input directory
	source: "../source",
	// output directory
	build: `../build/${ IS_PRODUCTION ? "production" : "development" }`,
};

// -------------------------------------------------------------------------- //
// Cleaning
// -------------------------------------------------------------------------- //
function clean_previousBuild() {
	return gulp
		.src(directoriesPaths.build, { read: false, allowEmpty: true })
		.pipe(gulpClean({ force: true }));
}
exports.clean = clean_previousBuild;

// -------------------------------------------------------------------------- //
// Markups
// -------------------------------------------------------------------------- //
function build_markupFiles() {
	let data = {
		IS_PRODUCTION: IS_PRODUCTION,
		...require(`${directoriesPaths.source}/data.json`),
	};

	return gulp
		.src(`${directoriesPaths.source}/index.html`)
		.pipe(
			gulpPostHTML([
				require("posthtml-modules")({
					root: directoriesPaths.source,
					from: directoriesPaths.source,
					locals: data,
				}),
				require("posthtml-expressions")({
					locals: data,
				}),
			])
		)
		.pipe(
			gulpIf(
				IS_PRODUCTION,
				gulpHTMLnano({
					// collapseAttributeWhitespace: true,
					collapseWhitespace: "aggressive",
					deduplicateAttributeValues: false,
					removeEmptyAttributes: false,
					removeComments: "all",
					removeAttributeQuotes: false,
					removeUnusedCss: false,
					minifyCss: false,
					minifyJs: false,
					minifyJson: false,
					minifySvg: false,
					minifyUrls: false,
					// minifyConditionalComments: true,
					removeRedundantAttributes: false,
					collapseBooleanAttributes: false,
					mergeStyles: false,
					mergeScripts: false,
					sortAttributesWithLists: false,
					sortAttributes: false,
					removeOptionalTags: false,
				})
			)
		)
		.pipe(gulp.dest(directoriesPaths.build));
}
exports.build_html = build_markupFiles;

// -------------------------------------------------------------------------- //
// Stylesheets
// -------------------------------------------------------------------------- //
function build_stylesheetFiles() {
	let postCSSplugins = [
		require("postcss-import")(),
		require("postcss-media-minmax")(),
		require("postcss-nested")(),
		require("postcss-custom-media")(),
		require("autoprefixer")(),
	];

	return gulp
		.src(`${directoriesPaths.source}/styles/*.css`)
		.pipe(gulpSourcemaps.init())
		.pipe(gulpPostCSS(postCSSplugins))
		.pipe(gulpIf(IS_PRODUCTION, gulpCSSO()))
		.pipe(gulpSourcemaps.write())
		.pipe(gulp.dest(`${directoriesPaths.build}/assets/styles`));
}
exports.build_css = build_stylesheetFiles;

// -------------------------------------------------------------------------- //
// Icons
// -------------------------------------------------------------------------- //
function build_iconSprites() {
	return gulp
		.src(`${directoriesPaths.source}/images/icons/**/*.svg`)
		.pipe(gulpRename({ prefix: "icon_" }))
		.pipe(gulpIf(IS_PRODUCTION, gulpSVGmin()))
		.pipe(gulpSVGstore())
		.pipe(gulp.dest(`${directoriesPaths.build}/assets/images`));
}
exports.build_icons = build_iconSprites;

// -------------------------------------------------------------------------- //
// Fonts
// -------------------------------------------------------------------------- //
function clone_fonts() {
	return gulp
		.src(`${directoriesPaths.source}/fonts/**/*.woff2`)
		.pipe(gulpClone())
		.pipe(gulp.dest(`${directoriesPaths.build}/assets/fonts`));
}
exports.clone_fonts = clone_fonts;

// -------------------------------------------------------------------------- //
// Favicon
// -------------------------------------------------------------------------- //
function clone_favicon() {
	return gulp
		.src(`${directoriesPaths.source}/images/favicon/xeho91-avatar.min.svg`)
		.pipe(gulpClone())
		.pipe(gulp.dest(`${directoriesPaths.build}/assets/images`));
}
exports.clone_favicon = clone_favicon;

// -------------------------------------------------------------------------- //
// Compress
// -------------------------------------------------------------------------- //
function compress_build() {
	return gulp
		.src(`${directoriesPaths.build}/**/*`, { nodir: true })
		.pipe(gulpIf(IS_PRODUCTION, gulpBrotli()))
		.pipe(gulp.dest(directoriesPaths.build));
}
exports.compress = compress_build;

// -------------------------------------------------------------------------- //
// Build output
// -------------------------------------------------------------------------- //
var gulpTasks = [
	clean_previousBuild,
	gulp.parallel(
		clone_fonts,
		clone_favicon,
		build_markupFiles,
		build_stylesheetFiles,
		build_iconSprites,
	),
	IS_PRODUCTION ? compress_build : false,
].filter(Boolean);
var build_output = gulp.series(...gulpTasks);
exports.build = build_output;

// -------------------------------------------------------------------------- //
// Watch files
// -------------------------------------------------------------------------- //
function watch_files() {
	// https://www.browsersync.io/docs/options
	browserSync.init({
		watch: true,
		files: "**/*",
		injectChanges: true,
		server: {
			baseDir: directoriesPaths.build,
		},
		port: 8080,
		open: false,
		reloadOnRestart: true,
		// reloadDelay: 200,
	});

	gulp.watch([
		`${directoriesPaths.source}/data.json`,
		`${directoriesPaths.source}/**/*.html`,
	]).on("change", gulp.series(build_markupFiles));

	gulp.watch(`${directoriesPaths.source}/**/*.css`).on(
		"change",
		build_stylesheetFiles
	);

	gulp.watch(`${directoriesPaths.source}/**/*.svg`).on(
		"change",
		build_iconSprites
	);
}
exports.watch = watch_files;

// -------------------------------------------------------------------------- //
// Default
// -------------------------------------------------------------------------- //
exports.default = gulp.series(build_output, watch_files);

// cSpell:words gulpHTMLnano gulpSVGstore, gulpSVGmin, postHTMLplugins
// cSpell:words postCSSplugins
