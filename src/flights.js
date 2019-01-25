import axios from "axios"

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
        timeUtc: x.dTimeUTC
      },
      to: {
        country: x.countryTo.name,
        countryCode: x.countryTo.code,
        city: x.cityTo,
        iata: x.flyTo,
        timeLocal: x.aTime,
        timeUtc: x.aTimeUTC
      },
      parts: x.route.map(y => ({
        carrier: y.airline,
        operatingCarrier: y.operating_carrier,
        type: y.vehicle_type,
        from: {
          timeLocal: y.dTime,
          timeUtc: y.dTimeUTC,
          iata: y.flyFrom,
          city: y.cityFrom
        },
        to: {
          timeLocal: y.aTime,
          timeUtc: y.dTimeUTC,
          iata: y.flyTo,
          city: y.cityTo
        }
      }))
    }))
  }
}

export async function getFlights({
  dateFrom,
  dateTo,
  returnFrom,
  returnTo,
  flyFrom,
  flyTo,
  stopovers,
  adults,
  children,
  infants
}) {
  const params = {
    adults: adults || 1,
    children: children || 0,
    infants: infants || 0,
    v: 3,
    curr: "EUR",
    locale: "en",
    lang: "en",
    affilid: "skypicker",
    partner: "picky",
    date_from: dateFrom,
    date_to: dateTo,
    return_from: returnFrom || null,
    return_to: returnTo || null,
    fly_from: flyFrom,
    fly_to: flyTo || flyFrom,
    flight_type: "salesman"
  }

  const body = {
    via: stopovers.map(({ locations, nightsFrom, nightsTo }) => ({
      locations,
      nights_range: [nightsFrom, nightsTo]
    }))
  }

  const url = "https://api.skypicker.com/traveling_salesman"
  const { data } = await axios({ url, method: "POST", params, data: body })
  return data.data.map(mapItem)
}

export async function getFlight({ bagsCount, passengersCount, bookingToken }) {
  const params = {
    bnum: bagsCount || 1,
    pnum: passengersCount || 1,
    booking_token: bookingToken,
    v: 2,
    affily: "skypicker"
  }

  const { data } = await axios({
    url: "https://booking-api.skypicker.com/api/v0.1/check_flights",
    method: "GET",
    params
  })

  const segments = [0, ...data.segments.map(x => parseInt(x, 10))]

  const { flights } = data
  const price = data.price || data.total
  const route = segments.map((x, i, a) => {
    const dest = flights[flights.length - 1]
    const src = flights[0]
    return {
      from: {
        city: src.src_name,
        country: src.src_country,
        countryCode: src.src_country
      },
      to: {
        city: dest.src_name,
        country: dest.src_country,
        countryCode: dest.src_country
      },
      parts: flights.slice(x, a[i + 1] || flights.length).map(flight => ({
        from: {
          name: flight.src_station,
          // timeLocal: y.dTime,
          // timeUtc: y.dTimeUTC,
          // iata: y.flyFrom,
          city: flight.src_name,
          country: flight.src_country,
          countryCode: flight.src_country
        },
        to: {
          name: flight.dst_station,
          // timeLocal: y.aTime,
          // timeUtc: y.dTimeUTC,
          // iata: y.flyTo,
          city: flight.dst_name,
          country: flight.dst_country,
          countryCode: flight.dst_country
        }
      }))
    }
  })

  return { bookingToken, price, route }
}
