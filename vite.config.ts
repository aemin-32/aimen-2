import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // تحميل ملفات البيئة (Env) بناءً على الـ mode
  const env = loadEnv(mode, (process as any).cwd(), '');

  // 💡 الجزء الذكي: يكتشف اسم المستودع تلقائياً من بيئة GitHub
  const repoName = process.env.GITHUB_REPOSITORY 
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` 
    : '/';
  
  return {
    // نستخدم repoName الديناميكي بدلاً من المسار الثابت
    base: mode === 'production' ? repoName : '/',
    
    plugins: [react()],
    
    define: {
      // تمرير مفتاح الـ API لـ Gemini بكلا الاسمين للاحتياط
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || '')
    },
    
    server: {
      host: true, // يسمح لك بفتح التطبيق من موبايلك عبر الـ IP
      port: 3000,
    }
  }
})
