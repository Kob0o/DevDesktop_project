const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
  googleClientId: process.env.VITE_GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY
}; 