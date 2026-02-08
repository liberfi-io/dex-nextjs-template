import { AuthenticationClient } from "auth0";

export const auth0Client = new AuthenticationClient({
  domain: process.env.DEX_AUTH0_DOMAIN,
  clientId: process.env.DEX_AUTH0_CLIENT_ID,
  clientSecret: process.env.DEX_AUTH0_CLIENT_SECRET,
});
