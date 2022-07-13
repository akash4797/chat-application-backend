import { gql } from "apollo-server-express";

export default gql`
  #SECTION for global use
  type User {
    id: String
    username: String!
    email: String
    imageurl: String
    updatedAt: String!
    token: String
    latestMessage: Message
  }
  type Message {
    id: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }

  #SECTION for query
  input LoginInput {
    username: String!
    password: String!
  }
  input GetMessageInput {
    from: String!
  }

  #SECTION for Mutation
  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }
  input SendMessage {
    to: String!
    content: String!
  }

  #SECTION main
  type Query {
    getUsers: [User]!
    login(userinput: LoginInput): User!
    getMessages(input: GetMessageInput): [Message]!
  }
  type Mutation {
    register(userinput: RegisterInput): User!
    sendMessage(userinput: SendMessage): Message!
  }
  type Subscription {
    newMessage: Message!
  }
`;
