import { API_URL } from "./common.js"
let access_token: string

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
        console.log(event)
    }

    db_request.onsuccess = (event) => {
        // create objectstore
        console.log(event)
        //@ts-ignore
        db = event.target.result
    }

    db_request.onupgradeneeded = (event) => {
        console.log(event)
        //@ts-ignore
        db = event.target.result
        const slop_store = db.createObjectStore("slop", { keyPath: "domain" })
    }
}

function on_install_handler() {
    setup_storage_db()
}

async function get_slop_store(readwrite: boolean) {

    const slop_store_promise: Promise<IDBObjectStore> = new Promise((resolve, reject) => {
        const db_request = window.indexedDB.open("SlopDB", 1)

        db_request.onsuccess = (event) => {
            //@ts-ignore
            const db = event.target.result
            const transaction = db.transaction(["slop"], readwrite ? "readwrite" : undefined)
            const slop_store = transaction.objectStore("slop")
            resolve(slop_store)
        }
        db_request.onerror = (event) => {
            reject(event)
        }
    })

    return await slop_store_promise
}

async function insert_slop(domain: string, path: string, report: boolean = true) {
    let db
    const db_request = window.indexedDB.open("SlopDB", 1)

    db_request.onsuccess = (event) => {
        //@ts-ignore
        db = event.target.result
        const transaction = db.transaction(["slop"], "readwrite")
        const slop_store = transaction.objectStore("slop")

        // is this domain already stored?
        const request = slop_store.get(domain)
        request.onsuccess = () => {
            let result = request.result
            if (result) {
                // domain exists, add this path
                result.paths.add(path)
            }

            else {
                // create a new domain object
                const paths_set = new Set()
                paths_set.add(path)
                result = { domain: domain, paths: paths_set }
            }

            // persist to indexeddb
            const store_request = slop_store.put(result)
            store_request.onsuccess = () => {
                console.log(domain, path, "stored")
            }
        }
    }

    if (report) {
        const report_url = new URL("/report", API_URL)
        const request = new Request(report_url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Bearer": get_access_token()
                },
                body: JSON.stringify({ slop_urls: [new URL(path, "http://" + domain).toString()] })
            })
        fetch(request)
    }
}

async function check_local_slop(url: string) {
    const slop_url = new URL(url)
    const slop_store = await get_slop_store(false)
    const known_slop: Promise<any> = new Promise((resolve, reject) => {
        const request = slop_store.get(slop_url.hostname)
        request.onsuccess = (event) => {
            resolve(request.result)
        }
        request.onerror = (event) => {
            reject(event)
        }
    })

    const slop_object = await known_slop
    let result = { slop_domain: false, slop_path: false }
    if (slop_object) {
        // domain was found
        result.slop_domain = true
        if (slop_object.paths.has(slop_url.pathname)) {
            // specific page was found
            result.slop_path = true
        }
    }

    return result
}

async function check_remote_slop(urls: string[]) {
    const check_url = new URL("/check", API_URL)
    const request = new Request(check_url, { method: "POST", headers: { "Content-Type": "application/json", "Bearer": get_access_token() }, body: JSON.stringify({ slop_urls: urls }) })
    const response = await fetch(request)
    let domain_objects = await response.json()
    domain_objects.forEach((domain: any) => { insert_slop(domain.domain_name, "/", false) })
    return domain_objects
}

async function on_button_clicked_handler(tab: any) {
    // insert the current tab's page into slop storage
    const tab_url = new URL(tab.url)

    const domain = tab_url.hostname
    const path = tab_url.pathname

    await insert_slop(domain, path)

    // @ts-ignore
    update_page_action_icon({ frameId: 0, tabId: tab.id, url: tab.url })
}

async function update_page_action_icon(details: browser.webNavigation._OnCommittedDetails) {
    if (details.frameId != 0) {
        return
    }
    const is_slop = await check_local_slop(details.url)
    if (is_slop.slop_path) {
        browser.pageAction.setIcon({
            path: "icons/virus_red.png",
            tabId: details.tabId
        })
    }
    else if (is_slop.slop_domain) {
        browser.pageAction.setIcon({
            path: "icons/virus_yellow.png",
            tabId: details.tabId
        })
    }
    else {
        browser.pageAction.setIcon({
            path: "icons/virus-slash.png",
            tabId: details.tabId
        })
    }
    console.log(is_slop)
}

function message_listener(message: any, sender: any, send_response: Function): Promise<any> {
    const sender_tab = sender.tab ? sender.tab : undefined
    const tabid = sender_tab ? sender_tab.id : undefined
    switch (message.type) {

        case "check":
            let check_promises = new Array()
            let not_found_local = new Array()

            message.urls.forEach((url: string) => {
                check_promises.push(check_local_slop(url).then(async (result) => {
                    if (result.slop_domain) {
                        browser.tabs.sendMessage(tabid, { type: "check_result", url: url, result: result })
                    }
                    else {
                        not_found_local.push(url)
                    }
                }))
            })

            const result = Promise.all(check_promises).then(() => {
                let remote_slop = check_remote_slop(not_found_local)
                remote_slop.then((remote_results) => {
                    remote_results.forEach((result: any) => {
                        browser.tabs.sendMessage(tabid, { type: "check_result", domain: result.domain_name, result: result })
                    })
                })

            })

            return result
            break
        
        case "login":
            localStorage.setItem("accessToken", message.token)
            return new Promise((resolve, reject) => { resolve(true) })
            break

        case "islogged":
            const token = get_access_token()
            const response = { logged_in: token != null ? true : false }
            return new Promise((resolve, reject) => { resolve(response) })
            break

        case "logout":
            localStorage.removeItem("accessToken")
            return new Promise((resolve, reject) => { resolve(true) })
            break

        case "report":
            return new Promise((resolve, reject) => {
                browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                    const tab_url = new URL(tabs[0].url)
                    insert_slop(tab_url.hostname, tab_url.pathname, true).then(() => resolve(true))
                })
            })
            break
    }
}

function get_access_token() {
    access_token = localStorage.getItem("accessToken")
    if (!access_token) {
        // get an access token from the API
    }
    return access_token
}


browser.runtime.onInstalled.addListener(on_install_handler)
browser.runtime.onStartup.addListener(get_access_token)
browser.webNavigation.onCommitted.addListener(update_page_action_icon)
browser.runtime.onMessage.addListener(message_listener)
