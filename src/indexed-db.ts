import { openDB, IDBPDatabase } from "idb/index.js"

export class IDBCursorValueIterator {
    cursor: IDBCursorWithValue

    constructor(cursor: IDBCursorWithValue) {
        this.cursor = cursor
    }

    next(): IteratorResult<any> {
        const key = this.cursor.key
        const value = this.cursor.value
        let done = false

        try {
            this.cursor.continue()
        }
        catch (error) {
            if (error.name === "InvalidStateError") {
                done = true
            }
            else {
                throw error
            }
        }
        finally {
            return { value: {key: key, value: value}, done: done }
        }
    }

    [Symbol.iterator]() {
        return this
    }

}

export class CheckCache {
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

    async store(url: string) {
        const cache_store = this.slopdb.db.transaction(CheckCache.cache_objectstore_name, "readwrite").objectStore(CheckCache.cache_objectstore_name)
        await cache_store.add(this.cache_item_factory(new URL(url)))
    }

    get(url: URL) {
        return url
    }

    // async evict_least_recently_checked(count: number) {
    //     const transaction = this.slopdb.start_transaction(CheckCache.cache_objectstore_name, "readwrite")
    //     const cache_objectstore = transaction.objectStore(CheckCache.cache_objectstore_name)

    //     const cursor_result_promise = new Promise<Iterable<any>>((resolve, reject) => {
    //         const cache_cursor_request = cache_objectstore.openCursor()

    //         cache_cursor_request.onerror = (error) => {
    //             reject(error)
    //         }

    //         cache_cursor_request.onsuccess = (event) => {
    //             const cursor = cache_cursor_request.result
    //             resolve(new IDBCursorValueIterator(cursor))
    //         }
    //     })

    //     const cursor = await cursor_result_promise

    //     const key_array = Array.from(cursor)
    //     key_array.sort((a, b) => {
    //         const a_datetime = a.check_timestamp
    //         const b_datetime = b.check_timestamp

    //         return a_datetime.getTime - b_datetime.getTime
    //     })


    // }
}

export class SlopDB {
    version: number
    open_promise: Promise<IDBPDatabase>
    db: IDBPDatabase

    static apply_db_upgrade(db: IDBPDatabase, idb_version: number) {
        switch (idb_version) {
            case 1: 
                db.createObjectStore("slop", { keyPath: "domain" })
                break
            case 2:
                db.createObjectStore("checkcache", { keyPath: "domain" })
                break
        }
    }

    constructor(idb_version: number) {
        this.version = idb_version
        this.open_promise = openDB("SlopDB", idb_version, {
            upgrade(db, oldVersion, newVersion, transaction, event) {
                for (let version = oldVersion + 1; version <= newVersion; version++) {
                    SlopDB.apply_db_upgrade(db, version)
                }
            },
            blocked(curVer, bloVer, event) {
                console.error("IDB Open blocked on " + curVer + " blocking ver " + bloVer)
            },
            blocking(curVer, bloVer, event) {
                console.error("IDB Open blocking " + curVer + " blocked ver " + bloVer)
            }
        })
    }

    async db_opened() {
        this.db = await this.open_promise
    }

    get_check_cache() {
        return new CheckCache(this, 256)
    }
}

