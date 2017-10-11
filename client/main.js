console.log('sourcelink');
var remoteDB = new PouchDB('http://localhost:5984/kittens', {
    ajax: {
        withCredentials: false
    }
});

var db = new PouchDB('kittens');

start();




async function start() {
    var info = await remoteDB.info();
    console.log("remote", info);
    var info = await db.info();
    console.log("local", info);

    db.replicate.from(remoteDB).on('complete', function(info) {
        console.log("first sync",info);
        sync();
        test();
    }).on('error', function(err) {
        console.log("first sync error");
        console.log(err);
        sync();
    });

}




function sync(){
    db.sync(remoteDB, {
        live: true,
        retry: true
    }).on('change', function (change) {
        // yo, something changed!
        console.log("change", change.direction, change.change, new Date().toJSON());
        if (change.direction == "pull") {
            show(change.change.docs);
        } else {
            show(change.change.docs);
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


async function test(){
    try {
        var doc = await db.get("mittens");
    } catch (err) {
        if (err.name !== 'not_found') throw e;
        var doc = {
            "_id": "mittens",
            "visited": new Date(),
            "name": "Mittens",
            "born": new Date(),
        }
    }
    console.log("test", doc);
    Object.assign(doc, {
        "visited": new Date(),
    });
    await db.put(doc);
    console.log("test", doc);
}

function show(docs) {
    console.log("docs", docs);
    console.log(JSON.stringify([new Date(docs[0].visited), docs[0]._id]));
}
