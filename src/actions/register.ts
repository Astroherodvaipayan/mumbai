'use server'
import * as z from 'zod'
import { RegisterSchema } from '@/schemas'

// Demo user credentials for reference
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  // For demo purposes, we'll just return a message about using the demo account
  return { 
    success: `Registration is disabled in demo mode. Please use the demo account instead: 
    Email: ${DEMO_EMAIL}
    Password: ${DEMO_PASSWORD}`
  }
}
