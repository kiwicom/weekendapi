// https://docs.kiwi.com/locations/#locations-collection-get

import axios from "axios"

export async function getPlace(id, limit = 50) {
  const params = {
    limit,
    id,
    locale: "en-GB",
    type: "id",
    "X-Client": "frontend"
  }

  const { data } = await axios.get("https://api.skypicker.com/locations/", {
    params
  })

  return data.locations.map(x => ({
    id: x.id,
    name: x.name
  }))
}
