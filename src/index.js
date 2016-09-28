import axios from "axios"
import babelPolyfill from "babel-polyfill"
import humps from "humps"

class KisiError extends Error {
    constructor(status, code = "000000", reason = null) {
        super("An error occurred interacting with the Kisi API.")

        this.status = status
        this.code = code
        this.reason = reason
    }
}

class Kisi {
    constructor(config = {}) {
        config = Object.assign(config, {
            baseURL: "https://api.getkisi.com/",
            timeout: 5000,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        })

        this.client = axios.create(config)

        this.addDecamelizationRequestInterceptor()
        this.addCamelizationResponseInterceptor()
        this.addPaginationResponseInterceptor()
    }

    addDecamelizationRequestInterceptor() {
        this
            .client
            .interceptors
            .request
            .use(config => {
                config.data = humps.decamelizeKeys(config.data)
                config.params = humps.decamelizeKeys(config.params)

                return config
            })
    }

    addCamelizationResponseInterceptor() {
        this
            .client
            .interceptors
            .response
            .use(response => {
                response.data = humps.camelizeKeys(response.data)

                return response
            })
    }

    addPaginationResponseInterceptor() {
        this
            .client
            .interceptors
            .response
            .use(response => {
                const headers = response.headers
                const collectionRange = headers["x-collection-range"]

                if (collectionRange !== undefined) {
                    const rangeAndCount = collectionRange.split('/')

                    if (rangeAndCount[0] === "*") {
                        response.data = {
                            pagination: {
                                offset: 0,
                                limit: 0
                            },
                            data: response.data
                        }

                        return response
                    }

                    const rangeStartAndEnd = rangeAndCount[0].split('-')
                    const collectionStart = Number(rangeStartAndEnd[0])
                    const collectionEnd = Number(rangeStartAndEnd[1])
                    const collectionLimit = Number(collectionEnd - collectionStart + 1)

                    response.data = {
                        pagination: {
                            offset: collectionStart,
                            limit: collectionLimit
                        },
                        data: response.data
                    }
                }

                return response
            })
    }

    setLoginSecret(secret) {
        this
            .client
            .defaults
            .headers
            .common["X-Login-Secret"] = secret
    }

    async signUp(email, password) {
        this.setLoginSecret(null)

        try {
            const response = await this.post(`users`, { user: { email, password, termsAndConditions: true } })

            return response
        } catch (error) {
            return this.handleError(error)
        }
    }

    async signIn(email, password) {
        this.setLoginSecret(null)

        try {
            const response = await this.post(`logins`, { login: { type: "device" }, user: { email, password } })

            this.setLoginSecret(response.secret)

            return response
        } catch (error) {
            return this.handleError(error)
        }
    }

    async signOut() {
        try {
            const response = await this.delete(`login`)

            this.setLoginSecret(null)

            return response
        } catch (error) {
            return this.handleError(error)
        }
    }

    async get(path, params = {}) {
        try {
            const response = await this
                .client
                .get(path, { params })

            return response.data
        } catch (error) {
            return this.handleError(error)
        }
    }

    async post(path, data = {}) {
        try {
            const response = await this
                .client
                .post(path, data)

            return response.data
        } catch (error) {
            return this.handleError(error)
        }
    }

    async put(path, data = {}) {
        try {
            const response = await this
                .client
                .put(path, data)

            return response.data
        } catch (error) {
            return this.handleError(error)
        }
    }

    async delete(path, params = {}) {
        try {
            const response = await this
                .client
                .delete(path, { params })

            return response.data
        } catch (error) {
            return this.handleError(error)
        }
    }

    handleError(error) {
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
}

export default Kisi
