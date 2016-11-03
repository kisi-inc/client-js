class KisiError extends Error {
    constructor(status, code = "000000", reason = null) {
        super("An error occurred interacting with the Kisi API.")

        this.status = status
        this.code = code
        this.reason = reason
    }
}

export default KisiError