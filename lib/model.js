class Model {
  constructor(data) {
    this.raw = data
    this.attrs = this.parse()
  }

  static newFromType(type) {
    return new Model({
      active: true,
      site_id: type.site_id,
      document_definition_id: type.id,
      content: type.parts.map(partDefinition => {
        return {part_definition_id: partDefinition.id, part: partDefinition.raw}
      })
    })
  }

  commit() {
    for (let key in this.raw) {
      let value = this.raw[key]
      if (Array.isArray(value)) {
        if (this._isPart(value)) {
          value.forEach((part, i) => {
            let partName = this._partName(part)
            if (this._partValue(partName) !== this.attrs[partName]) {
              this.raw[key][i].value = this.attrs[partName]
            }
          })
          continue
        }
      }
      if (value !== this.attrs[key]) {
        this.raw[key] = this.attrs[key]
      }
    }

    return this.raw
  }

  parse() {
    let hash = {}
    for (let key in this.raw) {
      let value = this.raw[key]
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
        hash[key] = value
      }
    }

    for (let key in hash) {
      Object.defineProperty(this, key, {
        get() {
          return this.attrs[key]? this.attrs[key] : undefined
        },
        set(value) {
          this.attrs[key] = value
        }
      })
    }

    return hash
  }

  _isPart(val) {
    return val.length && val[0].part_definition_id
  }

  _isPartDefinition(val) {
    return val[0] && val[0].definition_id && val[0].definition_type
  }

  _partName(part) {
    return part.part? part.part.name : part.name
  }

  _partValue(part) {
    return part.value
  }
}

export default Model
