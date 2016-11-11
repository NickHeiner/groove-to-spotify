#!/usr/bin/env node --harmony-async-await

const asyncWrapper = require('../lib/async-wrapper'),
    config = require('config'),
    saveGrooveCollection = require('../lib/save-groove-collection');

asyncWrapper(() => saveGrooveCollection(config('in:authToken'), config('out:file')));
