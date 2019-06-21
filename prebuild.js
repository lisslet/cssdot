const sassVars = require('./read-sass-vars');

module.exports = (() => {
	let $reference = {};
	let $referenced = {};

	return function (configureFile = './prebuild.json') {
		const configure = require(configureFile);
		return configure.reduce(getTemplate, [], 0);
	};

	function next(templates, importFiles, filename, content = '') {
		const importPath = (filename + '/')
			.split('/')
			.map(() => '')
			.join('../');

		filename = './src/prebuild/' + filename + '.scss';

		importFiles = importFiles
				.map(importFile => `@import '${importPath + importFile}.scss';`)
				.join('\n')
			+ '\n';

		templates.push(
			{
				filename,
				content: importFiles + content
			}
		);
		return templates;
	}

	function getTemplate(templates, option) {
		if (typeof option === 'string') {
			return next(templates, [option], option);
		}

		const imports = [option.scss];

		if (option.reference) {
			$reference = (
				Array.isArray(option.reference) ?
					option.reference :
					[option.reference]
			).reduce((result, target) => {
				if ($referenced[target]) {
					return result;
				}

				$referenced[target] = true;
				return {
					...result,
					...sassVars.from('./src/' + target + '.scss')
				}
			}, $reference);
		}

		if (!Array.isArray(option.files)) {
			option.files = [option.files];
		}

		if (option.repeat) {
			const {repeat} = option;
			if (repeat.each) {
				const {each} = repeat;
				const iterator = getReference(option, each.iterator);

				if (!Array.isArray(iterator) && typeof iterator !== 'object') {
					throw new ReferenceError(`'${each.iterator}' is not an iterable`);
				}

				const condition = each.condition ?
					setCondition(option, each.condition) :
					null;

				if (Array.isArray(iterator)) {

				} else {
					const keyAs = each.key || 'key';
					const valueAs = each.value || 'value';

					Object.keys(iterator).forEach(key => {
						const value = iterator[key];

						if (condition) {
							if (condition.gte &&
								!(condition.gte <= value)
							) {
								return;
							}
						}

						option.files.forEach(file => {

							const templateValues = {
								[keyAs]: key,
								[valueAs]: value
							};

							const filename = render(file.filename, templateValues);
							const content = render(file.content, templateValues);
							return next(templates, imports, filename, content);
						});
					});
				}
			}
		} else {
			option.files.forEach(file => {
				return next(templates, imports, file.filename, file.content);
			});
		}
		return templates;
	}

	function render(content, values) {
		Object.keys(values).forEach(key => {
			content = content.replace(new RegExp('\\$' + key, 'g'), values[key]);
		});
		return content;
	};

	function getReference(option, property) {
		property = property.replace(/-/g, '_');
		if ($reference[property]) {
			return $reference[property];
		}
		throw new ReferenceError(`Cannot Found ${property} from ${option.reference}`);
	}

	function setCondition(option, conditions) {
		const result = {};
		Object.keys(conditions).forEach(key => {
			const condition = conditions[key];
			result[key] = typeof condition === 'string' ?
				getReference(option, condition) :
				condition;
		});
		return result;
	}
})();