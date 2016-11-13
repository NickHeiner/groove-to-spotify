#!/usr/bin/env node --harmony-async-await

const asyncWrapper = require('../lib/async-wrapper'),
    config = require('../lib/config'),
    getSpotifyToken = require('../lib/get-spotify-token');

asyncWrapper(() => getSpotifyToken(
    config('spotify:clientId'),
    config('spotify:clientSecret')
));
