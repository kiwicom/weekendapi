import gql from 'graphql-tag'
import { ApolloServer } from 'apollo-server'

import { search } from './nomad'

const PORT = 3123

const typeDefs = gql`
  type PartRendezvous {
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

  type Route {
    from: RouteRendezvous
    to: RouteRendezvous
    parts: [Part]
  }

  type Item {
    price: Int
    bookingToken: String
    route: [Route]
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
    item: Item
  }
`

const resolvers = {
  Query: {
    search: (_, { params }) => search(params),
    item: (_, args) => {
      return {}
    },
  },
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen(PORT).then((info) => {
  console.log('Server started at', info.url)
})
