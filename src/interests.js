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
        category: '.venueData .categoryName',
        address: '.venueAddress',
      }]
    }
  }

  const { items } = $('body').scrape(frame)

  return items
}
