var humps = require('humps');
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');

require('superagent-retry')(request);

function Rest() {
  this.context = {
    authenticationToken: null,
    baseUrl: 'https://my.getKisi.com/api',
    retries: 0
  };
}

Rest.prototype.authenticate = function(email, password) {
  var _this = this;

  return new Promise(function(resolve, reject) {
    _this.post('users/sign_in', { user: { email: email, password: password } })
    .then(function(response) {
      _this.context.authenticationToken = response.body.authenticationToken;
      resolve(response);
    }).catch(reject);
  });
};

Rest.prototype.unauthenticate = function() {
  var _this = this;

  return new Promise(function(resolve, reject) {
    _this.delete('users/sign_out')
    .then(function(response) {
      _this.context.authenticationToken = null;
      resolve(response);
    }).catch(reject);
  });
};

Rest.prototype.get = function(path, params) {
  return this._dispatch('GET', path, params);
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

Rest.prototype._dispatch = function(method, path, params) {
  if (method === 'DELETE') {
    method = 'del';
  }

  var _this = this;
  return new Promise(function(resolve, reject) {
    request[method.toLowerCase()](_this.context.baseUrl + '/' + path)
    .send(humps.decamelizeKeys(params))
    .set('Accept', 'application/json')
    .set('X-Authentication-Token', _this.context.authenticationToken)
    .retry(_this.context.retries)
    .then(function(response) {
      response.body = humps.camelizeKeys(response.body);

      var collectionRange = response.header['x-collection-range'];
      if (collectionRange !== undefined) {
        var rangeAndCount = collectionRange.split('/');
        var rangeStartAndEnd = rangeAndCount[0].split('-');
        var collectionStart = rangeStartAndEnd[0];
        var collectionEnd = rangeStartAndEnd[1];
        var collectionCount = rangeAndCount[1];
        var collectionLimit = collectionEnd - collectionStart + 1;

        response.body = {
          items: response.body,
          offset: collectionStart,
          limit: collectionLimit,
          count: collectionCount
        };
      }

      resolve(response);
    }).catch(reject);
  });
};

module.exports = Rest;
