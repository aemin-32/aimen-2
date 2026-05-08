# دليل ربط Google Calendar 🗓️

لتمكين مزامنة Ascension مع تقويم Google، يجب عليك إعداد مشروع في Google Cloud والحصول على مفاتيح API.

## الخطوة 1: إعداد مشروع Google Cloud
1.  اذهب إلى [Google Cloud Console](https://console.cloud.google.com/).
2.  أنشئ مشروعاً جديداً (New Project).
3.  من القائمة الجانبية، اختر **APIs & Services** > **Library**.
4.  ابحث عن **"Google Calendar API"** وقم بتفعيلها (Enable).

## الخطوة 2: إعداد شاشة الموافقة (OAuth Consent Screen)
1.  اذهب إلى **APIs & Services** > **OAuth consent screen**.
2.  اختر **External**.
3.  املأ البيانات المطلوبة (اسم التطبيق، الإيميل).
4.  في خطوة **Scopes**، أضف النطاق التالي:
    *   `https://www.googleapis.com/auth/calendar.events`
5.  في خطوة **Test Users**، أضف بريدك الإلكتروني (لأن التطبيق في وضع الاختبار).

## الخطوة 3: الحصول على المفاتيح (Credentials)
1.  اذهب إلى **APIs & Services** > **Credentials**.
2.  اضغط **Create Credentials** > **OAuth client ID**.
3.  اختر **Web application**.
4.  في **Authorized JavaScript origins**، أضف رابط التطبيق الخاص بك (الموجود في المتصفح).
5.  اضغط Create.
6.  انسخ **Client ID**.
7.  (اختياري) أنشئ **API Key** من نفس الصفحة.

## الخطوة 4: تفعيل الكود
1.  افتح ملف `src/services/googleCalendarService.ts`.
2.  استبدل `YOUR_GOOGLE_CLIENT_ID_HERE` بالرقم الذي نسخته.
3.  استبدل `YOUR_GOOGLE_API_KEY_HERE` بمفتاح الـ API.

## الخطوة 5: الاستخدام
1.  اذهب إلى إعدادات Ascension.
2.  اضغط زر **"Connect Google Calendar"**.
3.  سجل الدخول بحساب Google ووافق على الصلاحيات.
4.  اضغط **"Sync Now"**.
5.  سيتم إنشاء تقويم جديد باسم **"Ascension Protocol"** يحتوي على جميع مهامك وعاداتك.

---
*تم إعداد هذا الدليل بواسطة نظام Zayn2 للمزامنة.*
