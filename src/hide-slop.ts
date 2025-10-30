class SearchLink {

    node: Element
    target: string
    url: URL
    checked: boolean
    result: any

    constructor(link_node: Element) {
        this.node = link_node
        this.target = link_node.getAttribute("href")
        this.url = new URL(link_node.getAttribute("href"))
        this.checked = false
        this.result = undefined
    }
}

class ResultLinks extends Map {
    // map domains to paths and their associated nodes
    setLink(domain: string, path: string, search_link: SearchLink) {
        if(!super.get(domain)) {
            const nested_map = new Map()
            nested_map.set(path, search_link)
            super.set(domain, nested_map)
        } else {
            super.get(domain).set(path, search_link)
        }
    }

    setNode(link_node: Element) {
        const search_link = new SearchLink(link_node)
        this.setLink(search_link.url.hostname, search_link.url.pathname, search_link)
    }
    
    get(domain: string, path: string = "/") {
        return super.get(domain).get(path)
    }

    getDomain(domain: string) {
        return super.get(domain)
    }

    getUrl(url: string) {
        const urlobj = new URL(url)
        return this.get(urlobj.hostname, urlobj.pathname)
    }

    getSearchLinks() {
        // return an iterator over the nested SearchLink objects
        const domain_value_iterator = super.values() as Iterator<Map<string, SearchLink>>
        let search_link_iterator: Iterator<SearchLink>

        // didn't realize flatMap was brand new this year
        // @ts-ignore
        search_link_iterator = domain_value_iterator.flatMap((domain_map: Map<string, SearchLink>) => {
            return domain_map.values()
        })

        return search_link_iterator
    }
}


const ddg_result_selector = "a[data-testid=\"result-title-a\""
const ddg_result_list_selector = "ol.react-results--main"

let result_list_node: Element
let result_list_observer
const page_links = new ResultLinks()


function check_links(search_links: SearchLink[]) {
    // send a message to background script with a list of URLs to check
    const urls = search_links.map((search_link: SearchLink) => {
        search_link.checked = true
        return search_link.target
    })
    browser.runtime.sendMessage({type: "check", urls: urls})
}

async function backend_message_listener(message: any) {
    // handle slop reports returned from the background script
    if(message.type === "check_result") {
        if (message.domain) {
            const paths = page_links.getDomain(message.domain)
            paths.forEach((search_link: SearchLink) => {
                search_link.node.setAttribute("style", "color: red;")
                search_link.result = message.result
            })
        } else if (message.url) {
            const link = page_links.getUrl(message.url)
            link.node.setAttribute("style", "color: red;")
            link.result = message.result
        }

        
    }
}

function get_initial_links() {
    // get links from initial page load
    const links = document.querySelectorAll(ddg_result_selector)
    links.forEach((node) => {
        page_links.setNode(node)
    })
    const link_targets = page_links.getSearchLinks()
    // @ts-ignore
    check_links(link_targets.toArray())
}

function update_links() {
    // the result list has updated, add new links and check them
    const links = document.querySelectorAll(ddg_result_selector)
    links.forEach((node) => {
        page_links.setNode(node)
    })
    // @ts-ignore
    const link_iter = page_links.getSearchLinks().filter((search_link: SearchLink) => {
        return !(search_link.checked)
    })

    check_links(link_iter)
}

function setup_result_observer() {
    // observe changes in the result list to respond to newly loaded results
    const config = { childList: true }
    result_list_observer = new MutationObserver(update_links)
    result_list_observer.observe(result_list_node, config)
}

async function wait_for_results() {
    let results: Promise<Element> = new Promise(async (resolve) => {
        let node = document.querySelector(ddg_result_list_selector)
        while (!node) {
            await new Promise<void>((resolve) => {setTimeout(()=>{resolve()}, 100)})
            node = document.querySelector(ddg_result_list_selector)
        }
        resolve(node)
    })

    return results
}

async function onload_handler() {


    // get results ol node to observe
    result_list_node = await wait_for_results()

    get_initial_links()
    setup_result_observer()
}

// listen for messages from the background script
browser.runtime.onMessage.addListener(backend_message_listener)

// initialize state on document load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onload_handler)
} else {
    wait_for_results().then(onload_handler)
}
