import gql from "graphql-tag"

const typeDefs = gql`
# location
  type PartRendezvous {
    country: String
    city: String
    iata: String
    timeLocal: Int
    timeUtc: Int
  }
# one trip segment
  type Part {
    type: String
    carrier: String
    operatingCarrier: String
    from: PartRendezvous
    to: PartRendezvous
  }
# single destination data
  type RouteRendezvous {
    country: String
    countryCode: String
    city: String
    iata: String
    timeLocal: Int
    timeUtc: Int
  }
# coordinates
  type Coords {
    lat: Float!
    lon: Float!
  }
# single interest
  type Interest {
    id: ID!
    img: String
    score: Float
    name: String!
    category: String
    address: String
    coords: Coords
    url: String
  }
# Single TripSector
  type Route {
    destination: RouteRendezvous
    from: RouteRendezvous
    to: RouteRendezvous
    parts: [Part]
    interests: [Interest]
  }

  type Item {
    price: Float
    bookingToken: String
    route: [Route]
  }
# City
  type City {
    id: ID!
    name: String!
    country: String
  }
# Single Location
  type Location {
    id: ID!
    iid: Int
    code: String
    coords: Coords!
    name: String
    slug: String
    timezone: String
    type: String
    city: City
  }

  type Place {
    id: ID
    name: String
    code: String
  }

	# Layover between TripSegments (parts)
  input Stopover {
    locations: [String]
    nightsFrom: Int
    nightsTo: Int
  }
# Searching parameters
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
    interests(city: String!, country: String, interest: String!): [Interest]
    place(id: String!): Place
    locations(query: String!, limit: Int): [Location]
  }
`

export default typeDefs
