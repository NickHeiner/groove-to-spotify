'use strict';

const SpotifyWebApi = require('spotify-web-api-node');

module.exports = getSpotify;

function getSpotify(spotifyClientId, spotifyClientSecret) {
    return new SpotifyWebApi({
        clientId: spotifyClientId,
        clientSecret: spotifyClientSecret,
        redirectUri : 'http://hexxie.com:8080/auth-callback'
    });
}
