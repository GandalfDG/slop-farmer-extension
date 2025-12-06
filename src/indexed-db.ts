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

    start_transaction(storeNames: string | Array<string>, mode: IDBTransactionMode, options: IDBTransactionOptions = undefined): IDBTransaction {
        return this.db.transaction(storeNames, mode, options)
    }
}

class CheckCache {
    slopdb: SlopDB
    cache_capacity: number
    static cache_objectstore_name = "checkcache"

    constructor(slopdb: SlopDB, max_entries: number) {
        this.slopdb = slopdb
        this.cache_capacity = max_entries
    }

    cache_item_factory(url: URL) {
        return {
            url: url,
            check_timestamp: Date.now()
        }
    }

    async evict_least_recently_checked(count: number) {
        const transaction = this.slopdb.start_transaction(CheckCache.cache_objectstore_name, "readwrite")
        const cache_objectstore = transaction.objectStore(CheckCache.cache_objectstore_name)

        const cursor_result_promise = new Promise((resolve, reject) => {
            const cache_cursor_request = cache_objectstore.openCursor()

            cache_cursor_request.onerror = (error) => {
                reject(error)
            }

            cache_cursor_request.onsuccess = (event) => {
                
            }
        })
        
    }
}