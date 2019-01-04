import axios from 'axios'

function mapItem({ price, booking_token, route }) {
  return {
    price,
    bookingToken: booking_token,
    route: route.map(x => ({
      from: {
        country: x.countryFrom.name,
        countryCode: x.countryFrom.code,
        city: x.cityFrom,
        iata: x.flyFrom,
        timeLocal: x.dTime,
        timeUtc: x.dTimeUTC,
      },
      to: {
        country: x.countryTo.name,
        countryCode: x.countryTo.code,
        city: x.cityTo,
        iata: x.flyTo,
        timeLocal: x.aTime,
        timeUtc: x.aTimeUTC,
      },
      parts: x.route.map(y => ({
        carrier: y.airline,
        operatingCarrier: y.operating_carrier,
        type: y.vehicle_type,
        from: {
          timeLocal: y.dTime,
          timeUtc: y.dTimeUTC,
          iata: y.flyFrom,
          city: y.cityFrom,
        },
        to: {
          timeLocal: y.aTime,
          timeUtc: y.dTimeUTC,
          iata: y.flyTo,
          city: y.cityTo,
        }
      }))
    })),
  }
}

export async function search({
  dateFrom, dateTo,
  returnFrom, returnTo,
  flyFrom, flyTo,
  stopovers,
  adults, children, infants
}) {
  const params = {
    adults: adults || 1,
    children: children || 0,
    infants: infants || 0,
    v: 3,
    curr: 'EUR',
    locale: 'en',
    lang: 'en',
    affilid: 'skypicker',
    partner: 'picky',
    date_from: dateFrom,
    date_to: dateTo,
    return_from: returnFrom || null,
    return_to: returnTo || null,
    fly_from: flyFrom,
    fly_to: flyTo || null,
    flight_type: 'salesman',
  }

  const body = {
    via: stopovers.map(
      ({ locations, nightsFrom, nightsTo }) =>
        ({ locations, nights_range: [nightsFrom, nightsTo] })
    )
  }

  const url = 'https://api.skypicker.com/traveling_salesman'
  const { data } = await axios({ url, method: 'POST', params, data: body })

  return data.data.map(mapItem)
}
