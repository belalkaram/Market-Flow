# نموذج التهديدات الأمنية — MarketFlow ERP

**الإصدار:** 1.0  
**التاريخ:** مايو 2025  
**المعيار:** OWASP Threat Modeling + STRIDE

---

## 1. الأصول المحمية (Assets)

| الأصل | مستوى الحساسية | الوصف |
|---|---|---|
| بيانات الشركات والمتاجر | حرج | معلومات تجارية سرية، بيانات اشتراك |
| بيانات الفروع | عالي | معلومات تشغيلية لكل فرع |
| بيانات الموظفين | حرج | رواتب، صلاحيات، بيانات شخصية |
| فواتير البيع | حرج | سجلات مالية كاملة |
| المرتجعات | عالي | عمليات مالية عكسية قابلة للاستغلال |
| بيانات المخزون | عالي | قيم سلع وكميات |
| بيانات الموردين والعملاء | متوسط | جهات الاتصال والحسابات |
| المصروفات والحسابات | حرج | بيانات مالية حساسة |
| التقارير المالية | حرج | ملخصات مالية شاملة |
| تذاكر الدعم الفني | متوسط | مشكلات مستخدمين وملفات مرفقة |
| سجلات النشاط | متوسط | مسار العمليات والتدقيق |
| إعدادات النظام | عالي | ضريبة، طباعة، WhatsApp، بيع بدون مخزون |
| حسابات السوبر أدمن | حرج | وصول كامل لجميع البيانات |
| كلمات المرور ومعرّفات الجلسة | حرج | JWT tokens وهاشات كلمات المرور |

---

## 2. الجهات الفاعلة (Actors)

| الجهة | مستوى الثقة | الوصف |
|---|---|---|
| Super Admin | مرتفع | وصول كامل للمنصة |
| Company Owner (مالك) | مرتفع | يتحكم بمتجره بالكامل |
| Store Admin (مدير متجر) | متوسط-مرتفع | إدارة يومية للمتجر |
| Branch Manager (مدير فرع) | متوسط | إدارة فرع واحد فقط |
| Cashier (كاشير) | منخفض | POS فقط |
| Inventory Manager (مخزون) | منخفض-متوسط | إدارة مخزون الفرع |
| Accountant (محاسب) | متوسط | عرض التقارير المالية |
| Support Agent | منخفض | تذاكر الدعم المسندة له |
| Guest / مستخدم غير مسجل | صفر | لا وصول |
| المهاجم (Attacker) | معادي | يحاول اختراق النظام |

---

## 3. التهديدات الرئيسية (Threats — STRIDE)

### S — Spoofing (انتحال الهوية)

| رقم | التهديد | الاحتمال | الأثر | الضابط |
|---|---|---|---|---|
| S1 | تسجيل دخول بكلمة مرور مسروقة | متوسط | حرج | قفل الحساب بعد 5 محاولات، brute force protection |
| S2 | سرقة JWT token من localStorage | متوسط | حرج | نقل للـ Cookie + إضافة token expiry قصير |
| S3 | انتحال Super Admin session | منخفض | حرج | 2FA مطلوب، timeout قصير، إعادة مصادقة للعمليات الخطيرة |
| S4 | تزوير branchId/tenantId في الـ request | متوسط | عالي | التحقق من الملكية في كل query |

### T — Tampering (التلاعب بالبيانات)

| رقم | التهديد | الاحتمال | الأثر | الضابط |
|---|---|---|---|---|
| T1 | تعديل سعر المنتج من DevTools | عالي | حرج | السيرفر يعيد حساب الأسعار من DB |
| T2 | تعديل كمية المرتجع لتتجاوز الأصلية | متوسط | عالي | التحقق من الكميات في السيرفر |
| T3 | تعديل Role أو Permission من API body | متوسط | حرج | Mass assignment protection، whitelist فقط |
| T4 | التلاعب في رسالة WhatsApp قبل الإرسال | عالي | متوسط | بناء الرسالة من السيرفر |
| T5 | تعديل بيانات فاتورة بعد إصدارها | منخفض | حرج | عدم السماح بالتعديل بعد الإنشاء |
| T6 | حقن SQL عبر معاملات الـ URL | منخفض | حرج | استخدام Drizzle ORM (parameterized queries) |

### R — Repudiation (الإنكار)

| رقم | التهديد | الاحتمال | الأثر | الضابط |
|---|---|---|---|---|
| R1 | موظف ينكر عملية مالية | متوسط | عالي | Activity Logs شاملة مع IP وUserAgent |
| R2 | كاشير ينكر مرتجعاً | متوسط | عالي | تسجيل cashierId، branchId، timestamp |
| R3 | Super Admin ينكر عملية حساسة | منخفض | حرج | Platform Audit Logs لكل عملية |

### I — Information Disclosure (تسريب المعلومات)

