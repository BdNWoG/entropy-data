import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt", 
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tier = "free"; 
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.tier = token.tier as string;
      }
      return session;
    },
  }
};

export default NextAuth(authOptions);
