'use strict';

const logger = require('./logger');

module.exports = asyncWrapper;

function asyncWrapper(fn) {
    fn()
        .catch(err => {
            logger.error({err}, 'Program crashed');
            process.exit(1);
        });
}
