import { SlopDB } from "../scripts/indexed-db.js"
import { deleteDB } from "../scripts/idb/index.js"

describe("sanity check", () => {
    it("works", () => {
        expect(true).toBeTrue()
    })
})

describe("SlopDB Version 1", () => {

    beforeEach(async () => {
        await deleteDB("SlopDB")
    })

    it("creates a version 1 indexeddb", async () => {
        const slopdb_v1 = new SlopDB(1)


    })
})