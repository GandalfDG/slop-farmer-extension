import { API_URL, send_message_to_background } from "./common.js"

let popup_state: PopupState = null

class PopupState {
    logged_in: boolean

    visible_section: string
    page_sections: Map<string, HTMLElement>

    page_elements: Map<string, HTMLElement>

    constructor(logged_in: boolean, page_sections: Map<string, HTMLElement>, visible_section: string, page_elements: Map<string, HTMLElement>) {
        this.logged_in = logged_in
        this.page_sections = page_sections
        this.visible_section = visible_section
        this.setVisibleSection(visible_section)
        this.page_elements = page_elements
    }

    setVisibleSection(section_id: string) {
        this.visible_section = section_id
        this.page_sections.forEach((element, id) => {
            element.style.visibility = id === section_id ? "visible" : "collapse"
        })
    }
}

async function submit_login_form() {

    const login_url = new URL("/login", API_URL)

    const request = new Request(login_url,
        {
            method: "POST",
            body: new FormData(popup_state.page_elements.get("login_form") as HTMLFormElement)
        })

    const response = await fetch(request)

    if (response.ok) {
        const body = await response.json()
        const token = body.access_token

        await send_message_to_background({type: "login", token: token})

        const status_el = document.getElementById("login-status")
        status_el.setAttribute("style", "visibility: visible;")
    }
    else {
        //bad login, update the form
    }
}

async function submit_signup_form() {
    const signup_url = new URL("/signup", API_URL)

    const request = new Request(signup_url, {
        method: "POST",
        body: new FormData(popup_state.page_elements.get("signup_form") as HTMLFormElement)
    })

    const response = await fetch(request)

    console.log(response)
    if (response.ok) {
        
    }
}

function initialize_popup() {
    const login_form = document.getElementById("login-form") as HTMLFormElement
    const login_status = document.getElementById("login-status")
    const signup_form = document.getElementById("signup-form") as HTMLFormElement

    const signup_section = document.getElementById("signup")
    const login_section = document.getElementById("login")
    const report_section = document.getElementById("report")

    const signup_button = document.getElementById("signup-select") as HTMLButtonElement
    const login_button = document.getElementById("login-select") as HTMLButtonElement

    const page_sections = new Map()
    page_sections.set("signup", signup_section)
    page_sections.set("login", login_section)
    page_sections.set("report", report_section)

    const page_elements = new Map()
    page_elements.set("login_form", login_form as HTMLElement)
    page_elements.set("login_status", login_status)
    page_elements.set("signup_form", signup_form as HTMLElement)

    popup_state = new PopupState(false, page_sections, "signup", page_elements)

    login_form.addEventListener("submit", (event) => { event.preventDefault(); submit_login_form() })
    signup_form.addEventListener("submit", (event) => { event.preventDefault(); submit_signup_form() })

    signup_button.addEventListener("click", (event) => {popup_state.setVisibleSection("signup")})
    login_button.addEventListener("click", (event) => {popup_state.setVisibleSection("login")})
}

addEventListener("DOMContentLoaded", (event) => {
    initialize_popup()
})