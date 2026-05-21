# برومبت إضافة الحماية والأمان الكامل على نظام ERP الحالي

استخدم هذا البرومبت داخل الـ AI Coding Agent وهو فاتح مشروع الـ ERP الحالي بالفعل.

المطلوب ليس إنشاء مشروع جديد، وليس تصميم صفحات فقط.  
المطلوب هو إضافة طبقة حماية وأمان كاملة على السيستم الحالي، مع تعديل الكود الفعلي الموجود، وربط الحماية بكل أجزاء النظام الحالية.

---

## النظام الحالي يحتوي على

- Super Admin Dashboard
- Companies / Stores / Branches
- Login / Register Company
- Dashboard
- POS
- Products
- Categories داخل Products
- Inventory
- Stock Movements
- Purchases
- Suppliers
- Sales
- Returns
- Order Request
- Customers
- Expenses
- Accounting
- Reports
- Employees
- Roles & Permissions
- Branches
- Notifications
- Support Center
- Settings
- Profile
- Activity Logs
- System Health
- Supervisors / Admins

---

## المطلوب إضافة Security Layer كاملة على مستوى

- Frontend
- Backend / API
- Database
- Authentication
- Authorization
- Multi-tenancy
- Super Admin
- Activity Logs
- Audit Logs
- Sessions
- File Uploads
- WhatsApp Orders
- Support Tickets
- System Health
- Company Registration
- Employees
- POS
- Returns
- Inventory
- Reports

---

# 1. الهدف العام من الحماية

طبّق نظام حماية احترافي يمنع:

- دخول غير مصرح به.
- الوصول لبيانات متجر آخر.
- الوصول لفرع آخر بدون صلاحية.
- تعديل بيانات موظف بدون صلاحية.
- تعديل أسعار أو مخزون بدون صلاحية.
- إنشاء مرتجع غير مصرح به.
- التلاعب في فواتير البيع أو المرتجعات.
- استخدام API مباشرة لتجاوز الواجهة.
- IDOR / BOLA attacks.
- Mass Assignment.
- XSS.
- CSRF.
- SQL Injection.
- Brute Force.
- Session Hijacking.
- Token Theft.
- File Upload attacks.
- Data Leakage.
- Unauthorized Super Admin access.
- Manipulation of Order Request WhatsApp data.
- Access to System Health without permission.
- Exposure of secrets or environment variables.

---

# 2. مراجع الأمان المطلوبة

طبّق النظام وفقًا للمفاهيم التالية:

- OWASP ASVS security requirements.
- OWASP Top 10 Web Risks.
- OWASP API Security Top 10.
- Secure Authentication.
- Secure Session Management.
- Secure Access Control.
- Secure Logging.
- Secure File Upload.
- Secure REST API.
- Defense in Depth.
- Deny by Default.
- Least Privilege.
- Multi-Tenant Isolation.

---

# 3. Threat Model خاص بالنظام

ابدأ بعمل Threat Model داخل المشروع.

أضف ملف:

```txt
/docs/security-threat-model.md
```

ويحتوي على التهديدات التالية:

## Assets

- بيانات الشركات.
- بيانات المتاجر.
- بيانات الفروع.
- بيانات الموظفين.
- فواتير البيع.
- المرتجعات.
- المخزون.
- الموردين.
- العملاء.
- المصروفات.
- التقارير المالية.
- بيانات الدعم الفني.
- سجلات النشاط.
- إعدادات النظام.
- حسابات السوبر أدمن.

## Actors

- Super Admin.
- Company Owner.
- Store Admin.
- Branch Manager.
- Cashier.
- Inventory Manager.
- Accountant.
- Support Agent.
- Supplier Viewer.
- Guest / Unauthenticated User.
- Attacker.

## Main Risks

- موظف يحاول الوصول لبيانات فرع آخر.
- متجر يحاول الوصول لبيانات متجر آخر.
- مستخدم يعدل Role أو Permission من API.
- كاشير يحاول عمل مرتجع بدون صلاحية.
- مستخدم يغير السعر من Request Body.
- مستخدم يرفع ملف ضار.
- هجوم Brute Force على Login.
- سرقة Token.
- تعديل Order Request قبل إرسال واتساب.
- فتح صفحة System Health بدون صلاحية.
- تسريب Activity Logs.
- تجاوز صلاحيات Super Admin.

---

# 4. Multi-Tenant Security

النظام متعدد الشركات والمتاجر، لذلك يجب تطبيق Tenant Isolation بشكل صارم.

## المطلوب

كل كيان في النظام يجب أن يحتوي على الحقول المناسبة:

```ts
companyId?: string;
storeId: string;
branchId?: string;
createdBy: string;
updatedBy?: string;
```

طبّق هذا على:

