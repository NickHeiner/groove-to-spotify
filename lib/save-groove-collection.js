'use strict';

const got = require('got'), 
    qFs = require('q-fs/io'),
    logger = require('./logger'),

    // eslint-disable-next-line max-len
    grooveEndpoint = 'https://cloudcollection-ssl.xboxlive.com/en-US/users/cloudcollection/albums?lightSchema=true&noImages=true&deviceId=Web&deviceType=Web&sortedBy=CollectionDate&page=0';

module.exports = saveGrooveCollection;

async function saveGrooveCollection(authorizationToken, fileToSave) {
    const collection = await got(grooveEndpoint, {
        headers: {
            Authorization: authorizationToken
        },
        json: true
    });

    logger.info({collection}, 'Got Groove collection');

    qFs.writeFile(fileToSave, collection);

    logger.info({fileToSave}, 'Wrote to file');
}
