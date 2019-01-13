import axios from 'axios'

export async function getLocations(query) {
  const params = {
    limit: 50,
    locale: 'en-GB',
    term: query,
    'X-Client': 'frontend',
  }

  const { data } = await axios.get(
    'https://api.skypicker.com/locations/',
    { params },
  )

  return data.locations.map(x => ({ ...x, iid: x.int_id, coords: x.location }))
}
