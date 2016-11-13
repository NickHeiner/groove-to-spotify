'use strict';

const logger = require('./logger');

module.exports = asyncWrapper;

function asyncWrapper(fn) {
    logger.logStep({step: 'running program'}, fn)
        .catch(err => {
            logger.error({err, stack: err.stack}, err.message);
            process.exit(1);
        });
}
