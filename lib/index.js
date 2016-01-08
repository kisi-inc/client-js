var cloneDeep = require('lodash').cloneDeep;
var humps = require('humps');
var omit = require('lodash').omit;
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');
var url = require('url');

function Rest(config) {
  config = config || {};

  this.context = {
    authenticationToken: null,
    baseUrl: 'https://api.getkisi.com',
    timeout: config.timeout || 0,
    camelize: config.camelize || true
  };
}

function camelizeResponse(next, response) {
  if (this.context.camelize && response.body) {
    response.body = humps.camelizeKeys(response.body);
  }
  next(response);
}

Rest.prototype.authenticate = function(email, password) {
  var _this = this;

  return new Promise(function(resolve, reject) {
    _this.post('users/sign_in', { user: { email: email, password: password } })
    .then(function(response) {
      _this.context.authenticationToken = response.body.authenticationToken;
      resolve(response);
    }).catch(camelizeResponse.bind(_this, reject));
  });
};

Rest.prototype.unauthenticate = function() {
  var _this = this;

  return new Promise(function(resolve, reject) {
    _this.delete('users/sign_out')
    .then(function(response) {
      _this.context.authenticationToken = null;
      resolve(response);
    }).catch(camelizeResponse.bind(_this, reject));
  });
};

Rest.prototype.get = function(path, params) {
  params = cloneDeep(params);
  if (params && params.page && params.limit) {
    params.offset = (params.page - 1) * params.limit;
  }
  return this._dispatch('GET', path, null, params);
};

Rest.prototype.post = function(path, params) {
  return this._dispatch('POST', path, params);
};

Rest.prototype.put = function(path, params) {
  return this._dispatch('PUT', path, params);
};

Rest.prototype.delete = function(path, params) {
  return this._dispatch('DELETE', path, params);
};

Rest.prototype._dispatch = function(method, path, params, queryParams) {
  if (method === 'DELETE') {
    method = 'del';
  }

  var _this = this;
  return new Promise(function(resolve, reject) {
    var readyQueryParams;
    if (queryParams) {
      readyQueryParams = humps.decamelizeKeys(omit(queryParams, 'page'));

      if (readyQueryParams.q instanceof Object) {
        readyQueryParams.q = JSON.stringify(readyQueryParams.q);
      }
    }

    request[method.toLowerCase()](url.resolve(_this.context.baseUrl, path))
    .send(humps.decamelizeKeys(params))
    .query(readyQueryParams)
    .set('Accept', 'application/json')
    .set('X-Authentication-Token', _this.context.authenticationToken)
    .timeout(_this.context.timeout)
    .then(function(response) {
      if (_this.context.camelize) {
        response.body = humps.camelizeKeys(response.body);
      }

      var collectionRange = response.header['x-collection-range'];
      if (collectionRange !== undefined) {
        var rangeAndCount = collectionRange.split('/');
        var rangeStartAndEnd = rangeAndCount[0].split('-');
        var collectionStart = Number(rangeStartAndEnd[0]);
        var collectionEnd = Number(rangeStartAndEnd[1]);
        var collectionCount = Number(rangeAndCount[1]);
        var collectionLimit = Number(collectionEnd - collectionStart + 1);

        queryParams = queryParams || {};

        response.body = {
          items: response.body,
          offset: collectionStart,
          limit: collectionLimit,
          count: collectionCount,
          page: Math.ceil((collectionEnd + 1) / queryParams.limit) || 1,
          lastPage: Math.ceil(collectionCount / queryParams.limit) || 1,
          query: omit(queryParams, 'offset')
        };
      }

      resolve(response);
    }).catch(camelizeResponse.bind(_this, reject));
  });
};

module.exports = Rest;
