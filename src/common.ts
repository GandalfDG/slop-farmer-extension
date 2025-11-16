export const API_URL: string = "https://api.slopfarmer.jack-case.pro"

export async function send_message_to_background(message: any): Promise<any> {
    const response = browser.runtime.sendMessage(message)
    return response
}
