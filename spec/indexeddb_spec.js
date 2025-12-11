import { SlopDB } from "../scripts/indexed-db.js"
import { openDB, deleteDB } from "../scripts/idb/index.js"

describe("sanity check", () => {
    it("works", () => {
        expect(true).toBeTrue()
    })
})

describe("SlopDB", () => {

    let db

    beforeEach(async () => {
        await deleteDB("SlopDB")
    })

    afterEach(() => {
        db.close()
    })

    describe("version 1", () => {
        it("creates a version 1 indexeddb", async () => {
            const slopdb_v1 = new SlopDB(1)
            await slopdb_v1.db_opened()
            db = slopdb_v1.db

            const object_stores = slopdb_v1.db.objectStoreNames
            expect(object_stores).toContain("slop")
            expect(object_stores).not.toContain("checkcache")

            // slopdb_v1.db.close()
        })
    })

    describe("version 2", () => {
        it("creates a version 2 indexeddb", async () => {
            const slopdb_v2 = new SlopDB(2)
            await slopdb_v2.db_opened()
            db = slopdb_v2.db

            const object_stores = slopdb_v2.db.objectStoreNames
            expect(object_stores).toContain("slop")
            expect(object_stores).toContain("checkcache")

            // slopdb_v2.db.close()
        })
    })


})
