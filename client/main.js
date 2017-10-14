console.log('sourcelink');

if (/^\//.test(config.db)) config.db = document.origin + config.db;

var remoteDB = new PouchDB(config.db, {
    ajax: {
        withCredentials: false,
        auto_compaction: true,
    }
});

var db = new PouchDB('kittens', {
    auto_compaction: true
});

start();




async function start() {
    var info = await remoteDB.info();
    console.log("remote", info);
    var info = await db.info();
    console.log("local", info);

    db.replicate.from(remoteDB).on('complete', function (info) {
        console.log("first sync", info);
        firstShow();
        sync();
        //test();
    }).on('error', function (err) {
        console.log("first sync error");
        console.log(err);
        sync();
    });

}




function sync() {
    db.sync(remoteDB, {
        live: true,
        retry: true
    }).on('change', function (change) {
        // yo, something changed!
        console.log("change", change.direction, change.change, new Date().toJSON());
        if (change.direction === "pull") {
            show();
        }
    }).on('paused', function (info) {
        // replication was paused, usually because of a lost connection
        //console.log('sync paused', info);
    }).on('active', function (info) {
        // replication was resumed
        console.log('sync active', info);
    }).on('error', function (err) {
        // totally unhandled error (shouldn't happen)
        console.log('sync error', err);
        console.log(err);
    });
}


async function test() {
    var now = new Date();
    try {
        var doc = await db.get("mittens");
    } catch (err) {
        if (err.name !== 'not_found') throw e;
        var doc = {
            "_id": "mittens",
            "visited": now,
            "name": "Mittens",
            "born": now,
        }
    }
    console.log("test", doc);
    Object.assign(doc, {
        "visited": now,
    });
    await db.put(doc);
    console.log("test", doc);
    document.getElementById("echo").innerText = JSON.stringify(["push", now.toJSON()], null, 2);
}




function firstShow() {
    //setup scene
    show(true);
}

async function show(first) {
    console.log("show", first)
    try {
        var doc = await db.get("mittens");
        var now = new Date();
        var lag = form(now - new Date(doc.visited), 8) + " ms ago";
        console.log(doc, lag);
        document.getElementById("echo").innerText = JSON.stringify([lag, now.toJSON(), doc], null, 2);
        if (first) {
            console.log("setup scene");
        }
        //update scene
    } catch (err) {
        console.log("show");
        console.log(err);
    }
}

function form(int, digits) {
    return int.toLocaleString("en", { minimumIntegerDigits: digits });
}