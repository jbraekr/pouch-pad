"use strict";

if (typeof window === 'undefined') {
    var PouchDB = require('pouchdb');
    var config = { db: undefined };
    var main = { local: { name: undefined }, db: undefined };
    module.exports = {
        getMittens: getMittens,
        connectRemoteDb: connectRemoteDb,
        config: config,
        main: main,
        run: run,
        wrap: wrap,
    }

} else {
    var ist = window;
}

async function run(f) {
    wrap(f)();
}

function wrap(f) {
    return function (...a) {
        try {
            return f(...a);
        } catch (e) {
            console.log(f.toString(), f);
            console.log(e);
            throw e;
        }
    }
}

function connectRemoteDb() {
    var remoteDB = new PouchDB(config.db, {
        ajax: {
            withCredentials: false,
            auto_compaction: true,
        }
    });
    return remoteDB;
}


async function getMittens() {
    var now = new Date().toJSON();
    try {
        var doc = await main.db.get("mittens");
    } catch (err) {
        if (err.name !== 'not_found')
            throw err;
        var doc = {
            "_id": "mittens",
            "name": "Mittens",
            "born": now,
        }
    }
    Object.assign(doc, {
        "visited": {
            at: now,
            by: main.local.name
        },
    });
    return doc;
}