- Users
- Employees
- Products
- Categories
- Inventory
- Stock Movements
- Sales
- Sale Items
- Returns
- Return Items
- Orders
- Order Requests
- Customers
- Suppliers
- Purchases
- Expenses
- Reports
- Support Tickets
- Notifications
- Settings
- Activity Logs
- Audit Logs

## قواعد العزل

- Super Admin يمكنه رؤية كل الشركات.
- Owner يرى الشركات والمتاجر التابعة له فقط.
- Admin يرى متجره فقط.
- Branch Manager يرى فرعه فقط.
- Cashier يرى بيانات POS والعمليات الخاصة بفرعه فقط.
- Accountant يرى الحسابات الخاصة بالمتجر أو الفرع حسب صلاحياته.
- Support Agent يرى التذاكر المسندة له أو المسموح له بها.
- أي Query على قاعدة البيانات يجب أن تحتوي على Scope:
  - companyId
  - storeId
  - branchId عند الحاجة

## ممنوع

- ممنوع الاعتماد على Frontend فقط لإخفاء البيانات.
- ممنوع إرجاع بيانات Store آخر حتى لو المستخدم غيّر ID في الرابط.
- ممنوع قبول storeId أو companyId من المستخدم بدون التحقق من ملكيته.
- ممنوع استخدام ID مباشر بدون Authorization Check.

---

# 5. Authentication Security

أعد تأمين نظام تسجيل الدخول بالكامل.

## Login

يجب أن يدعم:

- Email أو Phone أو Username حسب الموجود بالنظام.
- Password.
- Company / Store context عند الحاجة.
- Remember me اختياري.
- 2FA اختياري حسب الإعدادات.

## Password Security

- استخدم Hash قوي مثل bcrypt أو Argon2id.
- لا تخزن Password نهائيًا بصيغة plain text.
- Password minimum:
  - 8 أحرف على الأقل.
  - يفضل وجود حروف وأرقام ورموز.
- امنع كلمات المرور الضعيفة جدًا.
- لا تعرض سبب فشل الدخول بشكل يكشف هل البريد موجود أم لا.

رسالة الخطأ تكون عامة:

```text
بيانات الدخول غير صحيحة
```

## Brute Force Protection

أضف:

- Rate limiting على Login.
- Account lock مؤقت بعد عدد محاولات فاشلة.
- IP throttling.
- Device fingerprint اختياري.
- Captcha بعد محاولات كثيرة.
- تسجيل كل محاولة فاشلة في Security Logs.

مثال:

```ts
maxFailedAttempts = 5;
lockDuration = 15 minutes;
```

## Two Factor Authentication 2FA

أضف دعم 2FA اختياري على الأقل لـ:

- Super Admin.
- Owner.
- Admin.
- Accountant.

طرق 2FA:

- OTP App.
- Email OTP.
- SMS OTP لاحقًا.

## Forgot Password

أمّن نسيان كلمة المرور:

- Reset token عشوائي وقصير العمر.
- Expiry لا يزيد عن 15 دقيقة.
- Token يستخدم مرة واحدة فقط.
- لا تعرض هل البريد موجود أم لا.
- سجل العملية في Activity Logs و Security Logs.

## Change Password

عند تغيير كلمة المرور:

- اطلب كلمة المرور القديمة.
- تحقق من قوة الجديدة.
- سجّل الخروج من كل الجلسات القديمة اختياريًا.
- سجّل العملية في Activity Logs.

---

# 6. Session & Token Security

أمّن الجلسات والتوكنات.

## لو تستخدم JWT

طبّق:

- Access Token قصير العمر.
- Refresh Token طويل نسبيًا لكن قابل للإلغاء.
- Refresh Token Rotation.
- تخزين Refresh Token في HttpOnly Secure Cookie.
- لا تخزن JWT في localStorage.
- أضف Token Revocation.
- أضف Logout من كل الأجهزة.

## Cookie Settings

استخدم:

```ts
httpOnly: true
secure: true
sameSite: "strict" أو "lax"
```

## Session Timeout

أضف:

- Idle timeout.
- Absolute session timeout.
- Auto logout بعد مدة خمول.
- تحذير قبل انتهاء الجلسة.
- حفظ آخر نشاط للمستخدم.

## Device Sessions

أضف صفحة أو قسم داخل Profile باسم:

```text
الأجهزة والجلسات
```

يعرض:

- الجهاز
- المتصفح
- IP
- آخر نشاط
- الحالة
- زر إنهاء الجلسة

## Super Admin Sessions

- 2FA مطلوب.
- Timeout أقصر.
- إعادة إدخال كلمة المرور قبل العمليات الخطيرة.
- تسجيل كل العمليات في Audit Logs.

---

# 7. Authorization & Permissions

