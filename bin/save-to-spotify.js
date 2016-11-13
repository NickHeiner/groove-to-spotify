#!/usr/bin/env node --harmony-async-await

const asyncWrapper = require('../lib/async-wrapper'),
    config = require('../lib/config'),
    saveToSpotify = require('../lib/save-to-spotify');

asyncWrapper(() => saveToSpotify(
    config.require('spotify:accessToken'),
    config.require('spotify:clientId'),
    config.require('spotify:clientSecret'),
    config.require('groove:exportFile'),
    config('in:searchLimit'),
    config('run:dry')
));
