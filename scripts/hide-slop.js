const ddg_result_selector = "a[data-testid=\"result-title-a\""
const ddg_result_list_selector = "ol.react-results--main"

let result_list_node
let result_list_observer
const page_links = new Map()

class SearchLink {
    constructor(link_node) {
        this.node = link_node
        this.target = link_node.getAttribute("href")
        this.checked = false
        this.result = undefined
    }
}

function check_links(links) {
    // send a message to background script with a list of URLs to check
    browser.runtime.sendMessage({type: "check", urls: links})
    links.forEach((link) => {page_links.get(link).checked = true})
}

async function message_listener(message) {
    // handle slop reports returned from the background script
    if(message.type === "check_result") {
        console.log(message.url, message.result)
        const link = page_links.get(message.url)
        if ( message.result.slop_domain ) {
            link.node.setAttribute("style", "color: red;")
        }
        link.result = message.result
    }
}

function get_initial_links() {
    // get links from initial page load
    const links = document.querySelectorAll(ddg_result_selector)
    links.forEach((node) => {
        const link = new SearchLink(node)
        page_links.set(link.target, link)
    })
    const link_targets = page_links.keys().toArray()
    check_links(link_targets)
}

function update_links() {
    // the result list has updated, add new links and check them
    const links = document.querySelectorAll(ddg_result_selector)
    links.forEach((node) => {
        const link = new SearchLink(node)
        if (page_links.has(link.target)) return
        page_links.set(link.target, link)
    })
    const link_arr = page_links.keys().filter((key) => {
        return !(page_links.get(key).checked)
    }).toArray()

    check_links(link_arr)
}

function setup_result_observer() {
    // observe changes in the result list to respond to newly loaded results
    const config = { childList: true }
    result_list_observer = new MutationObserver(update_links)
    result_list_observer.observe(result_list_node, config)
}

function onload_handler() {
    // get results ol node to observe
    result_list_node = document.querySelector(ddg_result_list_selector)

    get_initial_links()
    setup_result_observer()
}

// listen for messages from the background script
browser.runtime.onMessage.addListener(message_listener)

// initialize state on document load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onload_handler)
} else {
    onload_handler()
}
