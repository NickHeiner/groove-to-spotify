'use strict';

const loadJsonFile = require('load-json-file'),
    got = require('got'),
    _ = require('lodash'),
    // SpotifyWebApi = require('spotify-web-api-node'),
    logger = require('./logger');

module.exports = saveGrooveCollection;

async function saveGrooveCollection(spotifyAuthToken, spotifyClientId, spotifyClientSecret, grooveMusicExportFile, searchLimit) {
    const grooveJson = await loadJsonFile(grooveMusicExportFile);
    logger.info({albumCount: grooveJson.Albums.length, grooveMusicExportFile}, 'Loaded Groove export json');

    const spotifySearchResults = await Promise.all(
        _(grooveJson.Albums)
            .take(searchLimit || Infinity)
            .map(async (album) => {
                const searchResponse = await got('https://api.spotify.com/v1/search', {
                    json: true,
                    query: {
                        type: 'album',
                        q: `artist:${album.Artists[0].Name} album:${album.Title}`
                    }
                });

                if (searchResponse.statusCode !== 200) {
                    const err = new Error('Spotify search failed');
                    err.response = searchResponse;
                    throw err;
                }

                return {
                    groove: album,
                    spotify: searchResponse.body.albums
                };
            })
            .value()
        ),
        groupedSearchResults = _.groupBy(spotifySearchResults, result => result.spotify.items.length),
        summary = _.mapValues(groupedSearchResults, resultsForAlbumCount => _.map(resultsForAlbumCount, result => result.groove.Title));

    logger.info({summary}, 'Searched Spotify for Groove collection');

    // const spotify = new SpotifyWebApi({
    //     clientId: spotifyClientId,
    //     secret: spotifyClientSecret
    // });

    // const authGrantResponse = await spotify.authorizationCodeGrant(spotifyAuthToken);
    // spotify.setAccessToken(authGrantResponse.body.access_token);
}
