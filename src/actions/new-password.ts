'use server'
import * as z from 'zod'
import { NewPasswordSchema } from '@/schemas'

// Stub function for demo purposes - no database interaction needed
// In a production app, this would interact with your database
export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  // For demo purposes, always return an error since we don't support password reset
  return { error: 'Password reset is not available in demo mode. Please use the demo account (demo@example.com / password123)' }
}
