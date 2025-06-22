'use server'

// Stub function for demo purposes - no database interaction needed
// In a production app, this would interact with your database
export const newVerification = async (token: string) => {
  // For demo purposes, always return an error since we don't support email verification
  return { error: 'Email verification is not available in demo mode. Please use the demo account (demo@example.com / password123)' }
}
