'use strict';

const got = require('got'), 
    writeJsonFile = require('write-json-file'),
    _ = require('lodash'),
    logger = require('./logger'),

    // eslint-disable-next-line max-len
    grooveEndpoint = 'https://cloudcollection-ssl.xboxlive.com/en-US/users/cloudcollection/albums?lightSchema=true&noImages=true&deviceId=Web&deviceType=Web&sortedBy=CollectionDate&page=0';

module.exports = saveGrooveCollection;

async function saveGrooveCollection(authorizationToken, fileToSave) {
    const response = await got(grooveEndpoint, {
        headers: {
            Authorization: authorizationToken
        },
        json: true
    });

    if (response.statusCode !== 200) {
        const err = new Error('Groove request failed.');
        err.response = response;
        throw err;
    }

    logger.info({albumsSample: _.first(response.body.Albums)}, 'Got Groove collection');

    await writeJsonFile(fileToSave, response.body);

    logger.info({fileToSave}, 'Wrote to file');
}
