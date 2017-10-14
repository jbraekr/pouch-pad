
Pouch-pad
===

First: create admin!


Standalone server without server.js
---
    npm run standalone
- [view db status](http://localhost:5984/)
- [view config](http://localhost:5984/_utils/)


Local server with internal db
---
    npm start
- [view db status](http://localhost:3000/db/)
- [view config](http://localhost:3000/_utils/)
- [view app](http://localhost:3000)


Local server with external db
---
    #set env.DB in shell to database, like http://localhost:3000/db/kittens

    npm start
- [view app](http://localhost:3001)

Todo
---
- make glitch ready

Changelog
---
- [workaround gui path problem](https://github.com/pouchdb/pouchdb-server/issues/180)
- tried pouchdb-server and run by js
- empty .gitignore
- readme.md
- package.json