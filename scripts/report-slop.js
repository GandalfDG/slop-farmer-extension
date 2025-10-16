function setup_storage_db() {
    /* create indexeddb object store to retain objects in the form of
     * {"domain": "domain.tld",
     *  "paths": [
     *      "page/1",
     *      "page/2"  
     *  ]
     * }
     */  
    let db
    const db_request = window.indexedDB.open("SlopDB", 1)

    db_request.onerror = (event) => {
        // handle error
    }

    db_request.onsuccess = (event) => {
        // create objectstore
        db = event.target.result
    }

    db_request.onupgradeneeded = (event) => {
        db = event.target.result
        const slop_store = db.createObjectStore("slop", {keyPath: "domain"})
    }
}

function on_install_handler() {
    setup_storage_db()
}

function insert_slop(domain, path) {
    let db
    const db_request = window.indexedDB.open("SlopDB", 1)

    db_request.onsuccess = (event) => {
        db = event.target.result
        const transaction = db.transaction(["slop"], "readwrite")
        const slop_store = transaction.objectStore("slop")

        // is this domain already stored?
        const request = slop_store.get(domain)
        request.onsuccess = (event) => {
            let result = request.result
            if (result) {
                // domain exists, add this path
                result.paths.add(path)
            }
            
            else {
                // create a new domain object
                const paths_set = new Set()
                paths_set.add(path)
                result = {domain: domain, paths: paths_set}
            }

            // persist to indexeddb
            const store_request = slop_store.put(result)
            store_request.onsuccess = (event) => {
                console.log(domain, path, "stored")
            }
        }
    }
}

async function on_button_clicked_handler() {
    // insert the current tab's page into slop storage
    const current_tab = await browser.tabs.query({active: true})[0]
    const tab_url = new URL(current_tab.tab)

    const domain = tab_url.hostname
    const path = tab_url.pathname

    insert_slop(domain, path)
}

browser.runtime.onInstalled.addListener(on_install_handler)
browser.browserAction.onClicked.addListener(on_button_clicked_handler)
