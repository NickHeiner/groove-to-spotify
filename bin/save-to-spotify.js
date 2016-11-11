#!/usr/bin/env node --harmony-async-await

const asyncWrapper = require('../lib/async-wrapper'),
    config = require('../lib/config'),
    saveToSpotify = require('../lib/save-to-spotify');

asyncWrapper(() => saveToSpotify(
    config('spotify:authToken'),
    config('spotify:clientId'),
    config('spotify:clientSecret'),
    config('groove:exportFile'),
    config('in:searchLimit')
));
