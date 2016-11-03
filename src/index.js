import axios from "axios"
import babelPolyfill from "babel-polyfill"
import globalConfig from "./config"
import handleError from "./error_handler"
import humps from "humps"
import Query from "./query"

class Kisi {
    constructor(config = {}) {
        config = Object.assign({}, globalConfig.axiosDefaultConfig, config)

        this.client = axios.create(config)

        this.addDecamelizationRequestInterceptor()
        this.addCamelizationResponseInterceptor()
        this.addPaginationResponseInterceptor()

        for (let collection of globalConfig.supportedEndpoints){
            this[collection] = new Query(this.client, collection)
        }
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
            return handleError(error)
        }
    }

    async signIn(email, password) {
        this.setLoginSecret(null)

        try {
            const response = await this.post(`logins`, { login: { type: "device" }, user: { email, password } })

            this.setLoginSecret(response.secret)

            return response
        } catch (error) {
            return handleError(error)
        }
    }

    async signOut() {
        try {
            const response = await this.delete(`login`)

            this.setLoginSecret(null)

            return response
        } catch (error) {
            return handleError(error)
        }
    }

    async get(path, params = {}) {
        try {
            const response = await this
                .client
                .get(path, { params })

            return response.data
        } catch (error) {
            return handleError(error)
        }
    }

    async post(path, data = {}) {
        try {
            const response = await this
                .client
                .post(path, data)

            return response.data
        } catch (error) {
            return handleError(error)
        }
    }

    async put(path, data = {}) {
        try {
            const response = await this
                .client
                .put(path, data)

            return response.data
        } catch (error) {
            return handleError(error)
        }
    }

    async delete(path, params = {}) {
        try {
            const response = await this
                .client
                .delete(path, { params })

            return response.data
        } catch (error) {
            return handleError(error)
        }
    }
}

export default Kisi
