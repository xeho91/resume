require("dotenv").config();

var gulp = require("gulp");
var gulpClean = require("gulp-clean");
var gulpClone = require("gulp-clone");
var gulpRename = require("gulp-rename");
var gulpPostHTML = require("gulp-posthtml");
var gulpHTMLnano = require("gulp-htmlnano");
var gulpPostCSS = require("gulp-postcss");
var gulpCSSO = require("gulp-csso");
var gulpSVGstore = require("gulp-svgstore");
var gulpSVGmin = require("gulp-svgmin");

var browserSync = require("browser-sync").create();


const IS_PRODUCTION = process.env.NODE_ENV === "production";
console.log(`Environment: ${ process.env.NODE_ENV }`);

var directoriesPaths = {
	// input directory
	source: "../source",
	// output directory
	build: `../build/${ IS_PRODUCTION ? "production" : "development" }`,
};

// -------------------------------------------------------------------------- //
// Clraning
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
	let  data = require(`${directoriesPaths.source}/data.json`);
	let postHTMLplugins = [
		require("posthtml-modules")({
			root: directoriesPaths.source,
			from: directoriesPaths.source,
			locals: data,
		}),
		require("posthtml-expressions")({
			locals: data,
		}),
	];

	if (IS_PRODUCTION) {
		return gulp
			.src(`${directoriesPaths.source}/index.html`)
			.pipe(gulpPostHTML(postHTMLplugins))
			.pipe(gulpHTMLnano({
				// collapseAttributeWhitespace: true,
				collapseWhitespace: "conservative",
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
			}))
			.pipe(gulp.dest(directoriesPaths.build));
	} else {
		return gulp
			.src(`${directoriesPaths.source}/index.html`)
			.pipe(gulpPostHTML(postHTMLplugins))
			.pipe(gulp.dest(directoriesPaths.build));
	}
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

	if (IS_PRODUCTION) {
		return gulp
			.src(`${directoriesPaths.source}/styles/*.css`)
			.pipe(gulpPostCSS(postCSSplugins))
			.pipe(gulpCSSO())
			.pipe(gulp.dest(`${directoriesPaths.build}/assets/styles`));
	} else {
		return gulp
			.src(`${directoriesPaths.source}/styles/*.css`)
			.pipe(gulpPostCSS(postCSSplugins))
			.pipe(gulp.dest(`${directoriesPaths.build}/assets/styles`));
	}
}
exports.build_css = build_stylesheetFiles;

// -------------------------------------------------------------------------- //
// Icons
// -------------------------------------------------------------------------- //
function build_iconSprites() {
	if (IS_PRODUCTION) {
		return gulp
			.src(`${directoriesPaths.source}/images/icons/**/*.svg`)
			.pipe(gulpRename({ prefix: "icon_" }))
			.pipe(gulpSVGmin())
			.pipe(gulpSVGstore())
			.pipe(gulp.dest(`${directoriesPaths.build}/assets/images`));
	} else {
		return gulp
			.src(`${directoriesPaths.source}/images/icons/**/*.svg`)
			.pipe(gulpRename({ prefix: "icon_" }))
			.pipe(gulpSVGstore())
			.pipe(gulp.dest(`${directoriesPaths.build}/assets/images`));
	}
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
// Favicons
// -------------------------------------------------------------------------- //
function build_favicons() {
	if (IS_PRODUCTION) {
		return gulp
			.src(`${directoriesPaths.source}/images/favicon.svg`)
			.pipe(gulpSVGmin({
				plugins: [
					{ cleanupIDs: false },
					{ removeUnknownsAndDefaults: false },
				],
			}))
			.pipe(gulpClone())
			.pipe(gulp.dest(`${directoriesPaths.build}/assets/images`));
	} else {
		return gulp
			.src(`${directoriesPaths.source}/images/favicon.svg`)
			.pipe(gulpClone())
			.pipe(gulp.dest(`${directoriesPaths.build}/assets/images`));
	}
}
exports.build_favicons = build_favicons;

// -------------------------------------------------------------------------- //
// Build all
// -------------------------------------------------------------------------- //
var build_output = gulp.series(clean_previousBuild, gulp.parallel(
	clone_fonts,
	build_markupFiles,
	build_stylesheetFiles,
	build_iconSprites,
	build_favicons,
));
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

	gulp.watch(`${directoriesPaths.source}/**/*.html`)
		.on("change", gulp.series(build_markupFiles));

	gulp.watch(`${directoriesPaths.source}/**/*.css`)
		.on("change", build_stylesheetFiles);

	gulp.watch(`${directoriesPaths.source}/**/*.svg`)
		.on("change", build_iconSprites);
}
exports.watch = watch_files;

// -------------------------------------------------------------------------- //
// Default
// -------------------------------------------------------------------------- //
exports.default = gulp.series(build_output, watch_files);
