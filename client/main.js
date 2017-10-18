console.log('sourcelink');

if (/^\//.test(config.db)) config.db = document.origin + config.db;

var main = {};

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
    status();
    var info = await remoteDB.info();
    console.log("remote", info);
    var info = await db.info();
    console.log("local", info);

    var now = new Date();

    try {
        var s2 = JSON.parse(sessionStorage.getItem('me'));
        if (!s2.name) throw "need fresh me";
        main.local = s2;
    } catch (err) {
        console.log("ignore");
        console.log(err);
        main.local = {
            name: 'kitten/' + now.toJSON(),
        };
        sessionStorage.setItem('me', JSON.stringify(main.local));
    }

    try {
        var doc = await db.get(main.local.name);
    } catch (err) {
        if (err.name !== 'not_found') throw err;
        var doc = {
            "_id": main.local.name,
        }
    }
    Object.assign(doc, {
        "wokeUp": now,
    });
    await db.put(doc);

    status();

    db.replicate.from(remoteDB).on('complete', function (info) {
        console.log("first sync", info);
        main.net = "complete";
        status();
        firstShow();
        sync();
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
        } else {
            show(); //push can be other tab!
        }
    }).on('paused', function (info) {
        // replication was paused, usually because of a lost connection
        //console.log('sync paused', info);
        main.net = "paused";
        status();
    }).on('active', function (info) {
        // replication was resumed
        main.net = "active";
        status();
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
            "name": "Mittens",
            "born": now,
        }
    }
    console.log("test", doc);
    Object.assign(doc, {
        "visited": { at: now, by: main.local.name },
    });
    await db.put(doc);
    console.log("test", doc);
    document.getElementById("echo").innerText = JSON.stringify(["push", now.toJSON()], null, 2);
}




function status() {
    var a = [`${document.origin} node ${config.node}\n${config.db}\nnet: ${main.net}`];
    if (main.local)
        a.push(`name: ${JSON.stringify(main.local.name)}`);
    document.getElementById("status").innerText = a.join('\n');
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
        var lag = "Mittens visited " + form(now - new Date(doc.visited.at), 8) + " ms ago";
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

