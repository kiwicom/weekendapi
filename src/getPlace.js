// https://docs.kiwi.com/locations/#locations-collection-get

import axios from "axios"

export async function getPlace(id, limit = 50) {
  const params = {
    limit,
    id,
    locale: "en-GB",
    type: "id",
  }

  const { data } = await axios.get("https://api.skypicker.com/locations/", {
    params
  })

  const location = data.locations[0];

  return ({
    id: location.id,
    name: location.name,
    code: location.code
  })
}
