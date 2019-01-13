import gql from 'graphql-tag'
import { ApolloServer } from 'apollo-server'

import { getLocations } from './locations'
import { getFlights, getFlight } from './flights'
import { getInterests } from './interests'

const PORT = 3123

const typeDefs = gql`
  type PartRendezvous {
    country: String
    city: String
    iata: String
    timeLocal: Int
    timeUtc: Int
  }

  type Part {
    type: String
    carrier: String
    operatingCarrier: String
    from: PartRendezvous
    to: PartRendezvous
  }

  type RouteRendezvous {
    country: String
    countryCode: String
    city: String
    iata: String
    timeLocal: Int
    timeUtc: Int
  }

  type Interest {
    img: String
    score: String
    name: String
    category: String
    address: String
  }

  type Route {
    from: RouteRendezvous
    to: RouteRendezvous
    parts: [Part]
    interests: [Interest]
  }

  type Item {
    price: Int
    bookingToken: String
    route: [Route]
  }

  type Coords {
    lat: Float
    lon: Float
  }

  type Location {
    id: String
    iid: Int
    code: String
    coords: Coords
    slug: String
    timezone: String
    type: String
  }

  input Stopover {
    locations: [String]
    nightsFrom: Int
    nightsTo: Int
  }

  input SearchParams {
    adults: Int
    children: Int
    infants: Int
    dateFrom: String!
    dateTo: String!
    returnFrom: String
    returnTo: String
    flyFrom: String!
    flyTo: String
    stopovers: [Stopover!]!
  }

  type Query {
    search(params: SearchParams!): [Item]
    item(bookingToken: String!, interest: String!): Item
    locations(query: String!): [Location]
  }
`

const resolvers = {
  Query: {
    search: (_, { params }) => getFlights(params),
    item: async (_, { bookingToken, interest }) => {
      const trip = await getFlight({ bookingToken })

      return {
        ...trip,
        route: await Promise.all(
          trip.route.map(async (route) => {
            const { parts } = route
            const { to } = parts[parts.length - 1]

            return {
              ...route,
              interests: await getInterests(`${to.city}, ${to.country}`, interest),
            }
          })
        )
      }
    },
    locations: (_, { query }) => getLocations(query),
  },
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen(PORT).then((info) => {
  console.log('Server started at', info.url)
})
