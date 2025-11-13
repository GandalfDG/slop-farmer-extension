import { API_URL, send_message_to_background } from "./common.js"

const login_form = document.getElementById("login-form") as HTMLFormElement
const login_status = document.getElementById("login-status")

const signup_form = document.getElementById("signup-form") as HTMLFormElement

class PopupState {
    logged_in: boolean

    visible_section: string
    page_sections: Map<string, HTMLElement>

    constructor(logged_in: boolean, page_sections: Map<string, HTMLElement>, visible_section: string) {
        this.logged_in = logged_in
        this.page_sections = page_sections
        this.visible_section = visible_section
    }

    setVisibleSection(section_id: string) {
        this.visible_section = section_id
        this.page_sections.forEach((element, id) => {
            element.style.visibility = id === section_id ? "visible" : "collapse"
        })
    }
}

if (localStorage.getItem("accessToken")) {
    login_status.setAttribute("style", "visibility: visible;")
}

login_form.addEventListener("submit", (event) => { event.preventDefault(); submit_login_form() })

signup_form.addEventListener("submit", (event) => { event.preventDefault(); submit_signup_form() })

async function submit_login_form() {

    const login_url = new URL("/login", API_URL)

    const request = new Request(login_url,
        {
            method: "POST",
            body: new FormData(login_form)
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
        body: new FormData(signup_form)
    })

    const response = await fetch(request)

    console.log(response)
    if (response.ok) {
        
    }
}