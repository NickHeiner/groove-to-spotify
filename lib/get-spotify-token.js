'use strict';

const koa = require('koa'),
    app = new koa(),
    open = require('open'),
    logger = require('./logger');

module.exports = getSpotifyToken;

async function getSpotifyToken() {
    app.use(async (ctx) => {
        ctx.body = 'hi';
    });

    const port = 8080;
    await app.listen(port);
    logger.info({port}, 'Server listening');
    open(`http://localhost:${port}`);
}
