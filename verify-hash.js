// Script to verify the new hash
import bcrypt from 'bcryptjs';

const password = 'password123';
const hashedPassword = '$2a$10$b4xpEV4gaLg50YYmqiMS9.n1xEVOPm4AwssEd9XMMhs2XSyVp4JIe';

// Test if the hash matches the password
bcrypt.compare(password, hashedPassword)
  .then(result => {
    console.log('Does the password match the new hash?', result);
  })
  .catch(err => {
    console.error('Error:', err);
  }); 