| رقم | التهديد | الاحتمال | الأثر | الضابط |
|---|---|---|---|---|
| I1 | تسريب بيانات متجر آخر عبر IDOR | عالي | حرج | Tenant scope في كل query |
| I2 | إرجاع passwordHash في response | متوسط | حرج | DTO — لا ترجع الحقول الحساسة أبداً |
| I3 | ظهور stack trace في production | عالي | متوسط | Error handler يخفي التفاصيل التقنية |
| I4 | فضح Connection String أو Secrets | منخفض | حرج | env variables فقط، System Health لا يعرض secrets |
| I5 | تسريب Activity Logs لمتجر آخر | متوسط | عالي | Tenant scope في جميع queries السجلات |

### D — Denial of Service (الحرمان من الخدمة)

| رقم | التهديد | الاحتمال | الأثر | الضابط |
|---|---|---|---|---|
| D1 | Brute force على Login | عالي | متوسط | Rate limiting + Account lockout |
| D2 | Flood على Report Export | متوسط | متوسط | Rate limiting (5 مرات / 10 دقائق) |
| D3 | رفع ملفات ضخمة | متوسط | متوسط | حد أقصى للحجم + نوع الملف |

### E — Elevation of Privilege (رفع الصلاحيات)

| رقم | التهديد | الاحتمال | الأثر | الضابط |
|---|---|---|---|---|
| E1 | كاشير يصل لصفحة التقارير | عالي | عالي | Route guards + API permission check |
| E2 | Branch Manager يرى فرع آخر | عالي | عالي | Branch scope في كل query |
| E3 | Owner يصل لـ Super Admin | متوسط | حرج | Platform Auth middleware منفصل |
| E4 | موظف يعدل صلاحيات نفسه | منخفض | حرج | Permission check على roles API |

---

## 4. نقاط الضعف الحرجة والضوابط

### Multi-Tenant Isolation
- **التهديد:** أي query بدون tenantId scope يُسرّب بيانات متاجر أخرى.
- **الضابط:** كل SELECT يجب أن يحتوي `.where(eq(table.tenantId, req.user.tenantId))`.
- **التحقق:** Code review على كل route handler.

### POS Price Calculation
- **التهديد:** العميل يرسل سعراً منخفضاً من DevTools.
- **الضابط:** السيرفر يتجاهل السعر القادم ويجلب `salePrice` من DB مباشرة.
- **التحقق:** اختبار manual بـ Postman بإرسال سعر مختلف.

### Returns Quantity Validation
- **التهديد:** إرجاع كمية أكبر من المباعة.
- **الضابط:** السيرفر يتحقق من `originalQuantity - returnedQuantity` قبل قبول المرتجع.

### Brute Force على Login
- **التهديد:** محاولات كلمة مرور غير محدودة.
- **الضابط:** Rate limiting (5 محاولات/15 دقيقة) + قفل الحساب 15 دقيقة بعد 5 فشل.

---

## 5. حدود الثقة (Trust Boundaries)

```
[Internet/Browser]
       |
       | HTTPS only
       ↓
[Reverse Proxy / Replit Edge]
       |
       | Rate Limiting, CORS, Helmet headers
       ↓
[Express API Server :8080]
       |
       ├── /api/auth/* ──────── loginRateLimiter → requireAuth → business logic
       ├── /api/* ──────────── requireAuth → tenant scope → business logic
       ├── /api/platform/* ─── requireSuperAdmin → audit log → business logic
       └── /api/healthz ──────  public, returns {status: "ok"} only
       |
       | Drizzle ORM (parameterized queries only)
       ↓
[PostgreSQL Database]
       |
       └── Row-level isolation via tenantId on every table
```

---

## 6. الأولويات والخارطة الزمنية

| الأولوية | الضابط | الحالة |
|---|---|---|
| P0 | Helmet + Security Headers | مطبق |
| P0 | CORS Restriction | مطبق |
| P0 | Rate Limiting على Login | مطبق |
| P0 | Tenant Isolation في كل Query | مطبق |
| P0 | Server-side Price Calculation في POS | مطبق |
| P1 | Account Lockout بعد Brute Force | مطبق |
| P1 | Security Logs | مطبق |
| P1 | Mass Assignment Protection | مطبق |
| P1 | Error Handler (no stack traces) | مطبق |
| P1 | DB Transactions للعمليات المالية | مطبق |
| P2 | Session Timeout (Frontend) | مطبق |
| P2 | Input Sanitization (XSS) | مطبق |
| P2 | 2FA | مستقبلاً |
| P3 | Refresh Token Rotation | مستقبلاً |
| P3 | File Upload Security | مستقبلاً |

---

## 7. ملاحظات الامتثال

- النظام يتبع مبادئ **OWASP ASVS Level 2**.
- يتبع **OWASP API Security Top 10**.
- مبدأ **Deny by Default** — كل صلاحية غير مصرحة تُمنع.
- مبدأ **Least Privilege** — الكاشير لا يرى إلا POS وبيانات فرعه.
- مبدأ **Defense in Depth** — الحماية في كل طبقة (Frontend, API, DB).
