declare module "@kinde-oss/kinde-node" {
  export function createClient(
    clientId: string,
    clientSecret: string,
    issuerUrl: string,
    redirectUri: string,
    logoutRedirectUri: string
  ): {
    createUser: (params: {
      email: string;
      given_name?: string;
      family_name?: string;
    }) => Promise<{ id: string }>;
  };
}
