"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLClient } from "graphql-request";

// res:GraphQLClientResponse<unknown> | Error
const responseMiddleware = (res: any) => {
  const errors = res?.errors || res?.response?.errors || [];
  if (errors.length) {
    errors.forEach((error: any) => {
      console.error("graphql error:", error.message);
      if (error.extensions.code === "UNAUTHENTICATED") {
        if (typeof window !== "undefined") {
          // location.href = paths.auth
        }
      }
    });
  }
};

export const graphqlClient =
  typeof window !== "undefined"
    ? new GraphQLClient(window.location.origin + process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
        responseMiddleware,
      })
    : new GraphQLClient(process.env.GRAPHQL_SERVER_ENDPOINT, {
        responseMiddleware,
      });
