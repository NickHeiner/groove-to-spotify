'use strict';

const Koa = require('koa'),
    app = new Koa(),
    open = require('open'),
    logger = require('./logger'),
    
    SpotifyWebApi = require('spotify-web-api-node'),
    authCallbackPath = 'callback',
    redirectUri = `https://localhost/${authCallbackPath}`,
    state = 'arbitrary-value',
    scopes = [];

module.exports = getSpotifyToken;

async function getSpotifyToken(clientId) {
    const spotifyApi = new SpotifyWebApi({
            redirectUri: redirectUri,
            clientId: clientId
        }),
        
        authorizationURL = spotifyApi.createAuthorizeURL(scopes, state);

    app.use(async (ctx) => {
        ctx.type = 'text/html';
        ctx.body = `
            <html>
                <head>
                    <title>Get Spotify Token</title>
                </head>
                <body>
                    <a href="${authorizationURL}">Authorize</a>
                </body>
            </html>
        `;
    });

    const port = 8080;
    await app.listen(port);
    logger.info({port}, 'Server listening');
    open(`http://localhost:${port}`);
}
