import { SlopDB, CheckCache } from "../scripts/indexed-db.js"
import { openDB, deleteDB } from "../scripts/idb/index.js"

const MAX_TIMESTAMP_DIFFERENCE = 3

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

        let slopdb

        beforeEach(async () => {
            slopdb = new SlopDB(2)
            await slopdb.db_opened()
            db = slopdb.db
        })

        it("creates a version 2 indexeddb", async () => {

            const object_stores = slopdb.db.objectStoreNames
            expect(object_stores).toContain("slop")
            expect(object_stores).toContain("checkcache")

            // slopdb_v2.db.close()
        })

        it("caches a checked url", async () => {
            const cache = slopdb.get_check_cache()
            expect(cache).toBeInstanceOf(CheckCache)

            const slop_url = new URL("https://sloppy-slop.com/sloparticle")

            await cache.store(slop_url.toString())
            const store_time = Date.now()
            const cached_item = await cache.get(slop_url.toString())

            expect(cached_item.url).toEqual(slop_url.toString())
            expect(cached_item.check_timestamp).toBeLessThanOrEqual(store_time)
            expect(cached_item.check_timestamp).toBeGreaterThan(store_time - MAX_TIMESTAMP_DIFFERENCE)
        })

        it("updates a cached url's timestamp when it is accessed")
    })


})
