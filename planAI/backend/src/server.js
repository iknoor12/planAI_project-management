import dotenv from 'dotenv';

dotenv.config();

const { default: app } = await import('./app.js');
const { default: connectDB } = await import('./config/db.js');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
