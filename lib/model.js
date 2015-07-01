class Model {
  constructor(data) {
    this.raw = data
    this.attrs = this.parse()
  }

  static newFromPart(part, data) {
    // TODO
  }

  commit() {
    // TODO
  }

  get [method]() {
    return this.attrs[method]? this.attrs[method] : undefined
  }

  set [method](val) {
    this.attrs[method] = val
  }

  parse() {
    return this.raw.reduce((hash, value, key) => {
      if (Array.isArray(value)) {
        if (this._isPart(value)) {
          value.forEach((part) => {
            hash[this._partName(part)] = this._partValue(part)
          })
        } else {
          hash[key] = value.map((v) => {
            return v.id? new Model(v) : v
          })
        }
      } else {
        hash[key] = val
      }

      return hash
    }, {})
  }

  _isPart(val) {
    return val.length && val[0].part_definition_id
  }

  _partName(part) {
    return part.part? part.part.name : part.name
  }

  _partValue(part) {
    return part.value
  }
}

export default Model
