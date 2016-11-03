export class KisiError extends Error {
    constructor(status, code = "000000", reason = null) {
        super("An error occurred interacting with the Kisi API.")

        this.status = status
        this.code = code
        this.reason = reason
    }
}

export function handleError(error) {
    if (error.response) {
        const response = error.response

        const status = response.status
        const data = response.data

        if (data) {
            const code = data.code || "000000"
            const reason = data.error || data.errors || code

            throw (new KisiError(status, code, reason))
        } else {
            throw (new KisiError(status))
        }
    } else {
        throw (error)
    }
}