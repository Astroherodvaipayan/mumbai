import NextAuth from 'next-auth'
import authConfig from './auth.config'

// auth
export const {
  handlers: { GET, POST },

  auth, // This auth thing helps us get user info such as for display certain content for them and specific data
  signIn,
  signOut
} = NextAuth({
  // if there is an error, redirect to this page
  pages: {
    signIn: '/login',
    error: '/error'
  },
  // events to get emailverfiied if the user used Oauth
  events: {
    async linkAccount({ user }) {
      // We'll handle this differently without Prisma
      console.log("Account linked for user:", user.id);
    }
  },
  // Callbacks allow us to customuzie the auth process such as who has access to what, get ID, and block users.
  callbacks: {
    // sign in
    async signIn({ user, account }) {
      // Allow OAuth without verification
      if (account?.provider !== 'credentials') return true

      // For credentials provider, we'll assume the user is verified
      return true
    },
    // token & session
    async session({ session, token }) {
      // if they have an id (sub) and user has been created, return it
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      return session
    },

    // jwt
    async jwt({ token }) {
      return token
    }
  },
  session: { strategy: 'jwt' },
  ...authConfig
})