لا تعتمد على إخفاء الأزرار في الواجهة فقط.  
كل API وكل Action يجب أن يتحقق من الصلاحيات في السيرفر أو طبقة البيانات.

## Permission Model

أنشئ Permission System واضح:

```ts
type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "print"
  | "export"
  | "approve"
  | "refund"
  | "transfer"
  | "manage"
  | "assign"
  | "close";

type PermissionModule =
  | "dashboard"
  | "pos"
  | "products"
  | "inventory"
  | "stock_movements"
  | "purchases"
  | "suppliers"
  | "sales"
  | "returns"
  | "orders"
  | "customers"
  | "expenses"
  | "accounting"
  | "reports"
  | "employees"
  | "roles"
  | "branches"
  | "support"
  | "settings"
  | "activity_logs"
  | "system_health"
  | "super_admin"
  | "companies";
```

## Permission Check Function

أضف دالة مركزية:

```ts
can(user, action, module, resource?)
```

ويجب استخدامها في:

- Frontend guards.
- Backend middleware.
- API routes.
- Server actions.
- Database queries where possible.

## Deny By Default

أي User لا يملك صلاحية واضحة يتم منعه.

## خطورة مهمة

ممنوع أن يستطيع المستخدم تعديل:

- role
- permissions
- storeId
- companyId
- branchId
- isSuperAdmin
- isOwner

من خلال Request Body إلا من خلال APIs مخصصة ومحميّة.

---

# 8. Object-Level Authorization / IDOR Protection

احمِ كل APIs التي تعتمد على ID.

مثال:

```txt
GET /api/products/:id
GET /api/sales/:id
GET /api/employees/:id
GET /api/returns/:id
GET /api/orders/:id
```

قبل إرجاع أي Resource:

1. اجلب المستخدم الحالي.
2. تحقق من صلاحياته.
3. تحقق أن الـ Resource تابع لنفس companyId / storeId / branchId المسموح.
4. إن لم يكن مسموحًا، أرجع 404 أو 403 بدون تسريب تفاصيل.

مثال:

```ts
const product = await db.product.findFirst({
  where: {
    id: productId,
    storeId: currentUser.storeId
  }
});
```

ممنوع:

```ts
const product = await db.product.findUnique({ where: { id } });
```

إلا لو بعدها تحقق صارم من الملكية.

---

# 9. Object Property Authorization

لا تسمح لكل Role برؤية أو تعديل كل الحقول.

## مثال Employee

Cashier لا يرى:

- salary
- permissions
- passwordHash
- resetTokens
- securityFlags

Branch Manager قد يرى موظفي فرعه فقط.

Owner يرى كل موظفي متجره.

Super Admin يرى حسب صلاحياته.

## Output Filtering

قبل إرسال البيانات للواجهة، طبّق DTO / Serializer.

مثال:

```ts
sanitizeEmployeeForUser(employee, currentUser)
```

## Mass Assignment Protection

عند Create أو Update لا تقبل Body كامل كما هو.

ممنوع:

```ts
db.employee.update({ data: req.body });
```

الصحيح:

```ts
const data = pick(req.body, [
  "name",
  "phone",
  "email",
  "branchId",
  "roleId",
  "status"
]);
```

---

# 10. Input Validation

أضف Validation مركزي لكل Forms و APIs.

استخدم Zod أو Yup أو النظام الموجود.

## المطلوب

- Validate on Frontend.
- Validate on Backend.
- Normalize data.
- Trim strings.
- منع القيم غير المتوقعة.
- منع negative quantities.
- منع أسعار غير منطقية.
- منع تواريخ غير صحيحة.
- منع HTML داخل الحقول النصية الحساسة.

## أمثلة

### Product

- الاسم مطلوب.
- السعر لا يقل عن صفر.
- سعر البيع لا يقل عن سعر الشراء إلا بصلاحية.
- Barcode فريد داخل المتجر.
- SKU فريد داخل المتجر.

### Inventory

- الكمية لا تكون سالبة.
- التحويل لا يتجاوز المتاح.
- سبب التعديل مطلوب.

### Returns

- المرتجع يجب أن يكون من فاتورة فعلية.
- الكمية المرتجعة لا تتجاوز المتاح للارتجاع.
- السبب مطلوب.
- المستخدم يحتاج صلاحية refund.

### Order Request

- اسم العميل مطلوب.
- رقم الواتساب مطلوب.
- لا يمكن إرسال طلب فارغ.
- الكمية لا تتجاوز المتاح.
- السعر من النظام وليس من المستخدم.

### Company Registration

- البريد صحيح.
- رقم الهاتف صحيح.
- كلمة المرور قوية.
- لا تسمح بتكرار البريد أو السجل التجاري أو الرقم الضريبي.

---

# 11. XSS Protection

