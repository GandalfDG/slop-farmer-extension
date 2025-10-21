const ddg_result_selector = "a[data-testid=\"result-title-a\""
const ddg_result_list_selector = "ol.react-results--main"

let result_list_node
let result_list_observer
const page_links = new Map()

function check_links(links) {
    // send a message to background script with a list of URLs to check
    browser.runtime.sendMessage({type: "check", urls: links})
}

async function message_listener(message) {
    if(message.type === "check_result") {
        console.log(message.url, message.result)
        page_links.set(message.url, message.result)
    }
}

function get_initial_links() {
    //get links
    const links = document.querySelectorAll(ddg_result_selector)
    links.forEach((node) => {
        page_links.set(node.getAttribute("href"), undefined)
    })
    console.log(link_targets)
    check_links(page_links.keys())
}

function update_links() {
    // the result list has updated, add new links and check them
}

function setup_result_observer() {
    const config = { childList: true }
    result_list_observer = new MutationObserver(update_links)
    result_list_observer.observe(result_list_node, config)
}

function onload_handler() {
    // get results ol node
    result_list_node = document.querySelector(ddg_result_list_selector)

    setup_result_observer()

    get_initial_links()
}

browser.runtime.onMessage.addListener(message_listener)

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onload_handler)
} else {
    onload_handler()
}
