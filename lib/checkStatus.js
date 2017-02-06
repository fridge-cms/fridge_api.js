import parseResponse from './parseResponse'

export default response => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    const defaultError = `${response.status} - ${response.statusText}`

    return parseResponse(response).then(
      res => {
        let error = new Error(res.message || res.error_description || defaultError)
        error.status = response.status
        error.response = res
        throw error
      },
      () => {
        let error = new Error(defaultError)
        error.status = response.status
        error.response = response
        throw error
      }
    )
  }
}
