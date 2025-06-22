'use server'
import * as z from 'zod'
import { LoginSchema } from '@/schemas'
import { signIn } from '../../auth'
import { AuthError } from 'next-auth'

// Demo user credentials for reference
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';

export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validate fields
  const validatedFields = LoginSchema.safeParse(values)

  // If fields are not valid
  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }
  
  // If fields are valid
  const { email, password } = validatedFields.data
  
  // Provide hint for demo account
  if (email !== DEMO_EMAIL) {
    return { error: `For demo purposes, please use ${DEMO_EMAIL}` }
  }

  try {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    })

    if (result?.error) {
      return { error: `Invalid credentials. Try password: ${DEMO_PASSWORD}` }
    }

    return { success: 'Logged In!' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: `Invalid credentials. Try password: ${DEMO_PASSWORD}` }
        default:
          return { error: 'Something went wrong' }
      }
    }
    throw error
  }
}
