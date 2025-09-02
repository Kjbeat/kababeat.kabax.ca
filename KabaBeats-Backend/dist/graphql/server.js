"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraphQLServer = void 0;
const server_1 = require("@apollo/server");
const schema_1 = require("./schema");
const resolvers_1 = require("./resolvers");
const logger_1 = require("@/config/logger");
const createGraphQLServer = async () => {
    const server = new server_1.ApolloServer({
        typeDefs: schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        introspection: process.env.NODE_ENV !== 'production',
        formatError: (formattedError, error) => {
            logger_1.logger.error('GraphQL Error:', error);
            return {
                message: formattedError.message,
                code: formattedError.extensions?.code,
                path: formattedError.path || [],
            };
        },
    });
    return server;
};
exports.createGraphQLServer = createGraphQLServer;
//# sourceMappingURL=server.js.map