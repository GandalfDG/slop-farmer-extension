import { API_URL } from "common"

const login_form = document.getElementById("login-form") as HTMLFormElement
const login_status = document.getElementById("login-status")
if (localStorage.getItem("accessToken")) {
    login_status.setAttribute("style", "visibility: visible;")
}
login_form.addEventListener("submit", (event) => { event.preventDefault(); submit_login_form() })

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
        localStorage.setItem("accessToken", token)
        const status_el = document.getElementById("login-status")
        status_el.setAttribute("style", "visibility: visible;")
    }
}