console.log('sourcelink');

if (/^\//.test(config.db))
    config.db = document.origin + config.db;

var main = {};

main.original = document.getElementById('tracked').innerHTML;

var remoteDB = ist.connectRemoteDb();

main.db = new PouchDB('kittens', {
    auto_compaction: true
});

start();

async function start() {
    var now = new Date();

    main.net = "syncing";
    status();

    try {
        var s2 = JSON.parse(sessionStorage.getItem('me'));
        if (!s2.name)
            throw "need fresh me";
        main.local = s2;
    } catch (err) {
        console.log("ignore");
        console.log(err);
        main.local = {
            name: 'kitten/' + now.toJSON(),
        };
        sessionStorage.setItem('me', JSON.stringify(main.local));
    }

    firstShow();

    var info = await remoteDB.info();
    console.log("remote", info);
    var info = await main.db.info();
    console.log("local", info);

    try {
        var doc = await main.db.get(main.local.name);
    } catch (err) {
        if (err.name !== 'not_found')
            throw err;
        var doc = {
            "_id": main.local.name,
        }
    }
    Object.assign(doc, {
        "wokeUp": now,
    });
    await main.db.put(doc);

    status();

    main.db.replicate.from(remoteDB).on('complete', function (info) {
        console.log("first sync", info);
        main.net = "complete";
        status();
        sync();
        installServiceworker();
    }).on('error', function (err) {
        console.log("first sync error");
        console.log(err);
        sync();
    });

}

function sync() {
    main.db.sync(remoteDB, {
        live: true,
        retry: true
    }).on('change', function (change) {
        // yo, something changed!
        console.log("change", change.direction, change.change, new Date().toJSON());
        if (change.direction === "pull") {
            show();
        } else {
            show();
            //push can be other tab!
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
    var doc = await ist.getMittens();
    await main.db.put(doc);
    console.log("test", doc);
    document.getElementById("echo").innerText = JSON.stringify(["push", doc.visited.at], null, 2);
    document.getElementById('tracked').innerHTML = main.original;
    try {
        await pushPouch();
    } catch (err) {
        console.log(err);
        //throw err;
    }
}

async function pushPouch() {
    var doc = await getMittens();
    var old = doc.aScene;
    var nw = document.getElementById('tracked').innerHTML;
    if (old !== nw) {
        doc.aScene = nw;
        //document.getElementById("echo").innerText = JSON.stringify(["push", doc.visited.at], null, 2);
        await main.db.put(doc);
    }
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
        var doc = await main.db.get("mittens");
        var now = new Date();
        var lag = `Mittens was visited ${form(now - new Date(doc.visited.at), 8)} ms ago at ${doc.visited.at}`;
        console.log(doc, lag);
        document.getElementById("echo").innerText = `${lag}\n${doc.aScene}\n${JSON.stringify(doc, null, 2)}`;
        if (first) {
            console.log("setup scene");
        }
        //update scene
        //console.log(doc.aScene);
        if (doc.visited.by !== main.local.name || first) {

            var entityEl = document.getElementById('tracked');
            entityEl.parentNode.removeChild(entityEl);

            var entityEl = document.createElement('a-entity');
            entityEl.setAttribute('id', 'tracked');
            entityEl.setAttribute('track-add-remove', '');
            entityEl.innerHTML = doc.aScene;

            var sceneEl = document.querySelector('a-scene');
            sceneEl.appendChild(entityEl);

            //document.getElementById('tracked').innerHTML = doc.aScene;
        }
    } catch (err) {
        console.log("show");
        console.log(err);
    }
}

function form(int, digits) {
    return int.toLocaleString("en", {
        minimumIntegerDigits: digits
    });
}

function installServiceworker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope:\n  ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed:');
            console.log(err);
        });
    }
}
