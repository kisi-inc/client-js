import qs from "qs"
import handleError from "./errors"

class Query {
    constructor(client, endpoint) {
        this.client = client
        this.endpoint = endpoint

        this.queryParams = {}
        this.paginationParams = {}
    }

    where(queryParams = {}) {
        const clonedQuery = Object.assign(new Query(), this)
        clonedQuery.queryParams = queryParams

        return clonedQuery
    }

    paginate(paginationParams = {}) {
        const clonedQuery = Object.assign(new Query(), this)
        clonedQuery.paginationParams = paginationParams

        return clonedQuery
    }

    async fetch() {
        try {
            const response = await this
                .client
                .get(this.endpoint, {params: Object.assign({}, this.queryParams, this.paginationParams)})

            return response.data
        } catch (error) {
            return handleError(error)
        }
    }

    async find(id) {
        try {
            const response = await this
                .client
                .get(this.endpoint+"/"+id)

            return response.data
        } catch (error) {
            return handleError(error)
        }
    }

    toString() {
        const endpointUrl = this.client.defaults.baseURL + this.endpoint
        const queryParams = qs.stringify(Object.assign({}, this.queryParams, this.paginationParams))

        return queryParams ? endpointUrl +'?'+ queryParams : endpointUrl
    }
}

export default Query