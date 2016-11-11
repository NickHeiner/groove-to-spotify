'use strict';

const bunyan = require('bunyan'),
    config = require('./config'),
    _ = require('lodash'),
    prettyMs = require('pretty-ms'),
    bunyanFormat = require('bunyan-format')({outputMode: 'short'});

const logger = module.exports = bunyan.createLogger({
    name: require('../package').name,
    stream: bunyanFormat,
    level: config('loglevel')
});

async function logStep(logOpts, fn) {
    const logOptsWithoutStep = _.omit(logOpts, 'step'),
        step = logOpts.step;
    logger.info(logOptsWithoutStep, `Starting ${step}`);

    function logProgress(logOpts) {
        logger.info(_.merge({}, logOpts, getDurationStats()), `In progress: ${step}`);
    }

    function getDurationStats() {
        const endTime = new Date(),
            durationMs = endTime - startTime;

        return {durationMs, prettyDuration: prettyMs(durationMs)};
    }
    
    const startTime = new Date(),
        returnVal = await fn(logProgress);

    logger.info(
        _.merge({}, logOptsWithoutStep, getDurationStats()), 
        `Completed ${step}`
    );

    return returnVal;
}

module.exports.logStep = logStep;
