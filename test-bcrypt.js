// Test script to verify bcrypt hash
import bcrypt from 'bcryptjs';

const password = 'password123';
const hashedPassword = '$2a$10$IzkrA5OgkN.JMRkRbDMbLeU4ZSTGxZcpz3QCTc2fNO7PuXnOPcuXy';

// Test if the hash matches the password
bcrypt.compare(password, hashedPassword)
  .then(result => {
    console.log('Does the password match the hash?', result);
    
    if (!result) {
      // If it doesn't match, generate a new hash for reference
      return bcrypt.hash(password, 10).then(newHash => {
        console.log('New hash for password123:', newHash);
      });
    }
  })
  .catch(err => {
    console.error('Error:', err);
  }); 