import Model from './model'
import assign from 'object-assign'

if (!global.fetch) {
  import 'isomorphic-fetch'
}

const defaults = {
  api_endpoint: "https://api.fridgecms.com/v1"
}

let checkStatus = function(response) {
  if (response.status >= 200 && response.status < 300) {
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
    this.options = assign(defaults, options)
  }

  static client(options) {
    return new FridgeApi(options)
  }

  get(url, options = {}, done = null) {
    return this._request("get", url, null, options, done)
  }

  post(url, data = {}, options = {}, done = null) {
    return this._request("post", url, data, options, done)
  }

  put(url, data = {}, options = {}, done = null) {
    return this._request("put", url, data, options, done)
  }

  delete(url, options = {}, done = null) {
    return this._request("delete", url, null, options, done)
  }

  toModel(data) {
    if (this.isFridgeObject(data)) {
      data = new Model(data)
    }

    return data
  }

  isFridgeObject(obj) {
    return (obj.id || obj.uuid)
  }

  refreshToken(requestArgs) {
    return this.post("oauth/token", this._applicationAuthentication())
      .then(data => {
        this.accessToken = data.access_token
        return this._request(...requestArgs)
      })
      .catch(err => {
        throw err
      })
  }

  _request(method, endpoint, data, options, done) {
    options = assign(options, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token ' + this.accessToken
      },
      method: method,
      body: (method == "post" || method == "put")? JSON.stringify(data) : null
    })
    let url = this.options.api_endpoint + '/' + endpoint
    let req = fetch(url, options)
      .then(checkStatus)
      .then(parseJSON)
      .then(this._parse.bind(this))
      .catch(err => {
        if (err.response && err.response.status == 401) {
          return this.refreshToken(arguments)
        }
        throw err
      })
    if (!done) {
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
