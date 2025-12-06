class SlopDB {
    db: IDBDatabase

    constructor(idb_version: number) {

    }

    async open_database(idb_version: number): Promise<IDBDatabase> {
        const db_promise = new Promise<IDBDatabase>((resolve, reject) => {
            const db_request = window.indexedDB.open("SlopDB", idb_version)

            db_request.onerror = (event) => {
                reject(db_request.error)
            }

            db_request.onsuccess = (event) => {
                resolve(db_request.result)
            }

            db_request.onupgradeneeded
        })

        return db_promise
    }
}