import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "sdvsd",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "sdvsd",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "sdvsd",
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        // Có thể mã hóa token chuyển qua Backend nếu làm Authorize sâu hơn
      }
      return session;
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
