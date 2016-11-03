import KisiError from "./errors"

function handleError(error) {
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

export default handleError