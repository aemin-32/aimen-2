
# 🚀 دليل زين الشامل (Project Ascension) - الدليل الكامل

هذا الملف هو مرجعك الوحيد. اتبع الخطوات حرفياً ولن تواجه أي مشكلة بإذن الله.

---

## 🛠️ المرحلة 1: تجهيز الأدوات والمكاتب (VS Code)

افتح مجلد المشروع في **VS Code** واضغط `Ctrl + J` لفتح الـ **Terminal**.

### 1. تثبيت كل المكاتب الضرورية (نسخ ولصق)
بدلاً من كتابة عدة أوامر، انسخ هذا الأمر وضعه في التيرمنال واضغط Enter. سيقوم بتثبيت (React, Capacitor, Gemini AI, Lucide Icons, FileSystem, Notifications):

```bash
npm install react react-dom lucide-react @google/genai @capacitor/core @capacitor/cli @capacitor/android @capacitor/filesystem @capacitor/haptics @capacitor/local-notifications @vitejs/plugin-react vite typescript
```

### 2. إضافة مفتاح الذكاء الصناعي (The Godfather)
1. في القائمة اليسرى للملفات، انقر بزر الماوس الأيمن في مكان فارغ واختر **New File**.
2. سمِّ الملف: `.env.local`
3. افتح الملف وألصق الكود التالي (تأكد من وضع مفتاحك بدلاً من `YOUR_KEY`):

```env
GEMINI_API_KEY=AIzaSyDxoKTAAOYEq9ELGGkHwPjFQ28DcJFGwbQ
```
*(ملاحظة: إذا كان لديك مفتاح خاص بك، استبدل المفتاح الموجود أعلاه)*.

### 3. بناء نسخة الويب (Build)
هذا الأمر يحول كود React إلى ملفات HTML/JS يفهمها الهاتف.
```bash
npm run build
```
*(يجب أن يظهر مجلد جديد اسمه `dist` بعد انتهاء هذا الأمر)*.

---

## 📱 المرحلة 2: إعداد الأندرويد (Capacitor)

نفذ هذه الأوامر بالترتيب في التيرمنال:

### 1. تعريف التطبيق
```bash
npx cap init Ascension com.lifeos.app --web-dir=dist
```
*(إذا سألك أي سؤال، اضغط Enter للموافقة على الافتراضي)*.

### 2. إضافة منصة الأندرويد
```bash
npx cap add android
```
*(سيظهر مجلد جديد اسمه `android` في قائمة الملفات)*.

### 3. ⚠️ تعديل الصلاحيات (أهم خطوة!)
لكي تعمل **الإشعارات** و **الذاكرة** و **الإنترنت**، يجب تعديل ملف واحد يدوياً.

1.  افتح المجلدات التالية من اليسار:
    `android` > `app` > `src` > `main` > `AndroidManifest.xml`
2.  ابحث عن السطر الذي يحتوي على `<application ...` (تقريباً السطر 15).
3.  **فوقه مباشرة**، انسخ وألصق هذه الأسطر:

```xml
<!-- ========================================== -->
<!-- 🛡️ صلاحيات زين (Ascension Permissions) 🛡️ -->
<!-- ========================================== -->

<!-- الإنترنت (للذكاء الصناعي) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- الإشعارات والتنبيهات -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

<!-- قراءة وكتابة الملفات (للحفظ والنسخ الاحتياطي) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<!-- ========================================== -->
```

### 4. تحديث ومزامنة نهائية
بعد التعديل، نفذ هذا الأمر لنقل كل التغييرات للأندرويد:
```bash
npx cap sync
```

---

## 🏗️ المرحلة 3: استخراج التطبيق (Android Studio)

### 1. فتح المشروع
```bash
npx cap open android
```
*(سيفتح برنامج Android Studio تلقائياً)*.

### 2. الانتظار (Gradle Sync) - اصبر قليلاً!
*   انظر للأسفل يميناً في Android Studio.
*   ستجد شريط تحميل ومكتوب `Gradle Sync`.
*   **لا تلمس شيئاً** حتى ينتهي التحميل وتصبح كل الأيقونات في الأعلى ملونة ومفعلة (قد تأخذ دقيقتين).

### 3. استخراج ملف الـ APK
1.  من القائمة العلوية في Android Studio، اضغط على **Build**.
2.  اختر **Build Bundle(s) / APK(s)**.
3.  اختر **Build APK(s)**.

### 4. مبروك! 🎉
*   سينتظر البرنامج قليلاً...
*   ستظهر رسالة "Pop-up" في الزاوية اليمنى السفلية تقول:
    `APK(s) generated successfully ...`
*   اضغط على كلمة **locate** الملونة بالأزرق في تلك الرسالة.
*   سيفتح لك المجلد ومعه ملف `app-debug.apk`.

انقل هذا الملف لموبايلك، وثبته، واستمتع بـ **Ascension**!
