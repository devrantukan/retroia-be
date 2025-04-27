"use server";

async function getM2MToken() {
  try {
    const response = await fetch(
      `${process.env.KINDE_ISSUER_URL}/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.KINDE_M2M_CLIENT_ID!,
          client_secret: process.env.KINDE_M2M_CLIENT_SECRET!,
          audience: `${process.env.KINDE_ISSUER_URL}/api`,
          scope: "create:users read:users",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get M2M token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting M2M token:", error);
    throw error;
  }
}

export async function createKindeUser(
  email: string,
  name: string,
  surname: string
) {
  try {
    const token = await getM2MToken();

    const response = await fetch(
      `${process.env.KINDE_ISSUER_URL}/api/v1/user`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: {
            given_name: name,
            family_name: surname,
          },
          identities: [
            {
              type: "email",
              is_verified: true,
              details: {
                email: email,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Kinde user: ${error}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Error creating Kinde user:", error);
    throw error;
  }
}
