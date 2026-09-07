# دليل إعداد VPS PostgreSQL ونقل البيانات والتحكم بقاعدتي البيانات (Dual DB Setup)

يقدم هذا الدليل إرشادات خطوة بخطوة لإعداد قاعدة بيانات **PostgreSQL** على خادم VPS الخاص بك، وتطبيق الهيكلية (Migrations)، وتصدير البيانات من قاعدة **Neon PostgreSQL** واستيرادها في الخادم الجديد، بالإضافة إلى كيفية التبديل الفوري بينهما عبر ملف `.env`.

---

## 1. آلية العمل والتحكم من خلال البيئة (`.env`)

تم تحديث النظام ليدعم التبديل بين قاعدتي البيانات عبر المتغير **`DB_TARGET`**:

```env
# ============================================================
# Database Configuration (Dual Database Support)
# ============================================================

# حدد الداتابيز النشطة: "neon" أو "vps"
DB_TARGET=vps

# قاعدة Neon الأصليّة
NEON_DATABASE_URL=postgresql://<NEON_USER>:<NEON_PASSWORD>@<NEON_HOST>/neondb?sslmode=require

# قاعدة VPS PostgreSQL الجديدة
VPS_DATABASE_URL=postgresql://<VPS_USER>:<VPS_PASSWORD>@<VPS_IP>:5432/marketflow_db

# السلسلة العامة الاحتياطية
DATABASE_URL=postgresql://<NEON_USER>:<NEON_PASSWORD>@<NEON_HOST>/neondb?sslmode=require
```

> **ملاحظة:** عند اختيار `DB_TARGET=neon` سيعمل التطبيق على Neon DB. وعند تغييره إلى `DB_TARGET=vps` سيعمل التطبيق على خادم VPS فوراً.

---

## 2. أوامر إعداد PostgreSQL على خادم الـ VPS

قم بتنفيذ الأوامر التالية على خادم الـ VPS (عبر SSH بصلاحيات `root` أو `sudo`):

### الخطوة 1: تثبيت PostgreSQL
```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
```

### الخطوة 2: إنشاء قاعدة البيانات والمستخدم
```bash
sudo -u postgres psql
```
ثم داخل واجهة `psql` قم بتنفيذ الأوامر التالية:
```sql
-- 1. إنشاء قاعدة البيانات
CREATE DATABASE marketflow_db;

-- 2. إنشاء المستخدم وكلمة المرور (استبدل Password123! بكلمة مرور قوية من اختيارك)
CREATE USER marketflow_user WITH ENCRYPTED PASSWORD 'Password123!';

-- 3. منح الصلاحيات كاملة للمستخدم
GRANT ALL PRIVILEGES ON DATABASE marketflow_db TO marketflow_user;
ALTER DATABASE marketflow_db OWNER TO marketflow_user;

-- 4. إعطاء صلاحيات المخطط العام (Public Schema)
\c marketflow_db
GRANT ALL ON SCHEMA public TO marketflow_user;

-- الخروج من psql
\q
```

### الخطوة 3: تفعيل الاتصال الخارجي (Remote Access)
بشكل افتراضي PostgreSQL لا يقبل اتصالات من خارج الـ localhost. لتمكينه:

1. افتح ملف إعدادات `postgresql.conf`:
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```
ابحث عن `listen_addresses` وغير القيمة إلى:
```conf
listen_addresses = '*'
```

2. افتح ملف `pg_hba.conf`:
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```
أضف السطر التالي في نهاية الملف للسماح بالاتصالات:
```conf
host    all             all             0.0.0.0/0               scram-sha-256
```

3. أعد تشغيل خدمة PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### الخطوة 4: فتح منفذ PostgreSQL في الجدار الناري (Firewall)
```bash
sudo ufw allow 5432/tcp
```

---

## 3. رفع الهيكلية (Schema Migration) إلى الداتابيز الجديدة

يمكنك رفع الهيكلية (الجداول والتصميم) إلى داتابيز VPS مباشرة من جهازك المحمول/المشروع بأحد الأسلوبين:

### الأسلوب الأول: أمر مخصص لـ VPS
```bash
pnpm --filter @workspace/db run push:vps
```

### الأسلوب الثاني: باستخدام `.env`
1. اضبط `DB_TARGET=vps` في ملف `.env`.
2. نفّذ الأمر التالي:
```bash
pnpm --filter @workspace/db run push
```

---

## 4. نقل البيانات الكاملة من Neon DB إلى VPS DB

لتصدير جميع البيانات والحركات الحالية من Neon DB واستيرادها على VPS:

### الخطوة A: سحب النسخة الاحتياطية من Neon DB
```bash
pg_dump "postgresql://<NEON_USER>:<NEON_PASSWORD>@<NEON_HOST>/neondb?sslmode=require" --clean --if-exists --no-owner --no-privileges -f neon_backup.sql
```

### الخطوة B: استيراد الداتا إلى داتابيز VPS
```bash
psql "postgresql://<VPS_USER>:<VPS_PASSWORD>@<VPS_IP>:5432/marketflow_db" -f neon_backup.sql
```

### طريقة مباشرة (Dump & Restore في أمر واحد):
```bash
pg_dump "postgresql://<NEON_USER>:<NEON_PASSWORD>@<NEON_HOST>/neondb?sslmode=require" --clean --if-exists --no-owner --no-privileges | psql "postgresql://<VPS_USER>:<VPS_PASSWORD>@<VPS_IP>:5432/marketflow_db"
```

---

## 5. الأوامر المتاحة في المشروع

| الأمر | الوصف |
|---|---|
| `pnpm --filter @workspace/db run push` | رفع الهيكلية على الداتابيز المحددة في `DB_TARGET` |
| `pnpm --filter @workspace/db run push:neon` | رفع الهيكلية مباشرة على Neon DB |
| `pnpm --filter @workspace/db run push:vps` | رفع الهيكلية مباشرة على VPS DB |
| `pnpm --filter @workspace/db run push-force:vps` | قوة الرفع على VPS وتجاوز أي تعارضات |

---

## 6. التحقق واختبار الاتصال

اختبار الاتصال بداتابيز VPS من جهازك:
```bash
psql -h 169.58.1.255 -U marketflow_user -d marketflow_db
```
وعند تشغيل السيرفر الرئيسي (`npm run dev` أو `pnpm run dev`) سيتصل بالتارجت المحدد في `DB_TARGET`.
