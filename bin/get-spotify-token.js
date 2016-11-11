#!/usr/bin/env node --harmony-async-await

const asyncWrapper = require('../lib/async-wrapper'),
    getSpotifyToken = require('../lib/get-spotify-token');

asyncWrapper(getSpotifyToken);
