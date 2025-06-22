import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { LoginSchema } from '@/schemas'

// Simple hardcoded demo account
const demoUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  // For demo purposes, we'll use plaintext password to avoid Edge Runtime issues
  // In production, this should be properly hashed and verified
  password: 'password123',
  emailVerified: new Date()
};

export default {
  providers: [
    // OAuth authentication providers
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),

    Credentials({
      async authorize(credentials) {
        const validatedFields = await LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          // Only allow the demo account to login
          if (email === demoUser.email && password === demoUser.password) {
            return demoUser
          }
        }
        return null
      }
    })
  ]
} satisfies NextAuthConfig
