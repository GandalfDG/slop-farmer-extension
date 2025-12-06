class SlopDB {
    db: IDBDatabase

    constructor(idb_version: number) {
        this.open_database(idb_version).then((db) => {
            this.db = db
        }).catch((err) => {
            console.log(err)
            throw err
        })
    }

    apply_db_upgrade(db: IDBDatabase, idb_version: number) {
        switch (idb_version) {
            case 1: 
                db.createObjectStore("slop", { keyPath: "domain" })
                break
            case 2:
                db.createObjectStore("checkcache", { keyPath: "domain" })
                break
        }
    }

    async open_database(idb_version: number): Promise<IDBDatabase> {
        const db_promise = new Promise<IDBDatabase>((resolve, reject) => {
            const db_request = window.indexedDB.open("SlopDB", idb_version)

            db_request.onerror = (_event) => {
                reject(db_request.error)
            }

            db_request.onsuccess = (_event) => {
                resolve(db_request.result)
            }

            db_request.onupgradeneeded = (upgrade_event) => {
                const oldVersion = upgrade_event.oldVersion
                const newVersion = upgrade_event.newVersion

                const db = db_request.result

                // make updates
                for (let version = oldVersion + 1; version <= newVersion; version++) {
                    this.apply_db_upgrade(db, version)
                }

                resolve(db)
            }
        })

        return db_promise
    }
}

class CheckCache {
    slopdb: SlopDB

    constructor(slopdb: SlopDB) {
        this.slopdb = slopdb
    }

    start_transaction(mode: IDBTransactionMode): IDBTransaction {
        const transaction = this.slopdb.db.transaction("checkcache", mode)
        return transaction
    }
}