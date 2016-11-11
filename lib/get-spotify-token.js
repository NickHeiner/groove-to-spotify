'use strict';

const Koa = require('koa'),
    app = new Koa(),
    open = require('open'),
    logger = require('./logger'),
    
    SpotifyWebApi = require('spotify-web-api-node'),
    authCallbackPath = '/auth-callback',
    port = 8080,
    redirectUri = `http://hexxie.com:${port}${authCallbackPath}`,
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

        const body = ctx.path === authCallbackPath ?
            `<p>Auth token: ${ctx.query.code}</p>` :
            `<p>Authorize: <a href="${authorizationURL}">${authorizationURL}</a></p>`;

        ctx.body = `
            <html>
                <head>
                    <title>Get Spotify Token</title>
                    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
                </head>
                <body>
                    ${body}
                </body>
            </html>
        `;
    });

    await app.listen(port);
    logger.info({port}, 'Server listening');
    open(`http://localhost:${port}`);
}
