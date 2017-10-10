console.log('sourcelink');
var db = new PouchDB('http://localhost:5984/kittens', {
    ajax: {
        withCredentials: false
    }
});
async function f() {
    var info = await db.info();
    console.log(info);
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
    console.log(doc);
    Object.assign(doc, {
        "visited": new Date(),
    });
    await db.put(doc);
    console.log(doc);
}
f();