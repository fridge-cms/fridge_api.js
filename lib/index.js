/* global fetch */
import qs from 'qs'

// shim "fetch" if it isn't available
if (!global.fetch) require('isomorphic-fetch')

const defaults = {
  apiUrl: 'https://api.fridgecms.com/v2'
}

class Fridge {
  constructor (options) {
    this.options = {...defaults, ...options}
  }

  static client (options) {
    return new Fridge(options)
  }

  get (url, options = {}) {
    return this._request('get', url, null, options)
  }

  post (url, json = {}, options = {}) {
    return this._request('post', url, json, options)
  }

  put (url, json = {}, options = {}) {
    return this._request('put', url, json, options)
  }

  delete (url, options = {}) {
    return this._request('delete', url, null, options)
  }

  async _request (method, path, json, options) {
    const requestOptions = {headers: {}, method}

    if (this.options.token) {
      // Bearer?
      requestOptions.headers['Authorization'] = this.options.token
    }

    if (this.options.fridgeId) {
      options.site_id = this.options.fridgeId
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

    const q = qs.stringify(options)
    const url = `${this.options.apiUrl}/${path.replace(/^\//g, '')}${q.length ? `?${q}` : ''}`

    const res = await fetch(url, requestOptions)
    // seems easier to deal with errors without `throw`
    // await checkStatus(res)
    return res.headers.get('Content-Type').match(/json/)
      ? res.json()
      : res.text()
  }
}

module.exports = Fridge
