

describe("IndexedDB Abstractions", function () {

    beforeAll(async function () {
        try {
            const mod = await import("../scripts/indexed-db.js")
            SlopDB = mod.SlopDB
        } catch (err) {
            it("works?", function () {
                fail(err)
            })
        }
    })

    it("lol", function() {
        expect(false).toBeTrue()
    })


})