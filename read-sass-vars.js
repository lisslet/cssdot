const fs = require('fs');

const _variables = /\$[^:]+:[^;]+;/g;
const _variable = /\$([^:]+):([^;]+);/;
const _hyphens = /-/g;
const _flag = /![a-z]+$/;
const _map = /[^:]+:(\([^)]*\)|[^,])+,?/g;
const _lastRest = /,$/;
const _list = /(?:,\s?|\s+)/;
const _doubleQuote = /^"([^"]*)"$/;
const _quote = /^'([^']*)'$/;
const _numeric = /^\d+(\.\d+)?$/;

/**
 * get sass variables from contents
 * @param {""} contents
 * @param {{}} option
 */
function sass(contents, option = {}) {
    if (typeof option === 'string') {
        option = (remove => {
            return {
                name(value) {
                    return value.replace(remove, '');
                }
            };
        })(option);
    } else if (!option.name) {
        option.name = value => value;
    }

    contents = contents
        .replace(/\/\/[^\n\r]+[\n\r]+/g, '')
        .replace(/\/\*(?!\*\/|.)\*\//g, '')
        .trim();

    let result = {};
    let properties = contents.match(_variables);

    if (!properties) {
        return result;
    }

    const end = properties.length;
    let key = -1;
    let property;
    let name;
    let value;

    while (++key < end) {
        property = properties[key].match(_variable);

        name = option.name(property[1].trim().replace(_hyphens, '_'));
        value = parseValue(property[2]);

        result[name] = value;
    }

    return result;
}

function fileExists(file) {
    try {
        return fs.lstatSync(file).isFile();
    } catch (e) {
        if (e.code == 'ENOENT') {
            return false;
        } else {
            throw e;
        }
    }
}

sass.from = (file, option = {}) => {
    if (!file.endsWith('.scss')) {
        file += '.scss';
    }

    if (fileExists(file)) {
        const content = fs.readFileSync(file, option.encoding || 'utf8');
        return sass(content, option);
    } else {
        throw new Error(`Not found File '${file}'.`);
    }
};

function parseValue(value) {
    value = value
        .replace(_flag, '')
        .trim();

    const hasParenthesis = value.startsWith('(') && value.endsWith(')');

    if (hasParenthesis || (value.indexOf(' ') > 0 || value.indexOf(',') > 0)) {
        if (hasParenthesis) {
            value = value.substr(1, value.length - 2).trim();
        }

        if (_map.test(value)) {
            let map = {};
            value.match(_map).map(property => {
                property = property.replace(_lastRest, '').split(':');
                const name = property.shift().trim();
                map[name] = parseValue(property.join(':'));
            });

            return map;
        } else {
            return value.split(_list).map(property => {
                return parseValue(property);
            });
        }
    } else {
        if (_doubleQuote.test(value) || _quote.test(value)) {
            value = value.substr(1, value.length - 2);
        }

        if (_numeric.test(value)) {
            value = Number(value);
        }
    }

    return value;
}

sass.parseValue = parseValue;
module.exports = sass;