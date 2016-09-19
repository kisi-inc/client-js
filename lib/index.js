"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _babelPolyfill = require("babel-polyfill");

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

var _humps = require("humps");

var _humps2 = _interopRequireDefault(_humps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

class Kisi {
    constructor(config = {}) {
        config = Object.assign(config, {
            baseURL: `https://api.getkisi.com/`,
            timeout: 5000,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        this.client = _axios2.default.create(config);

        this.addDecamelizationRequestInterceptor();
        this.addCamelizationResponseInterceptor();
        this.addPaginationResponseInterceptor();
    }

    addDecamelizationRequestInterceptor() {
        this.client.interceptors.request.use(config => {
            config.body = _humps2.default.decamelizeKeys(config.body);
            config.params = _humps2.default.decamelizeKeys(config.params);

            return config;
        });
    }

    addCamelizationResponseInterceptor() {
        this.client.interceptors.response.use(response => {
            response.data = _humps2.default.camelizeKeys(response.data);

            return response;
        });
    }

    addPaginationResponseInterceptor() {
        this.client.interceptors.response.use(response => {
            const headers = response.headers;
            const collectionRange = headers["x-collection-range"];

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
                };
            }

            return response;
        });
    }

    setLoginSecret(secret) {
        this.client.defaults.headers.common["X-Login-Secret"] = secret;
    }

    signUp(email, password) {
        var _this = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) switch (_context.prev = _context.next) {
                    case 0:
                        _this.setLoginSecret(null);

                        _context.prev = 1;
                        _context.next = 4;
                        return _this.post(`users`, { user: { email, password } });

                    case 4:
                        return _context.abrupt("return", _context.sent);

                    case 7:
                        _context.prev = 7;
                        _context.t0 = _context["catch"](1);
                        return _context.abrupt("return", _this.handleError(_context.t0));

                    case 10:
                    case "end":
                        return _context.stop();
                }
            }, _callee, _this, [[1, 7]]);
        }))();
    }

    signIn(email, password) {
        var _this2 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
            var response;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                    case 0:
                        _this2.setLoginSecret(null);

                        _context2.prev = 1;
                        _context2.next = 4;
                        return _this2.post(`logins`, { login: { type: "device" }, user: { email, password } });

                    case 4:
                        response = _context2.sent;


                        _this2.setLoginSecret(response.secret);
                        _context2.next = 11;
                        break;

                    case 8:
                        _context2.prev = 8;
                        _context2.t0 = _context2["catch"](1);
                        return _context2.abrupt("return", _this2.handleError(_context2.t0));

                    case 11:
                    case "end":
                        return _context2.stop();
                }
            }, _callee2, _this2, [[1, 8]]);
        }))();
    }

    signOut() {
        var _this3 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return _this3.delete(`login`);

                    case 3:

                        _this3.setLoginSecret(null);

                        return _context3.abrupt("return", true);

                    case 7:
                        _context3.prev = 7;
                        _context3.t0 = _context3["catch"](0);
                        return _context3.abrupt("return", _this3.handleError(_context3.t0));

                    case 10:
                    case "end":
                        return _context3.stop();
                }
            }, _callee3, _this3, [[0, 7]]);
        }))();
    }

    get(path, params = {}) {
        var _this4 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
            var response;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        _context4.next = 3;
                        return _this4.client.get(path, { params });

                    case 3:
                        response = _context4.sent;
                        return _context4.abrupt("return", response.data);

                    case 7:
                        _context4.prev = 7;
                        _context4.t0 = _context4["catch"](0);
                        return _context4.abrupt("return", _this4.handleError(_context4.t0));

                    case 10:
                    case "end":
                        return _context4.stop();
                }
            }, _callee4, _this4, [[0, 7]]);
        }))();
    }

    post(path, data = {}) {
        var _this5 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
            var response;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        _context5.next = 3;
                        return _this5.client.post(path, data);

                    case 3:
                        response = _context5.sent;
                        return _context5.abrupt("return", response.data);

                    case 7:
                        _context5.prev = 7;
                        _context5.t0 = _context5["catch"](0);
                        return _context5.abrupt("return", _this5.handleError(_context5.t0));

                    case 10:
                    case "end":
                        return _context5.stop();
                }
            }, _callee5, _this5, [[0, 7]]);
        }))();
    }

    put(path, data = {}) {
        var _this6 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        _context6.next = 3;
                        return _this6.client.put(path, data);

                    case 3:
                        return _context6.abrupt("return", true);

                    case 6:
                        _context6.prev = 6;
                        _context6.t0 = _context6["catch"](0);
                        return _context6.abrupt("return", _this6.handleError(_context6.t0));

                    case 9:
                    case "end":
                        return _context6.stop();
                }
            }, _callee6, _this6, [[0, 6]]);
        }))();
    }

    delete(path) {
        var _this7 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
            var response;
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.prev = 0;
                        _context7.next = 3;
                        return _this7.client.delete(path);

                    case 3:
                        response = _context7.sent;
                        return _context7.abrupt("return", true);

                    case 7:
                        _context7.prev = 7;
                        _context7.t0 = _context7["catch"](0);
                        return _context7.abrupt("return", _this7.handleError(_context7.t0));

                    case 10:
                    case "end":
                        return _context7.stop();
                }
            }, _callee7, _this7, [[0, 7]]);
        }))();
    }

    handleError(error) {
        if (error.response) {
            const response = error.response;
            const status = response.status;
            const data = response.data;
            const code = data.code || "000000";

            if (data.error) {
                throw { status, code, error: data.error };
            } else if (data.errors) {
                throw { status, code, errors: data.errors };
            } else {
                throw { status, code, error: data };
            }
            throw data;
        } else {
            throw error;
        }
    }
}

exports.default = Kisi;


const client = new Kisi();

client.signIn("carl@kisi.de", "test1234").then(() => {
    client.signOut().then(locks => console.log(locks)).catch(error => console.log(error));
}).catch(error => console.log(error));
