'use strict';

const nconf = require('nconf'),
    _ = require('lodash'),
    flat = require('flat'),
    minimist = require('minimist'),
    traverse = require('traverse'),
    ENV_DELIMITER = '__',
    ENV_DELIMITER_REGEX = new RegExp('.+' + ENV_DELIMITER + '.+');

module.exports = createConfig(process.argv);

/**
 * @description Create configuration
 *
 * @param {string[]} argv command-line arguments
 * @returns {object} configuration object
 */
function createConfig(rawArgv) {
    const config = new nconf.Provider(),
        parsedArgv = flat.unflatten(minimist(rawArgv), {delimiter: ':'}),
        envWhitelist = _(process.env)
            .keys()
            .filter(key => ENV_DELIMITER_REGEX.test(key) && !/^npm_config/.test(key))
            .valueOf()
            .concat(['loglevel']);

    config.add('argv', {type: 'literal', store: parsedArgv});

    config.env({
        separator: ENV_DELIMITER,
        whitelist: envWhitelist
    });

    function get(key, defaultValue) {
        let result = coerceValues(config.get(key));

        if (_.isUndefined(result)) {
            result = defaultValue;
        }

        return result;
    }

    get.require = function require(key) {
        const val = config.get(key);
        if (!val) {
            throw new Error(`Config value ${key} is required, but was not present`);
        }
        return val;
    };

    return get;
}

function coerceValues(configData) {
    return traverse(configData).forEach(function(value) {
        if (this.isLeaf && !_.isUndefined(value)) {
            // Allow env vars to define boolean values
            if (value === 'true') {
                this.update(true);
            } else if (value === 'false') {
                this.update(false);
            } else if (value === 'undefined') {
                this.update(void 0);
            }
        }
    });
}
