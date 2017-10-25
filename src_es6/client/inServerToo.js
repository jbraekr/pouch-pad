if (typeof window === 'undefined') {
    var PouchDB = require('pouchdb');
    var config = { db: undefined };
    var main = { local: { name: undefined } };
    module.exports = {
        getMittens: getMittens,
        connectRemoteDb: connectRemoteDb,
        config: config,
        main: main,
    }

} else {
    var ist = window;
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
        var doc = await db.get("mittens");
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

