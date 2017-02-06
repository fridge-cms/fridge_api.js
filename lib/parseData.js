export default (data) => {
  if (Array.isArray(data)) {
    return data.map(v => v && v.id ? parseModel(v) : v)
  } else {
    return parseModel(data)
  }
}

const parseModel = model => {
  // transform v1 content array into content hash
  if (model.content && Array.isArray(model.content)) {
    model.content = model.content.reduce((obj, part) => {
      obj[partName(part)] = partValue(part)
      return obj
    }, {})
  }

  return model
}

// helpers
const partName = part => part.part ? part.part.name : part.name
const partValue = part => part.value
