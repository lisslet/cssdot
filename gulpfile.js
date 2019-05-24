const gulp = require('gulp');
const pump = require('pump');
const sass = require('gulp-sass');

const $sass = () => {
	return sass().on('error', sass.logError);
};

const src  = './src/';
const dest = './';

const sassFiles = '**/*.scss';

const prebuild = {
	label: 'cssdot-prebuild',
	src  : src + 'prebuild/',
	dest : dest + 'prebuilt/',
};


const fs = require('fs');

function dirExists(file) {
	try {
		return fs.lstatSync(file).isDirectory();
	} catch (e) {
		if (e.code === 'ENOENT') {
			return false;
		} else {
			throw e;
		}
	}
}

function fileExists(file) {
	try {
		return fs.lstatSync(file).isFile();
	} catch (e) {
		if (e.code === 'ENOENT') {
			return false;
		} else {
			throw e;
		}
	}
}

function fileWrite(fileName, content) {
	if (!fileExists(fileName)) {
		const dirName = fileName.replace(/\/[^\/]+$/, '');
		if (dirName) {
			mkdir(dirName);
		}
	}
	fs.writeFileSync(fileName, content.trim());
}

function mkdir(dirName) {
	if (dirName.endsWith('/')) {
		dirName = dirName.substr(0, dirName.length);
	}

	if (!dirExists(dirName)) {
		dirName = dirName.split('/');
		dirName.forEach((value, index) => {
			if (value === '.' || value === '..') {
				return;
			}

			const dir = dirName.slice(0, index + 1).join('/');
			if (!dirExists(dir)) {
				fs.mkdirSync(dir);
			}
		});
	}
}

const prebuildJsonFile = './prebuild.json';

function getImportPath(file) {
	return file.split('/').map(() => '').join('../') + file + '.scss';
}

gulp.task('cssdot-prebuild-templates', done => {
	const templates = require('./prebuild')();
	templates.map(template => {
		fileWrite(template.filename, template.content);
	});
	done();
});

gulp.task('cssdot-prebuild-compile', done => {
	pump(
		gulp.src(prebuild.src + sassFiles),
		$sass(),
		gulp.dest(prebuild.dest),
		done
	);
});

gulp.task('cssdot-prebuild-watch', done => {
	gulp.watch(prebuild.src + sassFiles,
		gulp.series('cssdot-prebuild-compile')
	);

	gulp.watch(prebuildJsonFile,
		gulp.series('cssdot-prebuild-templates')
	);
	done();
});

gulp.task('cssdot-prebuild',
	gulp.series(
		'cssdot-prebuild-templates',
		'cssdot-prebuild-compile',
		'cssdot-prebuild-watch'
	)
);

const compileTestTarget = [
	src + sassFiles,
	`!${src}*.scss`,
	`!${src}layout/*.scss`,
	`!${src}**/only.scss`,
	`!${src}prebuild/**/*`
];

gulp.task('cssdot-compile-test', done => {
	pump(
		gulp.src(compileTestTarget),
		$sass(),
		done
	);
});

const exampleTarget = './examples/**/*.scss';

gulp.task('cssdot-examples', done => {
	pump(
		gulp.src(exampleTarget),
		$sass(),
		gulp.dest('./examples'),
		done
	);
});

gulp.task('cssdot-watch', done => {
	gulp.watch(
		compileTestTarget,
		// gulp.series('cssdot-compile-test')
        gulp.series('cssdot-examples')
	);


	gulp.watch(
		exampleTarget,
		gulp.series('cssdot-examples')
	);

	done();
});

gulp.task('cssdot-default', gulp.parallel(
	// 'cssdot-compile-test',
	'cssdot-prebuild',
	'cssdot-examples',
	'cssdot-watch'
));

gulp.task('default', gulp.parallel(
	'cssdot-default'
));