if (typeof window === 'undefined') {
    module.exports = {
        getMittens: getMittens,
    }
} else {
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

