const gulp = require('gulp');
const {src, dest, lastRun, task, watch, series, parallel} = gulp;

const pump = require('pump');
// const sass = require('gulp-sass');
const sass = require('gulp-dart-sass');

const $sass = () => {
	return sass().on('error', sass.logError);
};


const $src  = './src/';
const $dest = './';

const sassFiles = '**/*.scss';

const prebuild = {
	label: 'cssdot-prebuild',
	src  : $src + 'prebuild/',
	dest : $dest + 'prebuilt/',
};


const fs = require('fs');



function since(task){
	return {
		since: lastRun(task)
	}
}

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

task('cssdot-prebuild-templates', done => {
	const templates = require('./prebuild')();
	templates.map(template => {
		fileWrite(template.filename, template.content);
	});
	done();
});

task('cssdot-prebuild-compile', done => {
	pump(
		src(prebuild.src + sassFiles),
		$sass(),
		dest(prebuild.dest),
		done
	);
});

task('cssdot-prebuild-watch', done => {
	gulp.watch(prebuild.src + sassFiles,
		series('cssdot-prebuild-compile')
	);

	gulp.watch(prebuildJsonFile,
		series('cssdot-prebuild-templates')
	);
	done();
});

task('cssdot-prebuild',
	series(
		'cssdot-prebuild-templates',
		'cssdot-prebuild-compile',
		'cssdot-prebuild-watch'
	)
);

const compileTestTarget = [
	$src + sassFiles,
	`!${$src}*.scss`,
	`!${$src}layout/*.scss`,
	`!${$src}**/only.scss`,
	`!${$src}prebuild/**/*`
];

task('cssdot-compile-test', done => {
	pump(
		src(compileTestTarget),
		$sass(),
		done
	);
});

const exampleTarget = './examples/**/*.scss';

task('cssdot-example-compile', done => {
	pump(
		src(exampleTarget, since('cssdot-example-compile')),
		$sass(),
		dest('./examples'),
		done
	);
});

task('cssdot-example-watch', () => {
	return gulp.watch(
		exampleTarget,
		series('cssdot-example-compile')
	);
});

task('cssdot-examples-only', parallel(
	'cssdot-example-compile',
	'cssdot-example-watch'
));

task('cssdot-watch', done => {
	gulp.watch(
		compileTestTarget,
		// series('cssdot-compile-test')
		series('cssdot-example-compile')
	);

	done();
});

task('cssdot-default', parallel(
	// 'cssdot-compile-test',
	'cssdot-prebuild',
	'cssdot-example-compile',
	'cssdot-watch'
));

task('default', parallel(
	'cssdot-default'
));