import fs from "fs"
import os from "os"
import { ApolloServer } from "apollo-server"

import { getLocations } from "./locations"
import { getPlace } from "./getPlace"
import { getFlights, getFlight } from "./flights"
import { getInterests } from "./interests"
import typeDefs from "./typeDefs"

const PORT = process.env.PORT || 3123

const myList = { foo: "bar", baz: 42 }

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
    place: (_, { id, limit }) => getPlace(id, limit),
    cacheFiles: (_, { filter = "" }) => {
      const dirs = fs.readdirSync("node_modules")
      return dirs.filter(name => !filter || name.indexOf(filter) !== -1)
    },
    uptime: () => {
      return {
        process: process.uptime(),
        platform: os.platform(),
        arch: os.arch(),
        os: os.uptime(),
        hostname: os.hostname(),
        freemem: os.freemem(),
        release: os.release(),
        version: require("../package.json").version
      }
    },
    customList: _ =>
      Object.entries(myList).map(([key, value]) => ({
        key,
        value
      }))
  },

  Mutation: {
    changeList: (_, { key = "key", value = "" }) => {
      myList[key] = value
      return { key, value }
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen(PORT).then(info => {
  console.log("Server started at", info.url)
})
