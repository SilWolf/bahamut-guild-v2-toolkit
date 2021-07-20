const gulp = require('gulp')

// Gulp 插件
const gulpConcat = require('gulp-concat')

gulp.task('concat', function () {
	return gulp
		.src('src/**/*.js')
		.pipe(gulpConcat('index.js'))
		.pipe(gulp.dest('dist'))
})
