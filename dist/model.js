"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = (function () {
  function Model(data) {
    _classCallCheck(this, Model);

    this.raw = data;
    this.attrs = this.parse();
  }

  Model.newFromPart = function newFromPart(part, data) {};

  Model.prototype.commit = function commit() {};

  Model.prototype.parse = function parse() {
    var _this = this;

    var hash = {};
    for (var key in this.raw) {
      var value = this.raw[key];
      if (Array.isArray(value)) {
        if (this._isPart(value)) {
          value.forEach(function (part) {
            hash[_this._partName(part)] = _this._partValue(part);
          });
        } else {
          hash[key] = value.map(function (v) {
            return v.id ? new Model(v) : v;
          });
        }
      } else {
        hash[key] = value;
      }
    }

    var _loop = function (key) {
      Object.defineProperty(_this, key, {
        get: function get() {
          return this.attrs[key] ? this.attrs[key] : undefined;
        },
        set: function set(value) {
          this.attrs[key] = value;
        }
      });
    };

    for (var key in hash) {
      _loop(key);
    }

    return hash;
  };

  Model.prototype._isPart = function _isPart(val) {
    return val.length && val[0].part_definition_id;
  };

  Model.prototype._partName = function _partName(part) {
    return part.part ? part.part.name : part.name;
  };

  Model.prototype._partValue = function _partValue(part) {
    return part.value;
  };

  return Model;
})();

exports["default"] = Model;
module.exports = exports["default"];

// TODO

// TODO