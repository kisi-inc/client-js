import { assert } from "chai"
import axios from "axios"
import AxiosMockAdapter from "axios-mock-adapter"
import Kisi from "../lib/index"

const kisiClient = new Kisi()

const axiosMockAdapter = new AxiosMockAdapter(kisiClient.client)

describe("sign up, in and out", function () {
    it("should sign up", function (done) {
        axiosMockAdapter
            .onPost(/users$/)
            .reply(200, {
                email: "test@kisi.io"
            }, {})

        kisiClient
            .signUp("test@kisi.io", "test")
            .then((result) => {
                assert.deepEqual(result, { email: "test@kisi.io" })

                done()
            })
            .catch(error => done(error))
    })

    it("should sign in", function (done) {
        axiosMockAdapter
            .onPost(/logins$/)
            .reply(200, {
                secret: "secret",
            }, {})

        kisiClient
            .signIn("test@kisi.io", "test")
            .then((result) => {
                assert.deepEqual(result, { secret: "secret" })
                assert.strictEqual(kisiClient
                    .client
                    .defaults
                    .headers
                    .common["X-Login-Secret"], "secret")

                done()
            })
            .catch(error => done(error))
    })

    it("should sign out", function (done) {
        axiosMockAdapter
            .onDelete(/login$/)
            .reply(204, null, {})

        kisiClient
            .signOut()
            .then((result) => {
                assert.strictEqual(result, null)
                assert.strictEqual(kisiClient
                    .client
                    .defaults
                    .headers
                    .common["X-Login-Secret"], null)

                done()
            })
            .catch(error => done(error))
    })
})

describe("CRUD", function () {
    it("should get", function (done) {
        axiosMockAdapter
            .onGet(/get$/)
            .reply(200, {
                id: 1
            }, {})

        kisiClient
            .get("get", { id: 1 })
            .then((result) => {
                assert.strictEqual(result.id, 1)

                done()
            })
            .catch(error => done(error))
    })

    it("should get multiple", function (done) {
        axiosMockAdapter
            .onGet(/getMultiple$/)
            .reply(200, [{}], { "x-collection-range": "0-0/1" })

        kisiClient
            .get("getMultiple")
            .then((result) => {
                assert.deepEqual(result, {
                    pagination: {
                        offset: 0,
                        limit: 1
                    },
                    data: [
                        {}
                    ]
                })

                done()
            })
            .catch(error => done(error))
    })

    it("should get empty multiple", function (done) {
        axiosMockAdapter
            .onGet(/getEmptyMultiple$/)
            .reply(200, [], { "x-collection-range": "*/0" })

        kisiClient
            .get("getEmptyMultiple")
            .then((result) => {
                assert.deepEqual(result, {
                    pagination: {
                        offset: 0,
                        limit: 0
                    },
                    data: []
                })

                done()
            })
            .catch(error => done(error))
    })

    it("should post", function (done) {
        axiosMockAdapter
            .onGet(/post$/)
            .reply(200, {
                id: 1
            }, {})

        kisiClient
            .get("post", { id: 1 })
            .then((result) => {
                assert.deepEqual(result, { id: 1 })

                done()
            })
            .catch(error => done(error))
    })

    it("should put", function (done) {
        axiosMockAdapter
            .onGet(/put$/)
            .reply(204, null, {})

        kisiClient
            .get("put", { id: 1 })
            .then((result) => {
                assert.strictEqual(result, null)

                done()
            })
            .catch(error => done(error))
    })

    it("should delete", function (done) {
        axiosMockAdapter
            .onGet(/delete$/)
            .reply(204, null, {})

        kisiClient
            .get("delete")
            .then((result) => {
                assert.strictEqual(result, null)

                done()
            })
            .catch(error => done(error))
    })

    it("should fail", function (done) {
        axiosMockAdapter
            .onGet(/fail$/)
            .reply(401, {
                code: "abc123",
                error: "Not authorized"
            }, {})

        kisiClient
            .get("fail")
            .then(() => done(new Error("Should not happen")))
            .catch(error => {
                assert.strictEqual(error.status, 401)
                assert.strictEqual(error.code, "abc123")
                assert.strictEqual(error.reason, "Not authorized")

                done()
            })
    })

    it("should fail without reason", function (done) {
        axiosMockAdapter
            .onGet(/failWithoutReason$/)
            .reply(401, null, {})

        kisiClient
            .get("failWithoutReason")
            .then(() => done(new Error("Should not happen")))
            .catch(error => {
                assert.strictEqual(error.status, 401)
                assert.strictEqual(error.code, "000000")

                done()
            })
    })
})
