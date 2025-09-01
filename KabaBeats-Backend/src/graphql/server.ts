import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { logger } from '@/config/logger';

export const createGraphQLServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (formattedError, error) => {
      logger.error('GraphQL Error:', error);
      return {
        message: formattedError.message,
        code: formattedError.extensions?.code,
        path: formattedError.path || [],
      };
    },
  });

  return server;
};
