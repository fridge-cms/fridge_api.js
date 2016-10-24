class Model {
  constructor(data) {
    this.raw = data
    this._parts = {}
    this.attrs = this.parse()
  }

  static newFromType(type, data = {}) {
    const parts = type.parts || []

    return new Model({
      active: true,
      site_id: type.site_id,
      document_definition_id: type.id,
      content: parts.map(partDefinition => {
        return {part_definition_id: partDefinition.id, part: partDefinition}
      }),
      ...data
    })
  }

  commit() {
    for (let key in this.raw) {
      let value = this.raw[key]
      if (Array.isArray(value)) {
        if (this._isPart(value)) {
          value.forEach((part, i) => {
            let partName = this._partName(part)
            if (this._partValue(partName) !== this._parts[partName]) {
              this.raw[key][i].value = this._parts[partName]
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
            this._parts[this._partName(part)] = this._partValue(part)
          })
        } else if (this._isPartDefinition(value)) {
          value.forEach((partDefinition) => {
            this._parts[this._partName(partDefinition)] = partDefinition
          })
        } else {
          hash[key] = value.map((v) => {
            return v && v.id ? new Model(v) : v
          })
          continue
        }
      }

      hash[key] = value
    }

    for (let key in hash) {
      Object.defineProperty(this, key, {
        get() {
          return (key in this.attrs)? this.attrs[key] : undefined
        },
        set(value) {
          this.attrs[key] = value
        }
      })
    }

    return hash
  }

  get(key) {
    return (key in this._parts)? this._parts[key] : undefined
  }

  set(key, value) {
    this._parts[key] = value
  }

  _isPart(val) {
    return val && val[0] && val[0].part_definition_id
  }

  _isPartDefinition(val) {
    return val[0] && val[0].definition_id
  }

  _partName(part) {
    return part.part? part.part.name : part.name
  }

  _partValue(part) {
    return part.value
  }
}

export default Model
