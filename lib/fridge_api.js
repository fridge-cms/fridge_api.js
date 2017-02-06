import qs from 'qs'
import parseData from './parseData'
import parseResponse from './parseResponse'
import checkStatus from './checkStatus'

if (!global.fetch) {
  import 'isomorphic-fetch'
}

const defaults = {
  api_endpoint: "https://api.fridgecms.com/v1"
}

class FridgeApi {
  constructor (options) {
    this.options = {...defaults, ...options}
  }

  static client (options) {
    return new FridgeApi(options)
  }

  get (url, options = {}, done = null) {
    return this._request('get', url, null, options, done)
  }

  post (url, json = {}, options = {}, done = null) {
    return this._request('post', url, json, options, done)
  }

  put (url, json = {}, options = {}, done = null) {
    return this._request('put', url, json, options, done)
  }

  delete (url, options = {}, done = null) {
    return this._request('delete', url, null, options, done)
  }

  getToken (requestArgs) {
    return this.post('oauth/token', this._applicationAuthentication())
      .then(data => {
        this.accessToken = data.access_token
        if (data.refresh_token) this.refreshToken = data.refresh_token
        return this._request(...requestArgs)
      })
      .catch(err => {
        throw err
      })
  }

  url (path, query = {}) {
    path = path.replace(/^\//g, '')
    let q = qs.stringify(query)
    return this.options.api_endpoint + '/' + path + (q.length ? '?' + q : '')
  }

  _request (method, path, json, options, done) {
    let auth = true
    let requestOptions = {headers: {}, method}

    if (json && (method == 'post' || method == 'put')) {
      requestOptions.headers['Content-Type'] = 'application/json'
      requestOptions.body = JSON.stringify(json)
    }

    if ('auth' in options) {
      auth = options.auth
      delete options.auth
    }

    if (options.body) {
      requestOptions.body = options.body
      delete options.body
    }

    if (options.headers) {
      requestOptions.headers = {...requestOptions.headers, ...options.headers}
      delete options.headers
    }

    if (options.credentials) {
      requestOptions.credentials = options.credentials
      delete options.credentials
    }

    if (auth && this.accessToken) {
      requestOptions.headers['Authorization'] = 'token ' + this.accessToken
    }

    const req = fetch(this.url(path, options), requestOptions)
      .then(checkStatus)
      .then(parseResponse)
      .then(parseData)
      .catch(err => {
        if (err.status && err.status === 401 && auth) {
          return this.getToken([method, path, json, options])
        }

        throw err
      })
    if (!done) {
      return req
    } else {
      req.then(
        data => done && done(null, data),
        err => done && done(err, null)
      )
    }
  }

  _applicationAuthentication () {
    if (this.refreshToken) {
      return {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.options.client_id,
        client_secret: this.options.client_secret,
      }
    } else {
      return {
        grant_type: 'client_credentials',
        client_id: this.options.client_id,
        client_secret: this.options.client_secret
      }
    }
  }
}

export default FridgeApi
