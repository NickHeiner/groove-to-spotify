'use strict';

const Koa = require('koa'),
    app = new Koa(),
    open = require('open'),
    logger = require('./logger'),
    prettyMs = require('pretty-ms'),

    getSpotify = require('./get-spotify'),
    authCallbackPath = '/auth-callback',
    state = 'arbitrary-value',
    scopes = [];

module.exports = getSpotifyToken;

async function getSpotifyToken(spotifyClientId, spotifyClientSecret) {
    const spotify = getSpotify(spotifyClientId, spotifyClientSecret), 
        authorizationURL = spotify.createAuthorizeURL(scopes, state);

    app.use(async (ctx) => {
        ctx.type = 'text/html';

        let body;

        if (ctx.path === authCallbackPath) {
            const authGrantResponse = await spotify.authorizationCodeGrant(ctx.query.code);
            body = `<p>
                Auth code: <strong>${authGrantResponse.body.access_token}</strong>.
                Expires in ${prettyMs(authGrantResponse.body.expires_in * 1000)}
            </p>`;
        } else {
            body = `<p>Authorize: <a href="${authorizationURL}">${authorizationURL}</a></p>`;
        }

        ctx.body = `
            <html>
                <head>
                    <title>Get Spotify Token</title>
                    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    ${body}
                </body>
            </html>
        `;
    });

    const port = 8080;
    await app.listen(port);
    logger.info({port}, 'Server listening');
    open(`http://localhost:${port}`);
}
