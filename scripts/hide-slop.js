function check_links(links) {
    // send a message to background script with a list of URLs to check
    browser.runtime.sendMessage({type: "check", urls: links})
}

async function message_listener(message) {
    if(message.type === "check_result") {
        console.log(message.url, message.result)
    }
}

function onload_handler() {
    //get links
    const links = document.querySelectorAll("a[data-testid=\"result-title-a\"")
    let link_targets = new Array()
    links.forEach((node) => {
        link_targets.push(node.getAttribute("href"))
    })
    console.log(link_targets)
    check_links(link_targets)
}

browser.runtime.onMessage.addListener(message_listener)
addEventListener("DOMContentLoaded", onload_handler)