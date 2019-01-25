import axios from "axios"
import { cacheAdapterEnhancer, Cache } from "axios-extensions"
import cheerio from "cheerio"
import jsonframe from "jsonframe-cheerio"

const https = axios.create({
  baseURL: "https://foursquare.com",
  headers: { "Cache-Control": "no-cache" },
  adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
    enabledByDefault: true,
    defaultCache: new Cache({ maxAge: 1000 * 60 * 60 * 24, max: 200 })
  })
})

export async function getInterests(near, category) {
  const params = {
    near,
    cat: category
  }

  const { data } = await https.get("/explore", { params })

  const $ = cheerio.load(data)
  jsonframe($)

  const frame = {
    items: {
      _s: "#results .singleRecommendation",
      _d: [
        {
          img: ".photo",
          score: ".venueScore",
          name: ".venueName a",
          href: ".venueName a @ href",
          category: ".venueData .categoryName",
          address: ".venueAddress"
        }
      ]
    }
  }

  const { items } = $("body").scrape(frame)

  const script = $("script")
    .map(function() {
      return $(this).html()
    })
    .toArray()
    .filter(x => x.startsWith("fourSq.config.explore = {};"))[0]

  const parsedObject = script
    .split("fourSq.config.explore")
    .filter(x => x.startsWith(".response"))[0]
    .replace(/^\.response = /, "")
    .replace(/;$/, "")

  const { results } = JSON.parse(parsedObject).group
  const venues = results.filter(y => y.venue)

  // console.log("venues", venues)

  return items.map(x => {
    const id = x.href
      .split("/")
      .pop()
      .split("?")[0] //id sometimes look like '513db9c4e4b0f8b10ae4a2a3?promotedTipId=5c4b092d4c954c0d9197cebf'

    const {
      venue: {
        location: { lat, lng },
        canonicalUrl: url,
        rating: score
      }
    } = venues.find(y => y.venue.id === id)

    return { ...x, id, url, score, coords: { lat, lon: lng } }
  })
}
