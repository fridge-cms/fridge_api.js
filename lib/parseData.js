const parseData = data => {
  if (Array.isArray(data)) {
    return data.map(v => v && v.id ? parseModel(v) : v)
  } else {
    return data ? parseModel(data) : data
  }
}

const parseModel = model => {
  // transform v1 content array into content hash
  if (model.content && Array.isArray(model.content)) {
    model.content = model.content.reduce((obj, part) => {
      // recursively parse content arrays
      obj[partName(part)] = parseData(partValue(part))
      return obj
    }, {})
  }

  if (model.settings && Array.isArray(model.settings)) {
    model.settings = model.settings.reduce((obj, part) => {
      // recursively parse content arrays
      obj[partName(part)] = parseData(partValue(part))
      return obj
    }, {})
  }

  return model
}

// helpers
const partName = part => part.part ? part.part.name : part.name
const partValue = part => part.value

export default parseData
