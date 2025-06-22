// Define user type
type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
};

// Simple in-memory user store (in a real app, you'd use a database)
// This is just for demonstration purposes
const users: User[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    // Password is 'password123'
    password: '$2a$10$IzkrA5OgkN.JMRkRbDMbLeU4ZSTGxZcpz3QCTc2fNO7PuXnOPcuXy',
    emailVerified: new Date()
  }
];

export const getUserByEmail = async (email: string) => {
  try {
    const user = users.find(u => u.email === email) || null;
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = users.find(u => u.id === id) || null;
    return user;
  } catch {
    return null;
  }
};
