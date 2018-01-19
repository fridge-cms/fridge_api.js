/* global fetch */
import qs from 'qs'

// shim "fetch" if it isn't available
if (!global.fetch) require('isomorphic-fetch')

const defaults = {
  api_endpoint: 'https://api.fridgecms.com/v2'
}

class Fridge {
  constructor (options) {
    this.options = {...defaults, ...options}
  }

  static client (options) {
    return new Fridge(options)
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

  url (path, query = {}) {
    path = path.replace(/^\//g, '')
    let q = qs.stringify(query)
    return this.options.api_endpoint + '/' + path + (q.length ? '?' + q : '')
  }

  async _request (method, path, json, options) {
    const requestOptions = {
      method,
      headers: {
        // Bearer?
        'Authorization': this.options.token
      }
    }

    if (json && (method === 'post' || method === 'put')) {
      requestOptions.headers['Content-Type'] = 'application/json'
      requestOptions.body = JSON.stringify(json)
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

    const res = await fetch(this.url(path, options), requestOptions)
    // seems easier to deal with errors without `throw`
    // await checkStatus(res)
    return res.headers.get('Content-Type') === 'application/json'
      ? res.json()
      : res.text()
  }
}

module.exports = Fridge
