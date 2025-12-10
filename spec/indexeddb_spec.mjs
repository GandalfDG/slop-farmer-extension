import { SlopDB } from "../scripts/indexed-db.mjs"

describe("sanity check", () => {
    it("works", () => {
        expect(true).toBeTrue()
    })
})

describe("SlopDB Version 1", () => {

    beforeEach(async () => {
        const request = window.indexedDB.deleteDatabase("SlopDB")
        const deletePromise = new Promise((resolve, reject) => {
            request.onsuccess = () => {resolve()}
            request.onerror = (err) => {
                reject(err)
            }
        })
        return deletePromise       
    })

    it("creates a version 1 indexeddb", async () => {
        const slopdb_v1 = new SlopDB(1)
        await slopdb_v1.db_opened()
        expect(slopdb_v1.db).toBeDefined()

        const transaction = slopdb_v1.start_transaction("slop", "readonly")
        expect(transaction).toBeDefined()

        try {
            const bad_transaction = slopdb_v1.start_transaction("checkcache", "readonly")
        } catch (error) {
            expect(error.name).toBe("NotFoundError")
        }
    })
})