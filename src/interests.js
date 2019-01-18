import axios from 'axios'
import cheerio from 'cheerio'
import jsonframe from 'jsonframe-cheerio'

export async function getInterests(near, category) {
  const params = {
    near,
    cat: category,
  }

  const { data } = await axios.get('https://foursquare.com/explore', { params })
  const $ = cheerio.load(data)

  jsonframe($)

  const frame = {
    items: {
      _s: '#results .singleRecommendation',
      _d: [{
        img: '.photo',
        score: '.venueScore',
        name: '.venueName a',
        href: '.venueName a @ href',
        category: '.venueData .categoryName',
        address: '.venueAddress',
      }]
    },
  }

  const { items } = $('body').scrape(frame)

  const script = $('script').map(function () {
    return $(this).html()
  }).toArray().filter(x => x.startsWith('fourSq.config.explore = {};'))[0]

  const parsedObject = script.split('fourSq.config.explore')
    .filter(x => x.startsWith('.response'))[0]
    .replace(/^\.response = /, '').replace(/;$/, '')

  const { results } = JSON.parse(parsedObject).group

  return items.map(x => {
    const id = x.href.match(/(\w)*$/)[0]

    const { venue } = results.find(y => y.venue.id === id)
    const { location } = venue

    const coords = {
      lat: location.lat,
      lon: location.lng,
    }

    return { ...x, id, coords }
  })
}
