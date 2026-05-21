# خطة النسخ الاحتياطي والاستعادة — MarketFlow ERP

**الإصدار:** 1.0  
**التاريخ:** مايو 2025  
**المسؤول:** Super Admin / DevOps Team

---

## 1. نطاق النسخ الاحتياطي

### البيانات المشمولة

| النوع | التفاصيل | الأولوية |
|---|---|---|
| قاعدة البيانات | PostgreSQL كاملة (26+ جدول) | حرج |
| ملفات المرفقات | صور المنتجات، مرفقات الدعم | عالي |
| ملفات الإعدادات | .env (مشفرة)، configs | عالي |
| Logs | Activity Logs، Security Logs | متوسط |

---

## 2. جدول النسخ الاحتياطي

### نسخ يومي (Daily Backup)
- **التوقيت:** 02:00 AM (توقيت الخادم)
- **النوع:** Incremental Backup لقاعدة البيانات
- **الاحتفاظ:** 7 أيام
- **الأمر:**
```bash
pg_dump $DATABASE_URL | gzip | gpg --encrypt -r backup@marketflow.app > backup-$(date +%Y%m%d).sql.gz.gpg
```

### نسخ أسبوعي (Weekly Backup)
- **التوقيت:** الأحد 03:00 AM
- **النوع:** Full Backup (DB + ملفات + إعدادات)
- **الاحتفاظ:** 4 أسابيع
- **التشفير:** AES-256 + GPG

### نسخ شهري (Monthly Backup)
- **التوقيت:** أول يوم في الشهر 04:00 AM
- **النوع:** Full Backup أرشيفي
- **الاحتفاظ:** 12 شهراً
- **التخزين:** Cloud Storage منفصل (S3 أو ما يعادله)

---

## 3. سياسة الاحتفاظ (Retention Policy)

| نوع النسخة | مدة الاحتفاظ | مكان التخزين |
|---|---|---|
| يومية | 7 أيام | نفس الخادم + Cloud |
| أسبوعية | 4 أسابيع | Cloud Storage |
| شهرية | 12 شهراً | Cold Storage |
| سنوية | 5 سنوات | Archival Storage |

---

## 4. تشفير النسخ الاحتياطية

- جميع النسخ مشفرة بـ **AES-256** قبل الرفع.
- مفاتيح التشفير مخزنة في **Secret Manager** منفصل عن الخادم.
- لا تُخزن مفاتيح التشفير بجانب النسخة الاحتياطية.
- يتم التحقق من سلامة الملف بـ **SHA-256 checksum**.

---

## 5. إجراءات الاستعادة (Recovery Procedures)

### الاستعادة الكاملة (Full Recovery)

```bash
# 1. فك التشفير
gpg --decrypt backup-20250101.sql.gz.gpg > backup.sql.gz

# 2. فك الضغط
gunzip backup.sql.gz

# 3. استعادة قاعدة البيانات
psql $DATABASE_URL < backup.sql

# 4. التحقق من سلامة البيانات
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tenants;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM sales_orders;"

# 5. تشغيل Migrations إن وجدت
pnpm --filter @workspace/db run push

# 6. إعادة تشغيل الخدمة
pm2 restart marketflow-api
```

### الاستعادة الجزئية (Point-in-Time Recovery)

```bash
# استعادة جدول محدد فقط
pg_restore --table=sales_orders -d $DATABASE_URL backup.dump

# استعادة بيانات متجر معين
psql $DATABASE_URL -c "SELECT * FROM tenants WHERE id = 'tenant-id';"
```

---

## 6. اختبار الاستعادة (Recovery Testing)

### جدول الاختبارات

| الاختبار | التكرار | المسؤول |
|---|---|---|
| اختبار استعادة قاعدة البيانات | شهرياً | Super Admin |
| اختبار استعادة ملف محدد | ربع سنوي | DevOps |
| اختبار كامل للنظام | نصف سنوي | فريق تقني |
| مراجعة سياسة النسخ | سنوياً | Management |

### إجراء الاختبار الشهري

1. إنشاء بيئة staging منفصلة.
2. استعادة أحدث نسخة احتياطية.
3. تشغيل التحقق من البيانات.
4. التأكد من عمل الخدمة بشكل كامل.
5. توثيق النتائج في Audit Logs.

---

## 7. صلاحيات الوصول للنسخ الاحتياطية

| الدور | الصلاحية |
|---|---|
| Super Admin | عرض حالة النسخ، طلب نسخة يدوية |
| DevOps Engineer | تنزيل وتشغيل الاستعادة |
| Management | عرض التقارير فقط |
| Store Owner | لا وصول لنسخ المنصة |

**قاعدة:** كل عملية نسخ أو استعادة تُسجَّل في **Platform Audit Logs** بـ:
- من نفّذ العملية
- نوع العملية (backup/restore)
- التوقيت
- النتيجة (نجاح/فشل)

---

## 8. أهداف الاسترداد (RTO/RPO)

| المقياس | الهدف | الحالي |
|---|---|---|
| RPO (Recovery Point Objective) | لا يتجاوز 24 ساعة | نسخ يومية |
| RTO (Recovery Time Objective) | أقل من 4 ساعات | إجراءات موثقة |
| MTTR (Mean Time to Recovery) | أقل من 2 ساعة | معتمد |

---

## 9. حالات الطوارئ

### في حال اختراق قاعدة البيانات:
1. إيقاف الخادم فوراً.
2. تغيير جميع بيانات الاتصال وكلمات المرور.
3. استعادة أحدث نسخة نظيفة.
4. مراجعة Security Logs لتحديد نقطة الاختراق.
5. إبلاغ المتاجر المتأثرة.

### في حال فقدان بيانات عرضي:
1. تحديد الجداول المتأثرة.
2. استخدام Point-in-Time Recovery.
3. التحقق من سلامة البيانات بعد الاستعادة.
4. توثيق الحادثة كاملاً.

---

## 10. جهات الاتصال في حالات الطوارئ

> يُحدَّث هذا القسم بمعلومات الفريق الفعلي.

- **Super Admin:** admin@marketflow.app
- **On-Call DevOps:** devops@marketflow.app
- **Emergency Hotline:** حسب الاتفاقية مع مزود الخدمة
