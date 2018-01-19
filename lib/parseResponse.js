export default response => {
  return response.headers.get('Content-Type') === 'application/json'
    ? response.json()
    : response.text()
}
