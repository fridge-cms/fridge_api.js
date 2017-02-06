export default response => {
  if (response.headers.get('Content-Type') === 'application/json') {
    return response.json()
  }

  return response.text()
}
