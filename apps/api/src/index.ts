import App from './app';

// Buat instance sekali
const app = new App();

// 🚀 Export Express app langsung (Vercel akan bungkus jadi handler)
export default app.getApp();
