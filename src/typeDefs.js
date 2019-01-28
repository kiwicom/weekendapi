import gql from "graphql-tag"

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

  type Coords {
    lat: Float!
    lon: Float!
  }

  type Interest {
    id: String!
    img: String
    score: Float
    name: String!
    category: String
    address: String
    coords: Coords
    url: String
  }

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

  type City {
    id: String!
    name: String!
    country: String
  }

  type Location {
    id: String!
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
    id: String
    name: String
    code: String
  }

  type ServerInfo {
    platform: String
    process: String
    arch: String
    os: String
    hostname: String
    freemem: Int
    release: String
    version: String
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

  type KeyValue {
    key: String!
    value: String
  }

  type Query {
    search(params: SearchParams!): [Item]
    item(bookingToken: String!, interest: String!): Item
    interests(city: String!, country: String, interest: String!): [Interest]
    place(id: String!): Place
    locations(query: String!, limit: Int): [Location]
    cacheFiles(filter: String): [String]
    uptime: ServerInfo
    customList: [KeyValue]
  }

  type Mutation {
    changeList(key: String!, value: String): KeyValue
  }
`

export default typeDefs
