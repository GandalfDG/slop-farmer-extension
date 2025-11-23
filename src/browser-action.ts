import { getTextOfJSDocComment } from "../node_modules/typescript/lib/typescript.js"
import { API_URL, send_message_to_background } from "./common.js"

let popup_state: PopupState = null

class PopupState {
    logged_in: boolean

    visible_section: string
    page_sections: Map<string, HTMLElement>

    page_elements: Map<string, HTMLElement>

    visible_logged_in: Array<HTMLElement>
    visible_logged_out: Array<HTMLElement>

    constructor(logged_in: boolean, page_sections: Map<string, HTMLElement>, visible_section: string, page_elements: Map<string, HTMLElement>, visible_logged_in: Array<HTMLElement>, visible_logged_out: Array<HTMLElement>) {
        this.logged_in = logged_in
        this.page_sections = page_sections
        this.visible_section = visible_section
        this.page_elements = page_elements

        this.visible_logged_in = visible_logged_in
        this.visible_logged_out = visible_logged_out
    }

    update_login_visibility() {
        this.visible_logged_in.forEach((element) => {
            element.style.display = this.logged_in ? "block" : "none"
        })
        this.visible_logged_out.forEach((element) => {
            element.style.display = this.logged_in ? "none" : "block"
        })
    }

    set_visible_section(section_id: string) {
        this.visible_section = section_id
        switch (section_id) {
            case "signup":
                this.page_elements.get("signup_button").setAttribute("class", "is-active")
                this.page_elements.get("login_button").setAttribute("class", "")
                break
            case "login":
                this.page_elements.get("login_button").setAttribute("class", "is-active")
                this.page_elements.get("signup_button").setAttribute("class", "")
                break
        }
        this.page_sections.forEach((element, id) => {
            element.style.display = id === section_id ? "block" : "none"
        })

        this.update_login_visibility()
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

        popup_state.logged_in = true

        popup_state.set_visible_section("report")
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
        popup_state.page_elements.get("signup_status").textContent = "check your email for a verification link from slopfarmer@jack-case.pro. It may be in your spam folder."
    }
}

async function logout() {
    const response = await send_message_to_background({type: "logout"})
    popup_state.logged_in = false
    popup_state.set_visible_section("login")
}

async function check_login(): Promise<boolean> {
    const response = await send_message_to_background({type: "islogged"})
    return response.logged_in
}


async function initialize_popup() {
    const login_form = document.getElementById("login-form") as HTMLFormElement
    const login_status = document.getElementById("login-status")
    const signup_form = document.getElementById("signup-form") as HTMLFormElement

    const signup_section = document.getElementById("signup")
    const login_section = document.getElementById("login")
    const report_section = document.getElementById("report")

    const signup_button = document.getElementById("signup-tab")
    const signup_status = signup_section.querySelector("h2")
    const login_button = document.getElementById("login-tab")
    const report_button = document.getElementById("report-button") as HTMLButtonElement
    const report_status = report_section.querySelector("h2")
    const logout_button = document.getElementById("logout-button")

    const page_sections = new Map()
    page_sections.set("signup", signup_section)
    page_sections.set("login", login_section)
    page_sections.set("report", report_section)

    const page_elements = new Map()
    page_elements.set("login_form", login_form as HTMLElement)
    page_elements.set("login_status", login_status)
    page_elements.set("signup_form", signup_form as HTMLElement)
    page_elements.set("signup_status", signup_status)
    page_elements.set("report_button", report_button)
    page_elements.set("report_status", report_status)
    page_elements.set("signup_button", signup_button)
    page_elements.set("login_button", login_button)

    const logged_in_items = Array.from(document.querySelectorAll(".logged-in")) as Array<HTMLElement>
    const logged_out_items = Array.from(document.querySelectorAll(".not-logged-in")) as Array<HTMLElement>

    const logged_in = await check_login()

    popup_state = new PopupState(logged_in, page_sections, "signup", page_elements, logged_in_items, logged_out_items)
    popup_state.set_visible_section(logged_in ? "report" : "signup")

    login_form.addEventListener("submit", (event) => { event.preventDefault(); submit_login_form() })
    signup_form.addEventListener("submit", (event) => { event.preventDefault(); submit_signup_form() })

    signup_button.addEventListener("click", (event) => {popup_state.set_visible_section("signup")})
    login_button.addEventListener("click", (event) => {popup_state.set_visible_section("login")})
    report_button.addEventListener("click", async (event) => {
        const result = await send_message_to_background({type: "report"})
        popup_state.page_elements.get("report_status").textContent = "report accepted"
        setTimeout(() => { window.close() }, 1000)
    })
    logout_button.addEventListener("click", async (event) => {
        logout()
    })
}

addEventListener("DOMContentLoaded", (event) => {
    initialize_popup()
})