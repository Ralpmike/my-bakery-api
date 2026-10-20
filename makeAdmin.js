// Usage: node makeAdmin.js <email>
// Gives an already-registered user the admin role (needed to create, edit or delete products)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/userModel');

const makeAdmin = async () => {
    const email = process.argv[2];
    if (!email) {
        console.error('Usage: node makeAdmin.js <email>');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { role: 'admin' }, { returnDocument: 'after' });
        if (!user) {
            console.error(`No user registered with ${email}. Sign up first, then run this again.`);
            process.exit(1);
        }
        console.log(`${user.email} is now an admin.`);
        process.exit(0);
    } catch (error) {
        console.error('Failed:', error);
        process.exit(1);
    }
};

makeAdmin();
