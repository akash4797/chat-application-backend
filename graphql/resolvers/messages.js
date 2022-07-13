import db from "../../db/db.js";
import { UserInputError, AuthenticationError } from "apollo-server-express";
import { PubSub, withFilter } from "graphql-subscriptions";

const pubsub = new PubSub();

export default {
  Query: {
    getMessages: async (_, args, { user }) => {
      const { from } = args.input;
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        const otherUser = await db.user.findUnique({
          where: {
            username: from,
          },
        });

        if (!otherUser) throw new UserInputError("User not found");

        const messages = await db.message.findMany({
          where: {
            AND: [
              {
                OR: [
                  {
                    from: user.username,
                  },
                  {
                    from: otherUser.username,
                  },
                ],
              },
              {
                OR: [
                  {
                    to: user.username,
                  },
                  {
                    to: otherUser.username,
                  },
                ],
              },
            ],
          },
          orderBy: [
            {
              createdAt: "desc",
            },
          ],
        });

        return messages;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    //SECTION send Message
    sendMessage: async (_, args, { user }) => {
      const { to, content } = args.userinput;
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const recipent = await db.user.findUnique({
          where: {
            username: to,
          },
        });

        if (!recipent) throw new UserInputError("User Not Found");

        if (recipent.username === user.username)
          throw new UserInputError("Cannot message yourself");

        if (content.trim() === "")
          throw new UserInputError("Content cannot be empty");

        const message = await db.message.create({
          data: {
            from: user.username,
            to,
            content,
          },
        });

        pubsub.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (error) {
        throw error;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { user }) => {
          try {
            if (!user) throw new AuthenticationError("Unauthenticated");
            return pubsub.asyncIterator(["NEW_MESSAGE"]);
          } catch (error) {
            throw error;
          }
        },
        ({ newMessage }, _, { user }) => {
          if (
            newMessage.from === user.username ||
            newMessage.to === user.username
          ) {
            return true;
          }
          return false;
        }
      ),
    },
  },
};
