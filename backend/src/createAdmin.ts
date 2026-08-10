import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User';

dotenv.config();

const createOrUpdateAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/boardflow';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    const email = 'lazaromuro@gmail.com';
    const plainPassword = 'muro2548';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    let user = await User.findOne({ email });

    if (user) {
      // Update existing user to be admin
      user.role = 'admin';
      user.password = hashedPassword;
      await user.save();
      console.log(`User ${email} updated successfully to ADMIN!`);
    } else {
      // Create new admin user
      user = new User({
        firstName: 'Lazaro',
        lastName: 'Muro',
        dateOfBirth: new Date('1990-01-01'),
        contact: '0755555555', // 10 digits
        email: email,
        password: hashedPassword,
        role: 'admin'
      });
      await user.save();
      console.log(`Admin user ${email} created successfully!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createOrUpdateAdmin();
