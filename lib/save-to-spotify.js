'use strict';

const loadJsonFile = require('load-json-file'),
    _ = require('lodash'),
    SpotifyWebApi = require('spotify-web-api-node'),
    prettyMs = require('pretty-ms'),
    logger = require('./logger');

module.exports = saveGrooveCollection;

async function saveGrooveCollection(
    spotifyAuthToken, 
    spotifyClientId, 
    spotifyClientSecret, 
    grooveMusicExportFile, 
    searchLimit
) {
    const grooveJson = await loadJsonFile(grooveMusicExportFile);
    logger.info({albumCount: grooveJson.Albums.length, grooveMusicExportFile}, 'Loaded Groove export json');

    const spotify = new SpotifyWebApi({
        clientId: spotifyClientId,
        clientSecret: spotifyClientSecret,
        redirectUri : 'http://hexxie.com:8080/auth-callback'
    });

    const authGrantResponse = await spotify.authorizationCodeGrant(spotifyAuthToken);
    spotify.setAccessToken(authGrantResponse.body.access_token);

    logger.info({
        accessToken: authGrantResponse.body.access_token, 
        expiresIn: prettyMs(authGrantResponse.body.expires_in * 1000)
    }, 'Set access token');

    const spotifySearchResults = await Promise.all(
        _(grooveJson.Albums)
            .take(searchLimit || Infinity)
            .map(async (album) => {
                const searchResponse = await spotify.searchAlbums(
                    `artist:${album.Artists[0].Name} album:${album.Title}`
                );

                return {
                    groove: album,
                    spotify: searchResponse.body.albums
                };
            })
            .value()
        ),
        groupedSearchResults = _.groupBy(spotifySearchResults, result => result.spotify.items.length),
        summary = _.mapValues(
            groupedSearchResults, 
            resultsForAlbumCount => _.map(resultsForAlbumCount, result => result.groove.Title)
        );

    logger.info({summary}, 'Searched Spotify for Groove collection');
}
