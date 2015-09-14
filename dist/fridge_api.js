'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

if (!global.fetch) {
  require('isomorphic-fetch');
}

var defaults = {
  api_endpoint: "https://api.fridgecms.com/v1"
};

var checkStatus = function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

var parseResponse = function parseResponse(response) {
  if (response.headers.get('Content-Type') == 'application/json') {
    return response.json();
  }

  return response.text();
};

var FridgeApi = (function () {
  function FridgeApi(options) {
    _classCallCheck(this, FridgeApi);

    this.options = _objectAssign2['default'](defaults, options);
  }

  FridgeApi.client = function client(options) {
    return new FridgeApi(options);
  };

  FridgeApi.prototype.get = function get(url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var done = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    return this._request("get", url, null, options, done);
  };

  FridgeApi.prototype.post = function post(url) {
    var json = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    var done = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    return this._request("post", url, json, options, done);
  };

  FridgeApi.prototype.put = function put(url) {
    var json = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    var done = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    return this._request("put", url, json, options, done);
  };

  FridgeApi.prototype['delete'] = function _delete(url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var done = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    return this._request("delete", url, null, options, done);
  };

  FridgeApi.prototype.toModel = function toModel(data) {
    if (this.isFridgeObject(data)) {
      data = new _model2['default'](data);
    }

    return data;
  };

  FridgeApi.prototype.isFridgeObject = function isFridgeObject(obj) {
    return obj.id || obj.uuid;
  };

  FridgeApi.prototype.getToken = function getToken(requestArgs) {
    var _this = this;

    return this.post("oauth/token", this._applicationAuthentication()).then(function (data) {
      _this.accessToken = data.access_token;
      if (data.refresh_token) _this.refreshToken = data.refresh_token;
      return _this._request.apply(_this, requestArgs);
    })['catch'](function (err) {
      throw err;
    });
  };

  FridgeApi.prototype.url = function url(path) {
    var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    path = path.replace(/^\//g, '');
    var q = _qs2['default'].stringify(query);
    return this.options.api_endpoint + '/' + path + (q.length ? '?' + q : '');
  };

  FridgeApi.prototype._request = function _request(method, path, json, options, done) {
    var _this2 = this,
        _arguments = arguments;

    var auth = true;
    var requestOptions = { headers: {}, method: method };

    if (json && (method == 'post' || method == 'put')) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(json);
    }

    if ('auth' in options) {
      auth = options.auth;
      delete options.auth;
    }

    if (options.body) {
      requestOptions.body = options.body;
      delete options.body;
    }

    if (options.headers) {
      requestOptions.headers = _objectAssign2['default'](requestOptions.headers, options.headers);
      delete options.headers;
    }

    if (options.credentials) {
      requestOptions.credentials = options.credentials;
      delete options.credentials;
    }

    if (auth && this.accessToken) {
      requestOptions.headers['Authorization'] = 'token ' + this.accessToken;
    }

    var req = fetch(this.url(path, options), requestOptions).then(checkStatus).then(parseResponse).then(this._parse.bind(this))['catch'](function (err) {
      if (err.response && err.response.status == 401 && auth) {
        return _this2.getToken(_arguments);
      }
      throw err;
    });
    if (!done) {
      return req;
    } else {
      req.then(function (data) {
        done && done(null, data);
      })['catch'](function (error) {
        done && done(error, null);
      });
    }
  };

  FridgeApi.prototype._parse = function _parse(data) {
    var _this3 = this;

    if (Array.isArray(data)) {
      return data.map(function (v) {
        return _this3.toModel(v);
      });
    }

    return this.toModel(data);
  };

  FridgeApi.prototype._applicationAuthentication = function _applicationAuthentication() {
    if (this.refreshToken) {
      return {
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.options.client_id,
        client_secret: this.options.client_secret
      };
    } else {
      return {
        grant_type: "client_credentials",
        client_id: this.options.client_id,
        client_secret: this.options.client_secret
      };
    }
  };

  return FridgeApi;
})();

exports['default'] = FridgeApi;
module.exports = exports['default'];