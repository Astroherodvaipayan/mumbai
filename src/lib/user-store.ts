// Define user type
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  emailVerified: Date | null;
  credit: number;
};

// Simple in-memory user store (in a real app, you'd use a database)
// This is just for demonstration purposes
export const users: User[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    // Password is 'password123'
    password: '$2a$10$IzkrA5OgkN.JMRkRbDMbLeU4ZSTGxZcpz3QCTc2fNO7PuXnOPcuXy',
    emailVerified: new Date(),
    credit: 10
  }
];

// Simple function to find a user by email
export const getUserByEmail = (email: string) => {
  return users.find(user => user.email === email) || null;
};

// Simple function to find a user by id
export const getUserById = (id: string) => {
  return users.find(user => user.id === id) || null;
};

// Add user function
export const addUser = (user: User) => {
  users.push(user);
  return user;
};

// Update user credit
export const updateUserCredit = (id: string, creditChange: number) => {
  const user = getUserById(id);
  if (user) {
    user.credit += creditChange;
    return user.credit;
  }
  return null;
}; 