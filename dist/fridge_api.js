'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

if (!global.fetch) {
  require('isomorphic-fetch');
}

var defaults = {
  api_endpoint: 'https://api.fridgecms.com/v1'
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

var parseJSON = function parseJSON(response) {
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
    var options = arguments[1] === undefined ? {} : arguments[1];
    var done = arguments[2] === undefined ? null : arguments[2];

    return this._request('get', url, null, options, done);
  };

  FridgeApi.prototype.post = function post(url) {
    var data = arguments[1] === undefined ? {} : arguments[1];
    var options = arguments[2] === undefined ? {} : arguments[2];
    var done = arguments[3] === undefined ? null : arguments[3];

    return this._request('post', url, data, options, done);
  };

  FridgeApi.prototype.put = function put(url) {
    var data = arguments[1] === undefined ? {} : arguments[1];
    var options = arguments[2] === undefined ? {} : arguments[2];
    var done = arguments[3] === undefined ? null : arguments[3];

    return this._request('put', url, data, options, done);
  };

  FridgeApi.prototype['delete'] = function _delete(url) {
    var options = arguments[1] === undefined ? {} : arguments[1];
    var done = arguments[2] === undefined ? null : arguments[2];

    return this._request('delete', url, null, options, done);
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

  FridgeApi.prototype.refreshToken = function refreshToken(requestArgs) {
    var _this = this;

    return this.post('oauth/token', this._applicationAuthentication()).then(function (data) {
      _this.accessToken = data.access_token;
      return _this._request.apply(_this, requestArgs);
    })['catch'](function (err) {
      throw err;
    });
  };

  FridgeApi.prototype._request = function _request(method, endpoint, data, options, done) {
    var _this2 = this,
        _arguments = arguments;

    options = _objectAssign2['default'](options, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token ' + this.accessToken
      },
      method: method,
      body: method == 'post' || method == 'put' ? JSON.stringify(data) : null
    });
    var url = this.options.api_endpoint + '/' + endpoint;
    var req = fetch(url, options).then(checkStatus).then(parseJSON).then(this._parse.bind(this))['catch'](function (err) {
      if (err.response && err.response.status == 401) {
        return _this2.refreshToken(_arguments);
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
    return {
      grant_type: 'client_credentials',
      client_id: this.options.client_id,
      client_secret: this.options.client_secret
    };
  };

  return FridgeApi;
})();

exports['default'] = FridgeApi;
module.exports = exports['default'];