احمِ النظام من XSS.

## المطلوب

- لا تستخدم dangerouslySetInnerHTML إلا للضرورة القصوى.
- أي HTML يتم عرضه يجب Sanitization.
- Escape لكل نصوص المستخدم.
- امنع إدخال scripts داخل:
  - أسماء المنتجات
  - أسماء العملاء
  - ملاحظات الطلب
  - تذاكر الدعم
  - إعدادات الفاتورة
  - Footer الفاتورة
- طبّق Content Security Policy.

## CSP مقترح

أضف Headers مناسبة:

```txt
Content-Security-Policy:
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

عدّلها حسب احتياجات المشروع، خصوصًا لو يستخدم CDN أو WhatsApp أو ملفات خارجية.

---

# 12. CSRF Protection

لو النظام يستخدم Cookies للجلسات:

- أضف CSRF Token.
- تحقق من CSRF Token في كل عمليات:
  - POST
  - PUT
  - PATCH
  - DELETE
- SameSite cookies.
- لا تسمح بعمليات حساسة من Origins غير موثوقة.

---

# 13. CORS Security

أغلق CORS.

## المطلوب

- لا تستخدم `*` في production.
- اسمح فقط بدومينات النظام المعروفة.
- اسمح بالـ Methods المطلوبة فقط.
- لا تسمح بـ Credentials إلا للدومينات الموثوقة.

مثال:

```ts
allowedOrigins = [
  "https://app.yourdomain.com",
  "https://admin.yourdomain.com"
];
```

---

# 14. Security Headers

أضف Security Headers على كل Response.

```txt
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: حسب إعدادات المشروع
```

لو المشروع Next.js أضفها في `next.config.js`.

لو Express أضف Helmet.

---

# 15. API Rate Limiting

أضف Rate Limiting حسب نوع الـ Endpoint.

## Login

```txt
5 محاولات / 15 دقيقة لكل IP + Email
```

## Forgot Password

```txt
3 محاولات / ساعة
```

## Order Request

```txt
20 طلب / 10 دقائق لكل موظف
```

## Support Tickets

```txt
10 تذاكر / ساعة لكل متجر
```

## Export Reports

```txt
5 مرات / 10 دقائق
```

## Print Invoice

لا تمنع الطباعة العادية، لكن سجل الاستخدام العالي.

## Super Admin APIs

Rate limit صارم + 2FA.

---

# 16. Secure File Upload

النظام يحتوي على:

- صور منتجات.
- لوجو الشركة.
- صور موظفين.
- مرفقات الدعم الفني.
- صور هالك المخزون.
- فواتير موردين.

## المطلوب

- اسمح فقط بأنواع ملفات محددة.
- تحقق من MIME الحقيقي وليس الامتداد فقط.
- حد أقصى للحجم.
- غيّر اسم الملف عشوائيًا.
- لا تحفظ الملف بنفس اسم المستخدم.
- لا تسمح برفع:
  - exe
  - js
  - html
  - svg غير موثوق
  - php
  - shell scripts
- افحص الصور.
- خزّن الملفات خارج public execution path.
- أضف Access Control عند تحميل الملفات.
- لا تجعل مرفقات الدعم الفني متاحة بدون تسجيل دخول.

## File Metadata

احفظ:

```ts
fileId
originalName
storedName
mimeType
size
uploadedBy
storeId
branchId
module
createdAt
```

---

# 17. Database Security

## المطلوب

- استخدم Parameterized Queries أو ORM آمن.
- لا تبني SQL strings يدويًا.
- أضف Indexes على:
  - companyId
  - storeId
  - branchId
  - userId
  - createdAt
- أضف Unique Constraints مثل:
  - email داخل الشركة
  - phone داخل الشركة
  - barcode داخل المتجر
  - SKU داخل المتجر
- أضف Soft Delete بدل الحذف النهائي.

## Sensitive Fields

لا ترجع أبدًا:

- passwordHash
- resetToken
- refreshToken
- 2FA secret
- internal security flags
- secret keys

## Transactions

استخدم Transaction في العمليات المالية والمخزون:

- Sale creation.
- Return creation.
- Inventory adjustment.
- Stock transfer.
- Purchase receiving.
- Order converted to Sale.

مثال:

```ts
await db.transaction(async (tx) => {
  // create return
  // update stock
  // update sale totals
  // create activity log
});
```

---

# 18. Encryption & Secrets

## Secrets

- لا تضع Secrets داخل الكود.
- استخدم `.env`.
- لا ترفع `.env` على Git.
- أضف `.env.example` بدون قيم حقيقية.
- استخدم Secret Manager في production إن أمكن.

## Encrypt Sensitive Data

شفّر البيانات الحساسة عند الحاجة:

- Tokens.
- 2FA secrets.
- API keys.
- Integration credentials.
- Payment credentials مستقبلًا.

## TLS

- النظام في production يجب أن يعمل على HTTPS فقط.
- امنع HTTP في production.

---

# 19. Security Logs & Audit Logs

بجانب Activity Logs، أضف Security Logs منفصلة للأحداث الأمنية.

## Security Events

سجل:

- Login success.
- Login failed.
- Logout.
- Password changed.
- Forgot password requested.
- Reset password success.
- 2FA enabled.
- 2FA failed.
- Account locked.
- Permission denied.
- Suspicious access.
- Super Admin login.
- Super Admin action.
- Failed API authorization.
- Rate limit exceeded.
- File upload rejected.
- CORS blocked request.
- CSRF failed.

## Security Log Model

```ts
type SecurityLog = {
  id: string;
  userId?: string;
  companyId?: string;
  storeId?: string;
  branchId?: string;
  event: string;
  severity: "low" | "medium" | "high" | "critical";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
};
```

## مهم

- لا تحفظ Password أو Tokens في Logs.
- لا تحفظ بيانات حساسة كاملة.
- Mask للهواتف والإيميلات عند الحاجة.

---

# 20. Super Admin Security

السوبر أدمن أخطر جزء في النظام.

## المطلوب

- صفحة Super Admin محمية Role + Permission + 2FA.
- لا يمكن لأي Owner أو Admin الوصول لها.
- كل Route يبدأ بـ `/super-admin` يحتاج Guard خاص.
- كل API خاص بالسوبر أدمن يحتاج Middleware خاص.
- سجل كل عملية Super Admin في Audit Logs.

## صفحات السوبر أدمن المحمية

- الشركات.
- المتاجر.
- المشرفون.
- سجل النشاطات.
- صحة النظام.
- الدعم الفني.
- الاشتراكات.
- الإعدادات العامة.

## إجراءات خطيرة تحتاج Re-authentication

اطلب إعادة إدخال كلمة المرور أو 2FA عند:

- حذف شركة.
- تعطيل شركة.
- تغيير خطة اشتراك.
- إنشاء Super Admin.
- تعديل صلاحيات Super Admin.
- تصدير كل بيانات شركة.
- الوصول لبيانات حساسة.

---

# 21. Company Registration Security

فورم إضافة الشركات من Login ومن Super Admin يجب أن يكون آمنًا.

## الحماية المطلوبة

- Rate limit على التسجيل.
- Validation قوي.
- منع البريد المكرر.
- منع رقم السجل التجاري المكرر.
- منع الرقم الضريبي المكرر.
- Sanitization لكل النصوص.
- منع إنشاء Owner بدون Password قوي.
- إذا التسجيل من Login:
  - الحالة تكون Pending أو Trial.
  - لا تعطي صلاحيات كاملة قبل التفعيل.
- إذا الإنشاء من Super Admin:
  - سجّل العملية في Audit Logs.

## بيانات لا تقبل من المستخدم مباشرة

- isSuperAdmin
- internalPlanId غير مصرح
- subscriptionStatus لو من public register
- securityFlags
- verifiedAt

---

# 22. POS Security

صفحة POS يجب أن تكون سريعة لكن آمنة.

## المطلوب

- لا تعتمد على الأسعار القادمة من الواجهة.
- عند إنشاء فاتورة، السيرفر يعيد حساب:
  - سعر كل منتج
  - الخصم المسموح
  - الضريبة
  - الإجمالي النهائي
- تحقق من المخزون قبل البيع.
- منع البيع بكمية أكبر من المتاح إلا لو الإعداد يسمح وبصلاحية.
- خصم المخزون يتم داخل Transaction.
- سجل الكاشير والفرع.
- لا تسمح للكاشير بتعديل سعر المنتج إلا بصلاحية.
- لا تسمح بخصم أكبر من حد الخصم المسموح للموظف.
- طباعة الفاتورة تسجل في Activity Logs.

---

# 23. Returns Security

المرتجعات منطقة حساسة ماليًا.

## المطلوب

- المرتجع يجب أن يكون من فاتورة فعلية.
- تحقق أن الفاتورة تخص نفس المتجر أو الفرع.
- تحقق من الكمية المتاحة للارتجاع.
- لا تسمح بارتجاع نفس المنتج مرتين فوق الكمية الأصلية.
- Refund يحتاج Permission.
- Refund فوق مبلغ معين يحتاج Approval.
- سبب المرتجع مطلوب.
- طريقة رد المبلغ مطلوبة.
- تحديث المخزون والتقارير يتم داخل Transaction.
- طباعة فاتورة المرتجع تسجل في Activity Logs.

## Approval Rule

مثال:

```ts
if (refundAmount > user.maxRefundWithoutApproval) {
  return createPendingReturnApproval();
}
```

---

# 24. Inventory Security

المخزون حساس جدًا.

## المطلوب

- أي تعديل كمية يحتاج سبب.
- أي تعديل كمية يسجل Old Quantity و New Quantity.
- لا تسمح بكمية سالبة.
- تحويل المخزون بين الفروع يحتاج صلاحية.
- التحويل الكبير يحتاج Approval.
- تسجيل الهالك يحتاج سبب وصورة اختيارية.
- الجرد يحتاج تسجيل الفرق.
- كل تعديل مخزون ينشئ:
  - Stock Movement
  - Activity Log
  - Security Log لو العملية خطيرة

## ممنوع

- تعديل الكمية مباشرة من جدول المنتجات بدون Stock Movement.
- حذف حركة مخزون بعد إنشائها.
- تعديل Stock Movement إلا بصلاحية عالية ويتم تسجيل Audit Log.

---

# 25. Products & Categories Security

## Products

- Barcode فريد داخل المتجر.
- SKU فريد داخل المتجر.
- لا تسمح بتغيير سعر الشراء إلا بصلاحية.
- لا تسمح بتغيير سعر البيع إلا بصلاحية.
- لا تسمح بحذف منتج عليه مبيعات.
- استخدم Soft Delete أو Disable.
- صورة المنتج تخضع لحماية File Upload.

## Categories داخل Products

- لا تسمح بحذف تصنيف به منتجات.
- اسم التصنيف فريد داخل المتجر.
- Drag & Drop لا يسمح بتعديل تصنيفات متجر آخر.
- أي تعديل يسجل Activity Log.

---

# 26. Order Request + WhatsApp Security

صفحة طلب الأوردرات يجب تأمينها.

## المطلوب

- المنتجات تأتي من بيانات المتجر الفعلية.
- لا تقبل السعر من الواجهة.
- لا تقبل الإجمالي النهائي من الواجهة.
- السيرفر يعيد حساب الطلب.
- لا تسمح بكمية أكبر من المتاح.
- لا تسمح بطلب بدون عميل.
- رقم الواتساب يتم تنظيفه وتنسيقه.
- رسالة واتساب يتم توليدها من السيرفر أو من دالة موثوقة.
- امنع إدخال Scripts داخل ملاحظات الطلب.
- سجل:
  - إنشاء الطلب
  - إرسال واتساب
  - تحويل الطلب إلى فاتورة
  - إلغاء الطلب

## WhatsApp URL

استخدم:

```ts
const message = buildOrderMessage(order);
const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
```

## ممنوع

- لا تفتح رابط واتساب برقم غير صالح.
- لا تسمح بتعديل أسعار الطلب من DevTools.
- لا تحول الطلب إلى Sale بدون إعادة تحقق من المخزون.

---

# 27. Support Center Security

قسم الدعم الفني يجب أن يكون آمنًا لأنه يستقبل نصوص ومرفقات.

## المطلوب

- Sanitize لعنوان ووصف التذكرة.
- File upload restrictions.
- الموظف يرى تذاكر متجره فقط.
- Super Admin يرى كل التذاكر.
- Support Agent يرى التذاكر المسندة له فقط.
- الردود تسجل باسم المستخدم.
- لا يمكن حذف تذكرة، فقط إغلاقها.
- كل تغيير حالة يسجل Activity Log.
- ملاحظات داخلية لا تظهر للمتجر.

---

# 28. Reports & Export Security

التقارير المالية حساسة.

## المطلوب

- Export يحتاج Permission.
- Reports المالية تظهر فقط للأدوار المصرح لها.
- Branch Manager يرى تقارير فرعه فقط.
- Owner يرى كل الفروع.
- Super Admin لا يرى التفاصيل المالية إلا لو لديه صلاحية واضحة أو وضع Support مصرح.
- سجل كل Export في Activity Logs.
- أضف Rate Limit للتصدير.
- أضف Watermark اختياري على PDF:
  - اسم المستخدم
  - التاريخ
  - المتجر

---

# 29. System Health Security

صفحة صحة النظام في Super Admin يجب ألا تكشف معلومات حساسة.

## المطلوب

- الصفحة محمية Super Admin فقط.
- لا تعرض Secrets.
- لا تعرض Connection Strings.
- لا تعرض Stack Traces للمستخدم.
- Errors تكون مختصرة.
- التفاصيل التقنية العميقة تظهر فقط في Logs داخل السيرفر.
- أضف Monitoring Cards:
  - API Status
  - Database Status
  - Storage
  - Queue Jobs
  - Failed Jobs
  - Error Rate
  - Response Time
  - Uptime

## API

Health endpoint العام يعرض فقط:

```json
{ "status": "ok" }
```

أما التفاصيل تكون في endpoint محمي للسوبر أدمن فقط.

---

# 30. Frontend Route Guards

أضف Route Guards لكل الصفحات.

## المطلوب

- لو المستخدم غير مسجل دخول، يذهب إلى Login.
- لو المستخدم لا يملك صلاحية، يظهر Unauthorized Page.
- لو Token انتهى، حاول Refresh Token.
- لو فشل Refresh، اعمل Logout.
- لا تعرض الصفحة قبل التحقق من الصلاحية.
- Sidebar يعرض فقط الأقسام المتاحة.

## Unauthorized Page

اعرض:

```text
ليس لديك صلاحية للوصول إلى هذه الصفحة
```

مع زر رجوع للرئيسية.

---

# 31. Backend Middleware

أضف Middleware مركزي.

## Middleware مطلوب

```ts
requireAuth()
requirePermission(module, action)
requireStoreAccess(storeId)
requireBranchAccess(branchId)
requireSuperAdmin()
rateLimit()
validateBody(schema)
auditLog()
securityLog()
```

## ترتيب التنفيذ

لكل API حساس:

1. Rate Limit.
2. Authenticate.
3. Validate input.
4. Authorize.
5. Tenant scope.
6. Execute.
7. Audit log.
8. Return sanitized response.

---

# 32. Error Handling

لا تعرض أخطاء تقنية للمستخدم.

## المطلوب

- Error messages عامة للمستخدم.
- Detailed errors في server logs فقط.
- لا تعرض stack trace في production.
- لا تعرض DB errors مباشرة.
- لا تعرض هل email موجود أم لا في auth flows.

## Response Shape

```ts
{
  success: false,
  message: "حدث خطأ غير متوقع",
  code: "GENERIC_ERROR"
}
```

---

# 33. Backup & Recovery

أضف خطة داخل docs.

ملف:

```txt
/docs/backup-and-recovery.md
```

يحتوي على:

- Backup يومي لقاعدة البيانات.
- Backup أسبوعي كامل.
- تشفير النسخ الاحتياطية.
- اختبار استعادة النسخ.
- Retention policy.
- من له صلاحية تنزيل Backup.
- تسجيل أي عملية Backup أو Restore في Audit Logs.

---

# 34. Privacy & Data Protection

## المطلوب

- Mask للبيانات الحساسة في الجداول عند الحاجة.
- لا تعرض رقم الهاتف كاملًا إلا لصاحب صلاحية.
- لا تعرض بيانات العملاء لموظف غير مصرح.
- لا تخزن بيانات حساسة غير ضرورية.
- أضف Data Retention Settings.
- أضف حق تعطيل المستخدم بدل حذفه.
- أضف Export Customer Data فقط بإذن.

---

# 35. Notifications Security

## المطلوب

- المستخدم يرى إشعارات تخصه أو تخص فرعه فقط.
- لا يمكن قراءة إشعارات Store آخر.
- لا يمكن Mark as read لإشعار لا يخص المستخدم.
- إشعارات Super Admin منفصلة.
- لا تضع بيانات مالية حساسة كاملة داخل نص الإشعار.

---

# 36. Secure Settings

الإعدادات خطيرة.

## المطلوب

- Settings تحتاج Permission.
- تعديل إعدادات الفاتورة يسجل Activity Log.
- تعديل إعدادات الضريبة يحتاج صلاحية.
- تعديل إعدادات البيع بدون مخزون يحتاج Owner/Admin فقط.
- تعديل إعدادات WhatsApp يحتاج Permission.
- تعديل إعدادات الطباعة يحتاج Permission.
- أي تغيير Settings يحفظ:
  - oldValue
  - newValue
  - changedBy
  - changedAt

---

# 37. Dependency Security

أضف أو نفّذ:

- Audit للـ packages.
- إزالة المكتبات غير المستخدمة.
- عدم استخدام مكتبات مهجورة.
- تحديث المكتبات ذات الثغرات.
- منع استخدام `eval`.
- منع تحميل scripts خارجية غير موثوقة.

لو المشروع Node:

```bash
npm audit
```

أو:

```bash
pnpm audit
```

---

# 38. Environment Modes

فرّق بين development و production.

## في Development

- يمكن عرض تفاصيل أخطاء أكثر.
- يمكن استخدام بيانات Mock.

## في Production

- لا Stack traces.
- لا Console logs حساسة.
- HTTPS فقط.
- Cookies secure.
- CORS مغلق.
- CSP مفعل.
- Rate limiting مفعل.
- Security logs مفعل.

---

# 39. Activity Logs Integration

كل العمليات التالية يجب أن تسجل Activity Log:

- Login.
- Logout.
- Add employee.
- Update employee.
- Disable employee.
- Change permissions.
- Add product.
- Update product.
- Disable product.
- Add category.
- Update category.
- Inventory adjustment.
- Stock transfer.
- Damaged stock.
- Stock count.
- Create sale.
- Print invoice.
- Create return.
- Print return invoice.
- Create order request.
- Send WhatsApp order.
- Convert order to sale.
- Create support ticket.
- Reply to support ticket.
- Change system settings.
- Add company.
- Update company.
- Add branch.
- Update branch.
- Super Admin action.
- Export report.

كل Log يجب أن يحتوي على:

- userId
- employeeName
- role
- companyId
- storeId
- branchId
- module
- action
- description
- oldData
- newData
- ipAddress
- userAgent
- createdAt

---

# 40. Security Dashboard

أضف صفحة أو Tab داخل Super Admin باسم:

```text
Security Center
```

تعرض:

- Failed logins اليوم.
- Locked accounts.
- Suspicious activities.
- Permission denied events.
- Rate limit exceeded.
- File uploads rejected.
- Critical security logs.
- Active sessions.
- Super Admin actions.
- Recent password changes.

## Actions

- Lock user.
- Unlock user.
- Force logout.
- Revoke sessions.
- Require password reset.
- Require 2FA.
- View security log details.

---

# 41. Acceptance Criteria

بعد التنفيذ، تأكد من التالي:

## Authentication

- لا يمكن الدخول بكلمة مرور خاطئة.
- الحساب يقفل مؤقتًا بعد محاولات كثيرة.
- Reset password آمن.
- Session timeout يعمل.
- Logout from all devices يعمل.

## Authorization

- Cashier لا يدخل Reports المالية.
- Cashier لا يعدل مخزون.
- Branch Manager لا يرى فرع آخر.
- Store Admin لا يرى Store آخر.
- Owner لا يدخل Super Admin.
- Super Admin فقط يدخل صفحات Super Admin.

## Multi-tenancy

- تغيير storeId في URL لا يرجع بيانات متجر آخر.
- تغيير branchId لا يرجع بيانات فرع آخر.
- API محمي وليس الواجهة فقط.

## POS

- السعر يعاد حسابه من السيرفر.
- الخصم لا يتجاوز حد الموظف.
- المخزون لا يصبح سالبًا.

## Returns

- لا يمكن مرتجع بدون فاتورة.
- لا يمكن إرجاع كمية أكبر من المباعة.
- المرتجع يسجل Activity Log.

## Inventory

- أي تعديل كمية له سبب.
- لا توجد كمية سالبة.
- كل تعديل له Stock Movement.

## Order Request

- لا يمكن اختيار كمية أكبر من المتاح.
- رسالة واتساب لا تحتوي Scripts.
- الطلب يحفظ في النظام.
- التحويل إلى Sale يعيد التحقق من المخزون.

## Support

- كل متجر يرى تذاكره فقط.
- Super Admin يرى كل التذاكر.
- المرفقات محمية.

## Super Admin

- المشرفون يعملون.
- سجل النشاطات يعمل.
- صحة النظام تعمل.
- Security Center يعمل.

## Files

- رفع ملف ضار يتم رفضه.
- الملفات لا تفتح بدون صلاحية.

## Logs

- لا يوجد Password أو Token في Logs.
- كل عملية مهمة مسجلة.

---

# 42. Deliverables المطلوبة

بعد التنفيذ، أخرج لي تقرير مختصر يحتوي على:

1. الملفات التي تم تعديلها.
2. الملفات الجديدة التي تم إنشاؤها.
3. Middleware الأمنية التي تمت إضافتها.
4. الصلاحيات الجديدة.
5. Routes المحمية.
6. APIs التي تم تأمينها.
7. طريقة تشغيل الاختبارات.
8. أي نقاط تحتاج Backend حقيقي لاحقًا إن كان المشروع Mock فقط.

---

# 43. تعليمات تنفيذ نهائية

ابدأ بفحص المشروع الحالي:

1. افحص Auth.
2. افحص Roles & Permissions.
3. افحص Routes.
4. افحص API services.
5. افحص Store / State management.
6. افحص Database models أو Mock data.
7. افحص Super Admin.
8. افحص Activity Logs.
9. افحص Employee / Inventory / POS / Returns / Orders / Support.
10. أضف Security Layer تدريجيًا بدون كسر النظام.

لا تنشئ صفحات شكلية فقط.  
لا تعتمد على إخفاء الأزرار في الواجهة فقط.  
الحماية الأساسية يجب أن تكون في API / Server / Data layer.  
اجعل كل شيء Role-aware وTenant-aware.  
استخدم TypeScript Types واضحة.  
استخدم Validation Schemas.  
استخدم Centralized Permission Checks.  
استخدم Audit Logs وSecurity Logs.  
اجعل النظام Production-ready.
