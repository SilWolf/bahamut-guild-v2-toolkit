const gulp = require('gulp')

// Gulp 插件
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const header = require('gulp-header')

const usHeader = require('./userscriptHeader.js')

gulp.task('concat', () => {
	return gulp
		.src(['src/core/metadata.js', 'src/core/index.js', 'src/**/*.js'])
		.pipe(concat('index.js'))
		.pipe(gulp.dest('dist'))
})

gulp.task('clean', () => {
	return gulp.src('dist', { read: false, allowEmpty: true }).pipe(clean())
})

gulp.task(
	'build',
	gulp.series('clean', () =>
		gulp
			.src(['src/plugins/**/index.js', 'src/core.js'])
			.pipe(concat('index.js'))
			.pipe(header(usHeader))
			.pipe(gulp.dest('dist'))
	)
)
