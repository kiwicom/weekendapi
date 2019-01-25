import { ApolloServer } from "apollo-server"

import { getLocations } from "./locations"
import { getPlace } from "./getPlace"
import { getFlights, getFlight } from "./flights"
import { getInterests } from "./interests"
import typeDefs from "./typeDefs"

const PORT = process.env.PORT || 3123

const resolvers = {
  Query: {
    search: (_, { params }) => getFlights(params),
    interests: async (_, { city, country, interest }) => {
      return await getInterests(`${city}, ${country}`, interest)
    },
    item: async (_, { bookingToken, interest }) => {
      const trip = await getFlight({ bookingToken })

      return {
        ...trip,
        route: await Promise.all(
          trip.route.map(async route => {
            const { parts } = route
            const destination = parts[parts.length - 1].to

            const destinationSearch = `${destination.city}, ${
              destination.country
            }`
            const interests = await getInterests(destinationSearch, interest)
            return {
              interests,
              ...route,
              destination
            }
          })
        )
      }
    },
    locations: (_, { query, limit }) => getLocations(query, limit),
    place: (_, { id, limit }) => getPlace(id, limit)
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen(PORT).then(info => {
  console.log("Server started at", info.url)
})
