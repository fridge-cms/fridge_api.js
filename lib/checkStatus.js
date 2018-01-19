export default async response => {
  if (response.status >= 200 && response.status < 300) return

  // A 404 doesn't need to throw an error
  // if (response.status === '404') return

  const {err: {code, message}} = await response.json()
  const err = new Error(`Code: ${code} Message: ${message}`)
  err.statusCode = response.status
  err.response = response

  throw err
}
