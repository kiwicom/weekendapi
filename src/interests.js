import { setup } from 'axios-cache-adapter'
import cheerio from "cheerio"
import jsonframe from "jsonframe-cheerio"


const api = setup({
  // `axios` options
  baseURL: 'https://foursquare.com/explore',
  cache: {
    maxAge: 15 * 60 * 1000
  }
})

export async function getInterests(near, category) {
  const params = {
    near,
    cat: category
  }

  const { data } = await api.get("https://foursquare.com/explore?" + JSON.stringify(params))

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

  return items.map(x => {
    const id = x.href.split("/").pop()

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
