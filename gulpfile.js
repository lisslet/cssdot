const fs                                                  = require('fs');
const {src, dest, lastRun, task, watch, series, parallel} = require('gulp');

const pump = require('pump');
// const sass = require('gulp-sass');
const sass = require('gulp-dart-sass');

const debug = require('gulp-debug');

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


function since(task) {
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
		debug(),
		$sass(),
		dest(prebuild.dest),
		done
	);
});

task('cssdot-prebuild-watch', done => {
	watch(prebuild.src + sassFiles,
		series('cssdot-prebuild-compile')
	);

	watch(prebuildJsonFile,
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
		debug(),
		$sass(),
		dest('./examples'),
		done
	);
});

watch(
	[exampleTarget, $src + '**/*.scss'],
	series('cssdot-example-compile')
);

task('cssdot-examples-only', parallel(
	'cssdot-example-compile'
));

task('cssdot-watch', done => {
	return watch(
		compileTestTarget,
		// series('cssdot-compile-test')
		series('cssdot-example-compile')
	);
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

const packageRoot = './package';

task('deploy:prebuild-copy-extra', done => {
	pump(
		src([
			'./LICENSE',
			'./*.md',
			'!./TODO.md',
		]),
		dest(packageRoot),
		done
	)
});

task('deploy:prebuild-copy-css', done => {
	pump(
		src(prebuild.dest + '/**/*'),
		dest(packageRoot),
		done
	)
});


task('deploy:prebuild-package-json', done => {
	const packageJson = require('./package.json');
	packageJson.name += '-prebuilt';
	packageJson.description += ' Prebuilt Files';

	delete packageJson.scripts;
	delete packageJson.dependencies;
	delete packageJson.devDependencies;

	fs.writeFileSync(
		packageRoot + '/package.json',
		JSON.stringify(packageJson, null, 2)
	);

	done();
});


if (!dirExists(packageRoot)) {
	mkdir(packageRoot);
}

const git = require('simple-git/promise')(packageRoot);


function gitReady(git, url) {
	return gitInit(git, url)
		.then(() => {
			console.log('git pull')
			return git.pull('origin', 'master');
		})
}

function gitInit(git, url) {
	return new Promise(resolve => {
		git.init()
			.then(() => {
				console.log('git remote add origin ' + url);
				return git.addRemote('origin', url);
			})
			.then(() => {
				resolve();
			})
			.catch(error => {
				resolve();
			});
	});
}

function errorLog(error) {
	console.warn(error);
}

task('deploy:prebuild-git-init', done => {
	const packageJson   = require('./package');
	const repositoryUrl = packageJson.repository.url
		.replace(/\.git$/, '-prebuilt.git');

	const git = require('simple-git/promise')(packageRoot);

	gitReady(git, repositoryUrl)
		.then(() => done())
		.catch(errorLog);
});

task('deploy:prebuild-git-push', done => {
	console.log('git add .');
	git.add('./')
		.then(() => {

			const date      = new Date;
			const timestamp = [
				[
					date.getFullYear(),
					date.getMonth() + 1,
					date.getDate()
				].join('-'),
				[
					date.getHours(),
					date.getMinutes(),
					date.getSeconds()
				].join(':')
			].join('T');

			console.log('git commit');
			return git.commit(timestamp);
		})
		.then(() => {
			console.log('git push origin master');
			return git.push('origin', 'master');
		})
		.then(() => {
			done();
		})
		.catch(errorLog);
});


task('deploy:prebuild', series([
	'deploy:prebuild-git-init',
	'deploy:prebuild-copy-extra',
	'deploy:prebuild-copy-css',
	'deploy:prebuild-package-json',
	'deploy:prebuild-git-push'
]));
