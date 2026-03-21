const CLIENT_SETTINGS_ENDPOINT = '/api/client/settings'

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    },
    credentials: 'same-origin',
    ...options
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  return response.json()
}

export const apiEndpoints = {
  client: {
    settings: CLIENT_SETTINGS_ENDPOINT
  }
}

export const apiClient = {
  getClientSettings() {
    return requestJson(apiEndpoints.client.settings)
  }
}
