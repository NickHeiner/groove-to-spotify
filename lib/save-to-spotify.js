'use strict';

const loadJsonFile = require('load-json-file'),
    _ = require('lodash'),
    getSpotify = require('./get-spotify'),
    logger = require('./logger');

module.exports = saveGrooveCollection;

async function saveGrooveCollection(
    spotifyAccessToken, 
    spotifyClientId, 
    spotifyClientSecret, 
    grooveMusicExportFile, 
    searchLimit
) {
    const grooveJson = await loadJsonFile(grooveMusicExportFile);
    logger.info({albumCount: grooveJson.Albums.length, grooveMusicExportFile}, 'Loaded Groove export json');

    const spotify = getSpotify(spotifyClientId, spotifyClientSecret);
    spotify.setAccessToken(spotifyAccessToken);

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
