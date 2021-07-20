const gulp = require('gulp')

// Gulp 插件
const concat = require('gulp-concat')
const ts = require('gulp-typescript')
const clean = require('gulp-clean')
const merge = require('merge2')

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
	gulp.series('clean', () => {
		var tsResult = gulp.src('src/**/*.ts').pipe(
			ts({
				declaration: true,
			})
		)

		return merge([
			tsResult.dts.pipe(gulp.dest('dist/definitions')),
			tsResult.js
				.pipe(gulp.dest('dist/js'))
				.pipe(concat('index.js'))
				.pipe(gulp.dest('dist')),
		])
	})
)
