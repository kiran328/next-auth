import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import connectToDB from "./../../../lib/db";
import { verifyPassword } from "../../../lib/auth";

export const authOptions = {
  session: {
    jwt: true,
  },
  secret: "secret",
  providers: [
    Credentials({
      async authorize(credentials) {
        const client = await connectToDB();
        const user = await client.db().collection("users").findOne({
          email: credentials.email,
        });
        if (!user) {
          client.close();
          throw new Error("No user found");
        }
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) {
          client.close();
          throw new Error("Invalid password");
        }
        client.close();
        return { email: user.email };
      },
    }),
  ]
};

export default NextAuth(authOptions);
