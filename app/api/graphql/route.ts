import { NextRequest } from "next/server";
import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "@/core/adapters/graphql/schema";
import { resolvers } from "@/core/adapters/graphql/resolvers";

const { handleRequest } = createYoga<{
  req: NextRequest;
}>({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});

export async function GET(request: NextRequest) {
  return handleRequest(request, { req: request });
}

export async function POST(request: NextRequest) {
  return handleRequest(request, { req: request });
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, { req: request });
}
