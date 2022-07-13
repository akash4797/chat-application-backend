import users from "./users.js";
import messages from "./messages.js";

export default {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  User: {
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },
  Query: {
    ...users.Query,
    ...messages.Query,
  },
  Mutation: {
    ...users.Mutation,
    ...messages.Mutation,
  },
  Subscription: {
    ...messages.Subscription,
  },
};
