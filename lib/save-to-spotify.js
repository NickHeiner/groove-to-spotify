'use strict';

const loadJsonFile = require('load-json-file'),
    _ = require('lodash'),
    getSpotify = require('./get-spotify'),
    PromiseThrottle = require('promise-throttle'),
    logger = require('./logger');

module.exports = saveGrooveCollection;

async function saveGrooveCollection(
    spotifyAccessToken, 
    spotifyClientId, 
    spotifyClientSecret, 
    grooveMusicExportFile, 
    searchLimit,
    dryRun
) {
    const grooveJson = await loadJsonFile(grooveMusicExportFile);
    logger.info({albumCount: grooveJson.Albums.length, grooveMusicExportFile}, 'Loaded Groove export json');

    const spotify = getSpotify(spotifyClientId, spotifyClientSecret);
    spotify.setAccessToken(spotifyAccessToken);

    const throttle = new PromiseThrottle({
        requestsPerSecond: 10,
        promiseImplementation: Promise
    });

    const spotifySearchResults = await Promise.all(
        _(grooveJson.Albums)
            .take(searchLimit || Infinity)
            .map(album => 
                throttle.add(async () => {
                    const artist = album.Artists[0].Name,
                        title = album.Title, 
                        searchResponse = await logger.logStep(
                            {step: 'searching for album', artist, title}, 
                            () => spotify.searchAlbums(`artist:${artist} album:${title}`)
                        );

                    return {
                        groove: album,
                        spotify: searchResponse.body.albums
                    };
                })
            )
            .value()
        ),
        groupedSearchResults = _.groupBy(spotifySearchResults, result => result.spotify.items.length),
        summary = _.mapValues(
            groupedSearchResults, 
            resultsForAlbumCount => _.map(resultsForAlbumCount, result => result.groove.Title)
        );
    
    logger.info({summary}, 'Searched Spotify for Groove collection');
        
    const albumsToImport = groupedSearchResults[1],
        importSummary = _.map(albumsToImport, summaryOfAlbum);

    logger.info({importSummary}, 'Ready to import');

    if (dryRun) {
        return;
    }

    await Promise.all(
        _.map(
            albumsToImport, 
            album => 
                throttle.add(
                    async () => {
                        const albumId = _.last(album.spotify.items[0].uri.split(':'));
                        return logger.logStep(
                            _.merge({}, summaryOfAlbum(album), {step: 'adding album', albumId}),
                            () => spotify.addToMySavedAlbums(albumId)
                        );
                    }
            )
        )
    );
}

function summaryOfAlbum(album) {
    return {
        grooveTitle: album.groove.Title,
        grooveArtist: album.groove.Artists[0].Name,
        spotifyUrl: album.spotify.items[0].external_urls.spotify
    };
}
