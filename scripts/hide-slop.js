function check_links(links) {
    // send a message to background script with a list of URLs to check
    browser.runtime.sendMessage({type: "check", urls: links})
}

async function message_listener(message) {
    if(message.type === "check_result") {
        console.log(message.url, message.result)
    }
}

browser.runtime.onMessage.addListener(message_listener)