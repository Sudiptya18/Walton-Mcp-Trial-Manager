import bcrypt from 'bcrypt';

const password = process.argv[2] || 'Admin@123';
const rounds = 12;
const hash = await bcrypt.hash(password, rounds);
console.log(hash);
