import { ApolloServer } from "apollo-server-express";
import resolvers from "./graphql/resolvers/index.js";
import typeDefs from "./graphql/typeDefs.js";
import express from "express";
import jwt from "jsonwebtoken";
import { contextMiddleware } from "./utils/contextMiddleware.js";
import { subscriptionContextMiddleware } from "./utils/subscriptionContextMiddleware.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import "dotenv/config";

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: subscriptionContextMiddleware,
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: contextMiddleware,
    cache: "bounded",
    // csrfPrevention: true,
    // introspection: false,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  app.use(express.json());

  app.get("/verify", (req, res) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    // @ts-ignore
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      //NOTE throw error if not valid token
      if (err) return res.status(401).json({ msg: "Unauthorized" });
      res.status(200).json({ msg: "Authorized", user: decoded });
    });
  });

  httpServer.listen(process.env.PORT, () => {
    console.log(`🚀 Server ready at ${process.env.PORT}`);
  });
}

startServer();
