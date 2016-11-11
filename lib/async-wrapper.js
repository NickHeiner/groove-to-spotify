'use strict';

const logger = require('./logger');

module.exports = asyncWrapper;

function asyncWrapper(fn) {
    fn()
        .catch(err => {
            logger.error({err}, err.message);
            process.exit(1);
        });
}
