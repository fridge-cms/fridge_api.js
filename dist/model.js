"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = (function () {
  function Model(data) {
    _classCallCheck(this, Model);

    this.raw = data;
    this.attrs = this.parse();
  }

  Model.newFromType = function newFromType(type) {
    return new Model({
      site_id: type.site_id,
      document_definition_id: type.id,
      content: type.parts.map(function (partDefinition) {
        return { part_definition_id: partDefinition.id, part: partDefinition.raw };
      })
    });
  };

  Model.prototype.commit = function commit() {
    var _this = this;

    var _loop = function (key) {
      var value = _this.raw[key];
      if (Array.isArray(value)) {
        if (_this._isPart(value)) {
          value.forEach(function (part, i) {
            var partName = _this._partName(part);
            if (_this._partValue(partName) !== _this.attrs[partName]) {
              _this.raw[key][i].value = _this.attrs[partName];
            }
          });
        }
      } else {
        if (value !== _this.attrs[key]) {
          _this.raw[key] = _this.attrs[key];
        }
      }
    };

    for (var key in this.raw) {
      _loop(key);
    }

    return this.raw;
  };

  Model.prototype.parse = function parse() {
    var _this2 = this;

    var hash = {};
    for (var key in this.raw) {
      var value = this.raw[key];
      if (Array.isArray(value)) {
        if (this._isPart(value)) {
          value.forEach(function (part) {
            hash[_this2._partName(part)] = _this2._partValue(part);
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

    var _loop2 = function (key) {
      Object.defineProperty(_this2, key, {
        get: function get() {
          return this.attrs[key] ? this.attrs[key] : undefined;
        },
        set: function set(value) {
          this.attrs[key] = value;
        }
      });
    };

    for (var key in hash) {
      _loop2(key);
    }

    return hash;
  };

  Model.prototype._isPart = function _isPart(val) {
    return val.length && val[0].part_definition_id;
  };

  Model.prototype._isPartDefinition = function _isPartDefinition(val) {
    return val[0] && val[0].definition_id && val[0].definition_type;
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