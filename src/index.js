import axios from "axios"
import babelPolyfill from "babel-polyfill"
import humps from "humps"

class Kisi {
    constructor(config = {}) {
        config = Object.assign(config, {
            baseURL: `https://api.getkisi.com/`,
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
                config.body = humps.decamelizeKeys(config.body)
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
                    const rangeAndCount = collectionRange.split('/');
                    const rangeStartAndEnd = rangeAndCount[0].split('-');
                    const collectionStart = Number(rangeStartAndEnd[0]);
                    const collectionEnd = Number(rangeStartAndEnd[1]);
                    const collectionLimit = Number(collectionEnd - collectionStart + 1);

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
            return await this.post(`users`, { user: { email, password } })
        } catch (error) {
            return this.handleError(error)
        }
    }

    async signIn(email, password) {
        this.setLoginSecret(null)

        try {
            const response = await this.post(`logins`, { login: { type: "device" }, user: { email, password } })

            this.setLoginSecret(response.secret)
        } catch (error) {
            return this.handleError(error)
        }
    }

    async signOut() {
        try {
            await this.delete(`login`)

            this.setLoginSecret(null)

            return true
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
            await this
                .client
                .put(path, data)

            return true
        } catch (error) {
            return this.handleError(error)
        }
    }

    async delete(path) {
        try {
            const response = await this
                .client
                .delete(path)

            return true
        } catch (error) {
            return this.handleError(error)
        }
    }

    handleError(error) {
        if (error.response) {
            const response = error.response
            const status = response.status
            const data = response.data
            const code = data.code || "000000"

            if (data.error) {
                throw ({ status, code, error: data.error })
            } else if (data.errors) {
                throw ({ status, code, errors: data.errors })
            } else {
                throw ({ status, code, error: data })
            }
            throw (data)
        } else {
            throw (error)
        }
    }
}

export default Kisi
