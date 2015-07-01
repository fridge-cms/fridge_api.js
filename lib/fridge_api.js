import 'isomorphic-fetch'
import Model from './model'

let defaults = {
  api_endpoint: "https://api.fridgecms.com/v1"
}

let checkStatus = function(response) {
  if (response.status == 401) {
    return this.refreshToken(response)
  } else if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    let error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

let parseJSON = function(response) {
  return response.json()
}

class FridgeApi {
  constructor(options) {
    this.options = Object.assign(defauls, options)
  }

  get(url, options = {}, done = null) {
    return this.request("get", url, options, done)
  }

  post(url, options = {}, done = null) {
    return this.request("post", url, options, done)
  }

  put(url, options = {}, done = null) {
    return this.request("put", url, options, done)
  }

  delete(url, options = {}, done = null) {
    return this.request("delete", url, options, done)
  }

  toModel(data) {
    if (this.isFridgeObject(data)) {
      data = new Model(data)
    }

    return data
  }

  refreshToken(response) {
    return this.post("oauth/token", this._applicationAuthentication()).then(function(data) {
      this.accessToken = data.access_token
    }).then(function(data) {
      return response
    }).catch(function(error) {
      throw error
    })
  }

  _request(method, path, data, options, done) {
    options = Object.assign(options, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.accessToken
      },
      method: method,
      body: (method == "post" || method == "put")? JSON.stringify(data) : null
    })
    req = fetch(path, options).then(checkStatus).then(parseJSON).then(this._parse)
    if (done !== null) {
      return req
    } else {
      req.then(function(data) {
        done && done(null, data)
      }).catch(function(error) {
        done && done(error, null)
      })
    }
  }

  _parse(data) {
    if (Array.isArray(data)) {
      return data.map(v => {
        return this.toModel(v)
      })
    }

    return this.toModel(data)
  }

  _applicationAuthentication() {
    return {
      grant_type: "client_credentials",
      client_id: this.options.client_id,
      client_secret: this.options.client_secret
    }
  }
}

export default FridgeApi
