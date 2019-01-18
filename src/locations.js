// https://docs.kiwi.com/locations/#locations-collection-get

import axios from "axios"

export async function getLocations(term, limit = 50) {
  console.log("limit", limit)
  const params = {
    limit,
    term,
    locale: "en-GB",
    "X-Client": "frontend"
  }

  const { data } = await axios.get("https://api.skypicker.com/locations/", {
    params
  })

  return data.locations.map(x => ({
    ...x,
    iid: x.int_id,
    coords: x.location,
    city: x.city && {
      ...x.city,
      country: x.city.country && x.city.country.id
    }
  }))
}
