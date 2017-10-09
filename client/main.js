console.log('sourcelink');
var db = new PouchDB('http://localhost:5984/kittens', {
    ajax: {
        withCredentials: false
    }
});
async function f() {
    var info = await db.info();
    console.log(info);
}
f();