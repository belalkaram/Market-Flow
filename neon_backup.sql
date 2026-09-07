--
-- PostgreSQL database dump
--

\restrict GA1qvlGcgb0VkUtyEdZ8K2kRdx194doB7bfmrfGK3vIi9LXzT6zgNN3CF6YczpY

-- Dumped from database version 17.10 (2947584)
-- Dumped by pg_dump version 18.3

-- Started on 2026-07-27 18:32:52

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.tenant_settings DROP CONSTRAINT IF EXISTS tenant_settings_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_task_id_tasks_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_created_by_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.store_subscriptions DROP CONSTRAINT IF EXISTS store_subscriptions_store_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.store_subscriptions DROP CONSTRAINT IF EXISTS store_subscriptions_plan_id_subscription_plans_id_fk;
ALTER TABLE IF EXISTS ONLY public.store_payments DROP CONSTRAINT IF EXISTS store_payments_subscription_id_store_subscriptions_id_fk;
ALTER TABLE IF EXISTS ONLY public.store_payments DROP CONSTRAINT IF EXISTS store_payments_store_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.security_logs DROP CONSTRAINT IF EXISTS security_logs_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.security_logs DROP CONSTRAINT IF EXISTS security_logs_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.security_logs DROP CONSTRAINT IF EXISTS security_logs_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_customer_id_customers_id_fk;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_cashier_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.sales_order_items DROP CONSTRAINT IF EXISTS sales_order_items_sales_order_id_sales_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.sales_order_items DROP CONSTRAINT IF EXISTS sales_order_items_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_permissions_id_fk;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_supplier_id_suppliers_id_fk;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_purchase_order_id_purchase_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.platform_audit_logs DROP CONSTRAINT IF EXISTS platform_audit_logs_super_admin_id_platform_admins_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_requests DROP CONSTRAINT IF EXISTS order_requests_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_requests DROP CONSTRAINT IF EXISTS order_requests_created_by_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_requests DROP CONSTRAINT IF EXISTS order_requests_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.inventory_adjustments DROP CONSTRAINT IF EXISTS inventory_adjustments_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.inventory_adjustments DROP CONSTRAINT IF EXISTS inventory_adjustments_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.inventory_adjustments DROP CONSTRAINT IF EXISTS inventory_adjustments_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.inventory_adjustments DROP CONSTRAINT IF EXISTS inventory_adjustments_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.inventory_adjustments DROP CONSTRAINT IF EXISTS inventory_adjustments_approved_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_approved_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_branch_id_branches_id_fk;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_branch_id_branches_id_fk;
DROP INDEX IF EXISTS public.users_tenant_id_idx;
DROP INDEX IF EXISTS public.users_role_id_idx;
DROP INDEX IF EXISTS public.users_email_idx;
DROP INDEX IF EXISTS public.tasks_tenant_id_idx;
DROP INDEX IF EXISTS public.tasks_status_idx;
DROP INDEX IF EXISTS public.tasks_assigned_to_idx;
DROP INDEX IF EXISTS public.task_comments_task_id_idx;
DROP INDEX IF EXISTS public.support_tickets_tenant_id_idx;
DROP INDEX IF EXISTS public.support_tickets_status_idx;
DROP INDEX IF EXISTS public.support_tickets_created_at_idx;
DROP INDEX IF EXISTS public.suppliers_tenant_id_idx;
DROP INDEX IF EXISTS public.store_subscriptions_store_id_idx;
DROP INDEX IF EXISTS public.store_payments_store_id_idx;
DROP INDEX IF EXISTS public.stock_movements_type_idx;
DROP INDEX IF EXISTS public.stock_movements_tenant_id_idx;
DROP INDEX IF EXISTS public.stock_movements_product_id_idx;
DROP INDEX IF EXISTS public.stock_movements_created_at_idx;
DROP INDEX IF EXISTS public.security_logs_user_id_idx;
DROP INDEX IF EXISTS public.security_logs_tenant_id_idx;
DROP INDEX IF EXISTS public.security_logs_severity_idx;
DROP INDEX IF EXISTS public.security_logs_event_idx;
DROP INDEX IF EXISTS public.security_logs_created_at_idx;
DROP INDEX IF EXISTS public.sales_orders_tenant_id_idx;
DROP INDEX IF EXISTS public.sales_orders_status_idx;
DROP INDEX IF EXISTS public.sales_orders_created_at_idx;
DROP INDEX IF EXISTS public.sales_orders_cashier_id_idx;
DROP INDEX IF EXISTS public.sales_orders_branch_id_idx;
DROP INDEX IF EXISTS public.sales_order_items_order_id_idx;
DROP INDEX IF EXISTS public.roles_tenant_id_idx;
DROP INDEX IF EXISTS public.role_permissions_role_id_idx;
DROP INDEX IF EXISTS public.purchase_orders_tenant_id_idx;
DROP INDEX IF EXISTS public.purchase_orders_supplier_id_idx;
DROP INDEX IF EXISTS public.purchase_orders_status_idx;
DROP INDEX IF EXISTS public.purchase_order_items_order_id_idx;
DROP INDEX IF EXISTS public.products_tenant_id_idx;
DROP INDEX IF EXISTS public.products_sku_idx;
DROP INDEX IF EXISTS public.products_category_id_idx;
DROP INDEX IF EXISTS public.products_barcode_idx;
DROP INDEX IF EXISTS public.platform_audit_logs_created_at_idx;
DROP INDEX IF EXISTS public.platform_audit_logs_admin_id_idx;
DROP INDEX IF EXISTS public.order_requests_tenant_id_idx;
DROP INDEX IF EXISTS public.order_requests_status_idx;
DROP INDEX IF EXISTS public.order_requests_created_at_idx;
DROP INDEX IF EXISTS public.inventory_adjustments_tenant_id_idx;
DROP INDEX IF EXISTS public.inventory_adjustments_product_id_idx;
DROP INDEX IF EXISTS public.expenses_tenant_id_idx;
DROP INDEX IF EXISTS public.expenses_expense_date_idx;
DROP INDEX IF EXISTS public.expenses_branch_id_idx;
DROP INDEX IF EXISTS public.customers_tenant_id_idx;
DROP INDEX IF EXISTS public.customers_phone_idx;
DROP INDEX IF EXISTS public.categories_tenant_id_idx;
DROP INDEX IF EXISTS public.branches_tenant_id_idx;
DROP INDEX IF EXISTS public.audit_logs_user_id_idx;
DROP INDEX IF EXISTS public.audit_logs_tenant_id_idx;
DROP INDEX IF EXISTS public.audit_logs_entity_type_idx;
DROP INDEX IF EXISTS public.audit_logs_created_at_idx;
DROP INDEX IF EXISTS public.activity_logs_user_id_idx;
DROP INDEX IF EXISTS public.activity_logs_tenant_id_idx;
DROP INDEX IF EXISTS public.activity_logs_created_at_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_tenant_email_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_slug_unique;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.tenant_settings DROP CONSTRAINT IF EXISTS tenant_settings_tenant_id_setting_key_pk;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.store_subscriptions DROP CONSTRAINT IF EXISTS store_subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.store_payments DROP CONSTRAINT IF EXISTS store_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.security_logs DROP CONSTRAINT IF EXISTS security_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_order_items DROP CONSTRAINT IF EXISTS sales_order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_tenant_slug_unique;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_unique;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.platform_audit_logs DROP CONSTRAINT IF EXISTS platform_audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.platform_admins DROP CONSTRAINT IF EXISTS platform_admins_pkey;
ALTER TABLE IF EXISTS ONLY public.platform_admins DROP CONSTRAINT IF EXISTS platform_admins_email_unique;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_resource_action_unique;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.order_requests DROP CONSTRAINT IF EXISTS order_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_adjustments DROP CONSTRAINT IF EXISTS inventory_adjustments_pkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.tenant_settings;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.task_comments;
DROP TABLE IF EXISTS public.support_tickets;
DROP TABLE IF EXISTS public.suppliers;
DROP TABLE IF EXISTS public.subscription_plans;
DROP TABLE IF EXISTS public.store_subscriptions;
DROP TABLE IF EXISTS public.store_payments;
DROP TABLE IF EXISTS public.stock_movements;
DROP TABLE IF EXISTS public.security_logs;
DROP TABLE IF EXISTS public.sales_orders;
DROP TABLE IF EXISTS public.sales_order_items;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.purchase_orders;
DROP TABLE IF EXISTS public.purchase_order_items;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.platform_audit_logs;
DROP TABLE IF EXISTS public.platform_admins;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.order_requests;
DROP TABLE IF EXISTS public.inventory_adjustments;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.customers;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.branches;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.activity_logs;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 24807)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    branch_id uuid,
    user_id uuid,
    user_name text,
    action text NOT NULL,
    page text,
    details text,
    ip_address text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 24816)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    branch_id uuid,
    user_id uuid,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    metadata jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 24576)
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    city text,
    address text,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 223 (class 1259 OID 24652)
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    icon text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 24715)
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    loyalty_points integer DEFAULT 0 NOT NULL,
    total_purchases numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_visit_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 235 (class 1259 OID 24794)
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    type text NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    is_approved boolean DEFAULT false NOT NULL,
    approved_by uuid,
    created_by uuid,
    expense_date timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 24755)
-- Name: inventory_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    product_id uuid NOT NULL,
    adjustment_type text NOT NULL,
    quantity integer NOT NULL,
    reason text,
    approved_by uuid,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 244 (class 1259 OID 24901)
-- Name: order_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    branch_id uuid,
    created_by_id uuid,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text,
    customer_area text,
    notes text,
    payment_method text NOT NULL,
    delivery_method text NOT NULL,
    items jsonb NOT NULL,
    subtotal text NOT NULL,
    discount text DEFAULT '0'::text NOT NULL,
    delivery_fee text DEFAULT '0'::text NOT NULL,
    total text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 24606)
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    description text
);


--
-- TOC entry 239 (class 1259 OID 24835)
-- Name: platform_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_admins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 24848)
-- Name: platform_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    super_admin_id uuid,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    metadata jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 24664)
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    category_id uuid,
    name text NOT NULL,
    barcode text,
    sku text,
    unit text DEFAULT 'قطعة'::text NOT NULL,
    purchase_price numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    sale_price numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    tax_percent numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    min_stock integer DEFAULT 0 NOT NULL,
    current_stock integer DEFAULT 0 NOT NULL,
    expiry_date timestamp without time zone,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 225 (class 1259 OID 24681)
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    received_quantity integer DEFAULT 0 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 24689)
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    supplier_id uuid NOT NULL,
    order_number text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    total_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    ordered_at timestamp without time zone DEFAULT now() NOT NULL,
    received_at timestamp without time zone,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 24616)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 24624)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 24728)
-- Name: sales_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sales_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    tax_percent numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    total_price numeric(12,2) NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 24739)
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    customer_id uuid,
    cashier_id uuid,
    invoice_number text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    subtotal numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    discount_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 24825)
-- Name: security_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    tenant_id uuid,
    branch_id uuid,
    event text NOT NULL,
    severity text DEFAULT 'low'::text NOT NULL,
    ip_address text,
    user_agent text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 24764)
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    product_id uuid NOT NULL,
    type text NOT NULL,
    quantity_before integer NOT NULL,
    quantity_change integer NOT NULL,
    quantity_after integer NOT NULL,
    reference_type text,
    reference_id uuid,
    notes text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 24857)
-- Name: store_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    subscription_id uuid,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'KWD'::text NOT NULL,
    payment_method text DEFAULT 'manual'::text NOT NULL,
    status text DEFAULT 'paid'::text NOT NULL,
    paid_at timestamp without time zone DEFAULT now() NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 24870)
-- Name: store_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    plan_id uuid,
    status text DEFAULT 'trial'::text NOT NULL,
    starts_at timestamp without time zone DEFAULT now() NOT NULL,
    ends_at timestamp without time zone,
    trial_ends_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 24882)
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price_monthly numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    price_yearly numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    currency text DEFAULT 'KWD'::text NOT NULL,
    max_users integer DEFAULT 5 NOT NULL,
    max_branches integer DEFAULT 1 NOT NULL,
    max_products integer DEFAULT 100 NOT NULL,
    features jsonb,
    is_active boolean DEFAULT true NOT NULL,
    is_recommended boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 24702)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    tax_number text,
    balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    rating numeric(3,1) DEFAULT 5.0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 245 (class 1259 OID 24914)
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    branch_id uuid,
    created_by_id uuid,
    title text NOT NULL,
    department text NOT NULL,
    description text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    internal_note text,
    reply_message text,
    assigned_to text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 24773)
-- Name: task_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 24782)
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    due_date timestamp without time zone,
    assigned_to uuid,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 246 (class 1259 OID 32768)
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_settings (
    tenant_id uuid NOT NULL,
    setting_key text NOT NULL,
    setting_value text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 24587)
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    phone text,
    address text,
    tax_number text,
    currency text DEFAULT 'KWD'::text NOT NULL,
    timezone text DEFAULT 'Asia/Kuwait'::text NOT NULL,
    owner_user_id uuid,
    status text DEFAULT 'trial'::text NOT NULL,
    trial_starts_at timestamp without time zone DEFAULT now(),
    trial_ends_at timestamp without time zone,
    trial_days integer DEFAULT 10 NOT NULL,
    subscription_status text DEFAULT 'trial'::text NOT NULL,
    current_plan_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 222 (class 1259 OID 24637)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    role_id uuid,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    phone text,
    avatar text,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    account_locked_until timestamp without time zone,
    must_change_password boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 3825 (class 0 OID 24807)
-- Dependencies: 236
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, tenant_id, branch_id, user_id, user_name, action, page, details, ip_address, created_at) FROM stdin;
34da16fc-f61a-4557-994e-d34be0b4eb7f	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-22 11:29:02.328686
d24e1b82-4d3d-489a-ac56-1b232fc7ca5c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-22 11:30:43.361545
2427e3e8-bfc8-4c4c-98b2-35a0b57afc9c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 11:31:16.476973
42c2c9f6-4554-4b08-ac87-8de776190708	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 11:34:03.168964
dfb65d4e-a788-43a6-82db-d59793efda58	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 11:45:51.603543
3aed21b9-d98f-413f-9d44-146af07ef417	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 12:40:51.685157
7f49cce2-04d0-4ba3-bf9c-70f7840dfc3f	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 13:18:39.103337
688a5217-6673-450c-b166-cf4aadecb95a	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 13:22:15.397891
5e87518c-08d1-4510-a0d2-3c07d4869577	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	b1a5a370-1369-44e7-8a92-4e0e01db80a5	خالد المطيري	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 13:23:06.355638
b3f78ea8-e341-4bf7-b278-3b22f40774a0	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	b1a5a370-1369-44e7-8a92-4e0e01db80a5	خالد المطيري	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 13:23:17.547473
dd4aa68a-fd18-407f-bfd5-7bf7e988d9f9	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	c0d02483-0cf2-4542-9429-e0751a533434	عمر فاروق	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 13:23:26.180364
4de41dbb-046d-4c6c-9431-d946ab20f172	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 13:23:32.028303
71989eab-3876-425c-a822-71e3475ba234	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	c0d02483-0cf2-4542-9429-e0751a533434	عمر فاروق	login	auth	تسجيل دخول ناجح	::ffff:127.0.0.1	2026-05-22 13:24:03.122399
8076a6eb-a926-41df-9da8-f237c819d2f9	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-22 20:04:15.576305
f7c03fd6-82ff-4b9c-a29d-2a3f146ae69c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-22 20:07:18.97781
aa54c328-4b32-491e-ae08-dbe4e9d75edd	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-24 07:28:11.891479
f10f1ac6-a8f1-49cd-9722-3d99c1b4648a	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-24 07:34:07.796362
a1a5f469-3b2f-433b-9fd6-b3fed1f4cd16	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-24 10:13:43.377517
d42456c1-3772-4955-9feb-c2015862fed8	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-24 13:16:52.286728
efa5e26f-a336-4b70-9f36-4174044e6cf5	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-24 13:28:03.224755
f0e8c054-b783-4830-ac31-320b3d43d3b2	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-05-24 15:43:49.35884
90edb0cb-4f4c-43ea-849a-055b6c8b6f1b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	a521fb2e-7a48-4753-8663-4defdd60dc87	سلطان العمري	login	auth	تسجيل دخول ناجح	::1	2026-07-24 20:27:51.358738
d059f2c8-1fff-42d4-a57c-334156de4375	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	أحمد الكنوز	login	auth	تسجيل دخول ناجح	::1	2026-07-24 20:28:07.548777
\.


--
-- TOC entry 3826 (class 0 OID 24816)
-- Dependencies: 237
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, tenant_id, branch_id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 3806 (class 0 OID 24576)
-- Dependencies: 217
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, tenant_id, name, city, address, phone, is_active, created_at, updated_at, deleted_at) FROM stdin;
0d30fd6b-87d7-4be2-84e5-1376d883e8d5	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	الفرع الرئيسي	الكويت	شارع الخليج العربي، الكويت	96599001122	t	2026-05-22 11:27:18.498272	2026-05-22 11:27:18.498272	\N
9312acbb-8458-4da5-8c7c-464481a64d55	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	فرع القاهرة	القاهرة	شارع التحرير، الدقي، القاهرة	01012345678	t	2026-05-22 11:27:18.498272	2026-05-22 11:27:18.498272	\N
c272eab1-878e-4215-8821-f6196582c577	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	فرع الكويت	الكويت	شارع السالمية، الكويت	96599003344	f	2026-05-22 11:27:18.498272	2026-05-24 15:51:48.93	\N
\.


--
-- TOC entry 3812 (class 0 OID 24652)
-- Dependencies: 223
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, tenant_id, name, icon, sort_order, is_active, created_at, updated_at) FROM stdin;
85068f57-9b96-4096-9e86-126b847d685b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	ألبان ومشتقات	Milk	1	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
a2606fcb-8e95-41e4-92e6-7f6262aaa9c7	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مشروبات	Coffee	2	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
a7d0cf69-0108-46d7-bb52-76ccd61ec874	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	بقالة وحبوب	ShoppingBag	3	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
45a0231e-c3b3-4912-a930-602d20aad6da	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	منظفات ومستلزمات	SprayCan	4	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
ce3fbef6-1840-4736-b913-b23512327270	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	لحوم ودواجن	Drumstick	5	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
25de52c5-da46-49d5-baa9-4f513414c686	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مجمدات	Snowflake	6	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
219e1005-f2b3-49c0-bdbd-5f7d2f0e6ff8	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مخبوزات وحلويات	Cookie	7	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
e46531e1-1a19-4cd9-9c6e-ca321df53383	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	خضار وفاكهة	Apple	8	t	2026-05-22 11:27:19.089717	2026-05-22 11:27:19.089717
\.


--
-- TOC entry 3817 (class 0 OID 24715)
-- Dependencies: 228
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, tenant_id, name, phone, email, address, loyalty_points, total_purchases, is_active, last_visit_at, created_at, updated_at, deleted_at) FROM stdin;
152f9980-921b-4ec1-9182-c917d221f934	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	محمد سلامة	96599221133	\N	\N	150	15000.00	t	\N	2026-05-22 11:27:19.678094	2026-05-22 11:27:19.678094	\N
5274864e-abf9-474f-b0f5-99c650c828d3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	أحمد شوقي	01033445566	\N	\N	85	8500.00	t	\N	2026-05-22 11:27:19.678094	2026-05-22 11:27:19.678094	\N
c043b3dc-f7da-433c-b90b-8860eaca13f8	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	فاطمة الزهراء	96555778899	\N	\N	220	22000.00	t	\N	2026-05-22 11:27:19.678094	2026-05-22 11:27:19.678094	\N
32783229-24d3-4446-a395-b53223ed6d99	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	عبدالله المنصور	96599334455	\N	\N	52	5200.00	t	\N	2026-05-22 11:27:19.678094	2026-05-22 11:27:19.678094	\N
\.


--
-- TOC entry 3824 (class 0 OID 24794)
-- Dependencies: 235
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, tenant_id, branch_id, type, description, amount, payment_method, is_approved, approved_by, created_by, expense_date, created_at, updated_at) FROM stdin;
3e752825-3294-4fa8-82ed-8d4c145cf114	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	rent	إيجار المستودع الرئيسي - شهر مارس	5000.00	bank_transfer	t	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	2024-03-01 00:00:00	2026-05-22 11:27:20.723494	2026-05-22 11:27:20.723494
4bc7ed1d-0af7-4c17-ba3d-8b35267d804d	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	utilities	فاتورة الكهرباء - فرع الكويت	850.00	cash	t	\N	5ff04ce3-9fed-49c2-8c58-6bc9261f994a	2024-03-10 00:00:00	2026-05-22 11:27:20.723494	2026-05-22 11:27:20.723494
eedb7f27-74e2-4fc0-acbd-d4aa704a6f3d	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	maintenance	صيانة أجهزة نقطة البيع	1200.00	cash	f	\N	c0d02483-0cf2-4542-9429-e0751a533434	2024-03-15 00:00:00	2026-05-22 11:27:20.723494	2026-05-22 11:27:20.723494
df1c7ec4-a7cd-4a3b-bf51-f29b18ba9af6	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	salaries	سلف موظف - خالد المطيري	2000.00	cash	t	\N	a521fb2e-7a48-4753-8663-4defdd60dc87	2024-03-20 00:00:00	2026-05-22 11:27:20.723494	2026-05-22 11:27:20.723494
\.


--
-- TOC entry 3820 (class 0 OID 24755)
-- Dependencies: 231
-- Data for Name: inventory_adjustments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_adjustments (id, tenant_id, branch_id, product_id, adjustment_type, quantity, reason, approved_by, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 3833 (class 0 OID 24901)
-- Dependencies: 244
-- Data for Name: order_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_requests (id, tenant_id, branch_id, created_by_id, customer_name, customer_phone, customer_address, customer_area, notes, payment_method, delivery_method, items, subtotal, discount, delivery_fee, total, status, created_at, updated_at) FROM stdin;
dc9fd6dc-d4d8-4ee1-91a4-f9b8a8c5517e	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	محمد أحمد	0501234567	شارع الخليج	الرياض	\N	cash_on_delivery	delivery	[{"quantity": 1, "productId": "ced331d9-dc96-40b9-b2e6-82187b9fbf8a", "unitPrice": 52, "totalPrice": 52, "productName": "جبنة بيضاء دومتي 500 جرام"}]	52	0	0	52	new	2026-05-22 11:30:00.974583	2026-05-22 11:30:00.974583
c1763b0a-a7ed-47c7-956b-c6e83a3049dd	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	fghg	0101903361		jeddah		cash_on_delivery	pickup	[{"quantity": 1, "productId": "ced331d9-dc96-40b9-b2e6-82187b9fbf8a", "unitPrice": 52, "totalPrice": 52, "productName": "جبنة بيضاء دومتي 500 جرام"}, {"quantity": 1, "productId": "9903d0fd-ade2-43e9-b4ed-26b0193f9f2c", "unitPrice": 25, "totalPrice": 25, "productName": "عصير مانجو بيتي 1 لتر"}, {"quantity": 1, "productId": "e087f4ec-bdca-4795-a738-fb713f4e0e8f", "unitPrice": 38, "totalPrice": 38, "productName": "بيتزا الأولى مجمدة"}]	115	0	0	115	new	2026-05-22 12:39:55.718541	2026-05-22 12:39:55.718541
b54465ea-13aa-4940-b56d-57bed0e3a6bf	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	bgnhn	01019033661		nghngh	hmgj	cash_on_delivery	pickup	[{"quantity": 1, "productId": "758b4df5-2528-447f-9fd6-960eeb1362e7", "unitPrice": 32, "totalPrice": 32, "productName": "لبن كامل الدسم جهينة 1 لتر"}, {"quantity": 1, "productId": "9903d0fd-ade2-43e9-b4ed-26b0193f9f2c", "unitPrice": 25, "totalPrice": 25, "productName": "عصير مانجو بيتي 1 لتر"}, {"quantity": 1, "productId": "7bd6b481-e43e-4cc6-b211-f5fa8c73ec5a", "unitPrice": 160, "totalPrice": 160, "productName": "قهوة نسكافيه سريعة التحضير 200 جرام"}]	217	0	0	217	new	2026-05-24 13:19:24.50314	2026-05-24 13:19:24.50314
\.


--
-- TOC entry 3808 (class 0 OID 24606)
-- Dependencies: 219
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, resource, action, description) FROM stdin;
fa1a0ae1-0f94-4907-a935-4d847aaeb186	dashboard	view	view:dashboard
c7b0a59a-d726-4709-b3fe-ff5fe867819b	dashboard	create	create:dashboard
32e2191f-ab14-45fc-8c08-1a097d34506c	dashboard	update	update:dashboard
db44c275-553d-48c6-90dd-84f7d5cbe1f5	dashboard	delete	delete:dashboard
ac2ac696-e865-420d-91f5-8f8368963793	pos	view	view:pos
3933d3ac-b5bb-424a-b6f2-b9b47f29cfa7	pos	create	create:pos
9fa2ba1e-7940-4cfa-b010-75b386bed54e	pos	update	update:pos
d866d692-79ac-4946-bb80-1aa33ab7b13c	pos	delete	delete:pos
57da45e1-2c4b-4c57-9bdf-a009e1bcd574	products	view	view:products
291d6e1c-9d5a-423f-9d32-f7ce8f885e2c	products	create	create:products
17e7fc2c-a170-4147-a4cd-04b170952fac	products	update	update:products
2f66b5fd-ad37-4eae-ab32-c88f5ca83ee3	products	delete	delete:products
5f6bac98-2aee-43be-a633-daccff18c43f	categories	view	view:categories
8fcca248-b4ec-4977-9d13-1f2fbca7cda2	categories	create	create:categories
b9b3bd2f-7297-440b-bdfd-e161d1e6343c	categories	update	update:categories
f12a5972-b340-4aa6-8898-dc631f804123	categories	delete	delete:categories
2477b7b8-a692-4b20-bfba-5e607d97d299	inventory	view	view:inventory
1389dfc6-5181-4be0-a0b3-2fca52d47e57	inventory	create	create:inventory
cf0fdb78-6819-4b2d-9048-e73688cdfb71	inventory	update	update:inventory
c03dd54a-72a7-49f6-b8ab-a99fc88ef4c0	inventory	delete	delete:inventory
1ab7a8cf-449d-4329-8f6c-aa928c81bf30	stock-movements	view	view:stock-movements
bbb416eb-60e4-436f-aae6-ff1692a2f918	stock-movements	create	create:stock-movements
9db449dc-bca8-4ede-b249-121fdf7d127f	stock-movements	update	update:stock-movements
029a21d9-910a-479d-92bb-28b73796e2a8	stock-movements	delete	delete:stock-movements
3e2608da-d626-4c49-8f65-964a6d7b610d	purchases	view	view:purchases
eba838a8-c7bd-4fa6-bd0a-7390c5d4bf0c	purchases	create	create:purchases
0aa26c68-1c9e-40eb-a1a6-83089007f6aa	purchases	update	update:purchases
5a6f5ea8-36dc-4419-89e2-c3aeee551d50	purchases	delete	delete:purchases
66ff0c48-15f8-41f2-a66f-c1076171cc30	suppliers	view	view:suppliers
370a803d-6509-4c8a-8012-726c8a3df197	suppliers	create	create:suppliers
f0cfe329-4b2d-4bf0-86d1-f10e35dcb936	suppliers	update	update:suppliers
e9cda49b-7c06-48fb-8ab2-4287cd5f0ae3	suppliers	delete	delete:suppliers
e3c6d808-83fb-4b5d-92a8-8c94c448814a	sales	view	view:sales
94b3a522-fa8b-4ec4-a0af-d9178d3b3719	sales	create	create:sales
aacfd283-8e2b-4636-bea5-807358c19f3a	sales	update	update:sales
e83ecb1b-2148-463d-bc52-1f0e7985c9cb	sales	delete	delete:sales
8752c5c6-6a4a-4365-9346-c209f1f0df48	returns	view	view:returns
7a2eeec6-4c63-4263-9177-1a112812a7f2	returns	create	create:returns
31b410f6-f0bf-42c5-99ff-85696a7079d4	returns	update	update:returns
8b72962d-a5dd-4cc6-a807-49d5fbf083c2	returns	delete	delete:returns
37ac4db1-e605-42ed-b8a1-76daf023ba48	customers	view	view:customers
be1f384b-855e-402e-b9b6-78dc6c16437b	customers	create	create:customers
6fcce6cc-ac33-4e9a-b7e0-d3838ca6f867	customers	update	update:customers
c63d1985-864a-4371-be56-6f414ea37813	customers	delete	delete:customers
677d4299-7aaf-40c0-8b86-cf121cd44217	expenses	view	view:expenses
1dd1a701-6f5b-411e-a6c4-097da46ddc48	expenses	create	create:expenses
8b4911f7-10c0-4abf-9fee-c2e3c7625e4d	expenses	update	update:expenses
0cd7749f-05ce-4b3e-9a2a-fb3cf5e27559	expenses	delete	delete:expenses
9012fbb6-381c-47a5-b87c-c45b082e020e	accounting	view	view:accounting
5e2de66c-4541-4e5e-bc1f-4ad44057896c	accounting	create	create:accounting
d6886575-e452-4622-9d8a-7adf415480c5	accounting	update	update:accounting
395f88b0-85f6-4ab0-b628-bfa6b0e57870	accounting	delete	delete:accounting
bbac1077-a6ab-4160-8e48-b8251da43843	reports	view	view:reports
301dcf51-68d2-4439-9b99-02da1ec733b8	reports	create	create:reports
5540bcea-3dd8-49df-8526-5456641abaac	reports	update	update:reports
4d0ea855-5faa-491a-9a0c-1bd5ff7a4525	reports	delete	delete:reports
94431a99-0017-4fa4-b56c-7b013cdf2599	tasks	view	view:tasks
0d9955ce-991e-4872-a417-23b916e8e817	tasks	create	create:tasks
5c166e6b-f3b0-4fec-8246-72b27f6e192d	tasks	update	update:tasks
c93b1478-17c6-400f-9e7e-6af63156bf5c	tasks	delete	delete:tasks
71e03254-8afc-4aa1-b9a3-d007a80a5439	employees	view	view:employees
168b5179-d418-4077-b033-1224015264bd	employees	create	create:employees
1507644f-dbe5-41ca-b06d-d8c9a54f8d7b	employees	update	update:employees
8aea62cd-2101-4c21-800d-9d8e061413fc	employees	delete	delete:employees
0e845288-af2b-4da4-bcb0-4541c4277e9e	roles	view	view:roles
f7252488-1337-4b81-80ea-2a0442bfb6d6	roles	create	create:roles
0ca89143-6a38-4a6e-84a1-6a20448d4181	roles	update	update:roles
c7163d7a-650a-43f7-bad6-74b431e39781	roles	delete	delete:roles
dfaf1ad4-9826-4c12-b5df-45617331d075	branches	view	view:branches
bbc0219a-ec22-425d-b6e8-9042307b0583	branches	create	create:branches
1b7e1a5a-7f37-4195-a4e2-2e12a9698f81	branches	update	update:branches
32cd81e8-5594-40c9-b6b1-08a2653afe4f	branches	delete	delete:branches
b276e118-8d42-42d6-b425-d879300b2a60	notifications	view	view:notifications
6f0ca390-34cf-48b4-a460-6c6fd6c657e3	notifications	create	create:notifications
da44ee02-361a-44d8-afac-a04317134a53	notifications	update	update:notifications
51d43680-fb57-4c6d-9e39-e211fcaa5346	notifications	delete	delete:notifications
4e42c236-1a71-4a3a-84b8-71e0efe33b9d	settings	view	view:settings
876bdfae-1535-46f2-a725-49e6832c8332	settings	create	create:settings
1995a5a4-932c-4927-a10a-b213d4b9f4f7	settings	update	update:settings
45526014-ee84-44d0-bf72-20201dfd0054	settings	delete	delete:settings
1bbda6a3-a53b-42f8-8952-9e0a8bdb9c36	profile	view	view:profile
27f31c3a-997f-4805-a280-3b7435f3e951	profile	create	create:profile
c2a0e627-28ed-43ea-a8a3-902958f649ef	profile	update	update:profile
fdf1b8d8-5f62-4a88-b0b8-cc6a5311e90a	profile	delete	delete:profile
2015f586-2222-433a-85bc-be14a1ef0146	activity-logs	view	view:activity-logs
f8924ed5-9a4f-45cd-8107-a77aff815e73	activity-logs	create	create:activity-logs
7d16eb25-bd9e-4fbe-8264-511b5e1e01f9	activity-logs	update	update:activity-logs
96c96b87-0337-4c69-9bc5-985eb45367ee	activity-logs	delete	delete:activity-logs
\.


--
-- TOC entry 3828 (class 0 OID 24835)
-- Dependencies: 239
-- Data for Name: platform_admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_admins (id, name, email, password_hash, status, created_at, updated_at) FROM stdin;
6618639c-d766-40a0-b44c-ee18b25d84e3	مشرف النظام	superadmin@marketflow.app	$2b$12$zjk7hbjc1d84jgyGBe9VDeFnfRXFXPlSvEkR/x0M8wm/NvDkoTjnC	active	2026-05-22 11:27:14.629765	2026-05-22 11:27:14.629765
\.


--
-- TOC entry 3829 (class 0 OID 24848)
-- Dependencies: 240
-- Data for Name: platform_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_audit_logs (id, super_admin_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 3813 (class 0 OID 24664)
-- Dependencies: 224
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, tenant_id, category_id, name, barcode, sku, unit, purchase_price, sale_price, tax_percent, min_stock, current_stock, expiry_date, image_url, is_active, created_by, created_at, updated_at, deleted_at) FROM stdin;
ab62e181-5331-40a0-9e98-ca4a3eead28c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	219e1005-f2b3-49c0-bdbd-5f7d2f0e6ff8	بسكويت أوريو 6 قطع	6221043101010	SNC-ORE-006	قطعة	8.00	10.00	14.00	50	120	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-22 11:27:19.385432	\N
9903d0fd-ade2-43e9-b4ed-26b0193f9f2c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a2606fcb-8e95-41e4-92e6-7f6262aaa9c7	عصير مانجو بيتي 1 لتر	6221043111111	BEV-BEY-001	قطعة	18.00	25.00	14.00	40	60	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-22 11:27:19.385432	\N
7bd6b481-e43e-4cc6-b211-f5fa8c73ec5a	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a2606fcb-8e95-41e4-92e6-7f6262aaa9c7	قهوة نسكافيه سريعة التحضير 200 جرام	6221043121212	BEV-NES-200	قطعة	130.00	160.00	14.00	15	40	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-22 11:27:19.385432	\N
fec17daf-0fa8-42c1-8a41-d4993c0ba5f2	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	e46531e1-1a19-4cd9-9c6e-ca321df53383	تفاح أحمر 1 كيلو	6221043131313	FRU-APP-001	كيلو	15.00	22.00	0.00	30	80	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-22 11:27:19.385432	\N
e143f4ff-195c-4031-b498-58e6332879d4	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	ce3fbef6-1840-4736-b913-b23512327270	دجاج كامل مبرد 1 كيلو	6221043141414	MEA-CHK-001	كيلو	18.00	28.00	0.00	50	35	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-22 11:27:19.385432	\N
e087f4ec-bdca-4795-a738-fb713f4e0e8f	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	25de52c5-da46-49d5-baa9-4f513414c686	بيتزا الأولى مجمدة	6221043151515	FRZ-PIZ-001	قطعة	25.00	38.00	14.00	20	45	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-22 11:27:19.385432	\N
f1a8286d-a4bb-46a6-9a9d-e0c66c298cd6	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a2606fcb-8e95-41e4-92e6-7f6262aaa9c7	شاي ناعم ليبتون 250 جرام	6221043055555	BEV-LIP-250	قطعة	45.00	55.00	14.00	40	85	\N	\N	f	\N	2026-05-22 11:27:19.385432	2026-05-22 13:24:12.389	2026-05-22 13:24:12.389
45493d1f-2e52-46c8-bf0d-7d599d169b9d	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	45a0231e-c3b3-4912-a930-602d20aad6da	مسحوق غسيل أريال 2.5 كيلو	6221043099999	CLN-ARI-250	قطعة	180.00	220.00	14.00	20	33	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 08:08:44.219	\N
2e8bbf98-a438-419d-b63a-4cd84c5534a0	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a7d0cf69-0108-46d7-bb52-76ccd61ec874	مكرونة ريجينا 400 جرام	6221043088888	GRO-REG-400	قطعة	12.00	15.00	0.00	100	2	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 15:46:04.74	\N
ced331d9-dc96-40b9-b2e6-82187b9fbf8a	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	85068f57-9b96-4096-9e86-126b847d685b	جبنة بيضاء دومتي 500 جرام	6221043077777	DAI-DOM-500	قطعة	40.00	52.00	14.00	30	18	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 15:46:04.873	\N
42f2ba5a-62df-413d-b95f-1ee203d81b26	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a7d0cf69-0108-46d7-bb52-76ccd61ec874	زيت عباد الشمس عافية 1.6 لتر	6221043033333	GRO-AFI-160	قطعة	110.00	135.00	0.00	30	9	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 15:46:05.006	\N
0deedf81-e6a3-4200-b41b-4bffacb33d02	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a7d0cf69-0108-46d7-bb52-76ccd61ec874	سكر أبيض الأسرة 1 كيلو	6221043044444	GRO-OSR-001	قطعة	35.00	40.00	0.00	100	248	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 13:28:18.648	\N
a84691c2-89a0-4247-9c76-491f7c32b6ca	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a7d0cf69-0108-46d7-bb52-76ccd61ec874	أرز مصري الضحى 5 كيلو	6221043022222	GRO-DOH-005	قطعة	140.00	165.00	0.00	20	41	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 15:45:27.341	\N
758b4df5-2528-447f-9fd6-960eeb1362e7	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	85068f57-9b96-4096-9e86-126b847d685b	لبن كامل الدسم جهينة 1 لتر	6221043011111	DAI-JOH-001	قطعة	25.00	32.00	14.00	50	119	2026-04-10 00:00:00	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 15:45:27.832	\N
d0939b87-8253-43f5-8676-8fcdfb4de2c7	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	a2606fcb-8e95-41e4-92e6-7f6262aaa9c7	مياه معدنية نستله 1.5 لتر	6221043066666	BEV-NES-150	قطعة	5.50	7.50	14.00	200	449	\N	\N	t	\N	2026-05-22 11:27:19.385432	2026-05-24 15:45:27.954	\N
\.


--
-- TOC entry 3814 (class 0 OID 24681)
-- Dependencies: 225
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, received_quantity, unit_price, total_price) FROM stdin;
60e0b9bb-8bf7-43a8-86bb-6c7f4a31677d	20738fff-7752-4d92-aaaf-820b5197e8f3	758b4df5-2528-447f-9fd6-960eeb1362e7	100	100	25.00	2500.00
0a5555b3-8aea-44c1-97c4-fc98d0e7fca2	20738fff-7752-4d92-aaaf-820b5197e8f3	a84691c2-89a0-4247-9c76-491f7c32b6ca	50	50	140.00	7000.00
\.


--
-- TOC entry 3815 (class 0 OID 24689)
-- Dependencies: 226
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, tenant_id, branch_id, supplier_id, order_number, status, total_amount, notes, ordered_at, received_at, created_by, created_at, updated_at) FROM stdin;
20738fff-7752-4d92-aaaf-820b5197e8f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	2d94428e-3489-4a14-89ff-108c68787904	PO-2024-001	received	5250.00	\N	2026-05-22 11:27:19.827703	2024-03-20 00:00:00	c0d02483-0cf2-4542-9429-e0751a533434	2026-05-22 11:27:19.827703	2026-05-22 11:27:19.827703
08d90009-017c-48f4-b529-1df67fffa8a8	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	f1135356-f939-431e-b6ee-85ef9dc0f11f	PO-2024-003	draft	1800.00	\N	2026-05-22 11:27:19.827703	\N	c0d02483-0cf2-4542-9429-e0751a533434	2026-05-22 11:27:19.827703	2026-05-22 11:27:19.827703
b93040f6-eeeb-40c9-bb90-31a5c9a882f6	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	37c9e868-b607-4840-82b1-5510144674ba	PO-2024-002	received	3600.00	\N	2026-05-22 11:27:19.827703	2026-05-24 15:51:24.217	c0d02483-0cf2-4542-9429-e0751a533434	2026-05-22 11:27:19.827703	2026-05-24 15:51:24.217
\.


--
-- TOC entry 3809 (class 0 OID 24616)
-- Dependencies: 220
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, role_id, permission_id) FROM stdin;
242ff3ce-9390-411e-8ec5-60a3e359c087	ce57fe49-91a1-49d7-8048-2d10ad36ff41	fa1a0ae1-0f94-4907-a935-4d847aaeb186
18a2933d-16d9-498a-91d0-0478854ec7d0	ce57fe49-91a1-49d7-8048-2d10ad36ff41	c7b0a59a-d726-4709-b3fe-ff5fe867819b
3e392a3c-7181-47a1-9fed-9fe104e1f137	ce57fe49-91a1-49d7-8048-2d10ad36ff41	32e2191f-ab14-45fc-8c08-1a097d34506c
1adfb513-a189-4585-b99c-e7a55fcc89cf	ce57fe49-91a1-49d7-8048-2d10ad36ff41	db44c275-553d-48c6-90dd-84f7d5cbe1f5
49d55586-5249-49cc-847b-b15ae0bd0c2b	ce57fe49-91a1-49d7-8048-2d10ad36ff41	ac2ac696-e865-420d-91f5-8f8368963793
efad1ccc-ac39-46c6-af0d-9bebe198a4af	ce57fe49-91a1-49d7-8048-2d10ad36ff41	3933d3ac-b5bb-424a-b6f2-b9b47f29cfa7
08f03343-e233-4be5-8fc1-02e4d4a58f84	ce57fe49-91a1-49d7-8048-2d10ad36ff41	9fa2ba1e-7940-4cfa-b010-75b386bed54e
4f46114b-32c8-45a6-b009-1ccada7f9ca9	ce57fe49-91a1-49d7-8048-2d10ad36ff41	d866d692-79ac-4946-bb80-1aa33ab7b13c
3d514fb1-7d25-4bef-a348-523d72e7d0f9	ce57fe49-91a1-49d7-8048-2d10ad36ff41	57da45e1-2c4b-4c57-9bdf-a009e1bcd574
0f69a188-37ce-4344-b3be-887111c84b76	ce57fe49-91a1-49d7-8048-2d10ad36ff41	291d6e1c-9d5a-423f-9d32-f7ce8f885e2c
e140b097-35ba-4f86-8069-8290283cd948	ce57fe49-91a1-49d7-8048-2d10ad36ff41	17e7fc2c-a170-4147-a4cd-04b170952fac
51c9c1e6-33b4-4861-822d-68c8563bcb16	ce57fe49-91a1-49d7-8048-2d10ad36ff41	2f66b5fd-ad37-4eae-ab32-c88f5ca83ee3
31c96955-9752-4f4e-8a73-02e07b186488	ce57fe49-91a1-49d7-8048-2d10ad36ff41	5f6bac98-2aee-43be-a633-daccff18c43f
4af29cc5-ca0d-4065-a2d7-2c1535e147f4	ce57fe49-91a1-49d7-8048-2d10ad36ff41	8fcca248-b4ec-4977-9d13-1f2fbca7cda2
d55566b5-1581-43e6-9ff9-cf73fb20f635	ce57fe49-91a1-49d7-8048-2d10ad36ff41	b9b3bd2f-7297-440b-bdfd-e161d1e6343c
3f9d65ac-ff38-4ef7-9f7e-41b6b0c50903	ce57fe49-91a1-49d7-8048-2d10ad36ff41	f12a5972-b340-4aa6-8898-dc631f804123
b034e39f-075b-4212-8d79-a8f1cfad571b	ce57fe49-91a1-49d7-8048-2d10ad36ff41	2477b7b8-a692-4b20-bfba-5e607d97d299
5386c8a4-cfff-4287-a43f-7be424c3f4ba	ce57fe49-91a1-49d7-8048-2d10ad36ff41	1389dfc6-5181-4be0-a0b3-2fca52d47e57
9fae7414-1c4e-4831-940d-757bf5008e37	ce57fe49-91a1-49d7-8048-2d10ad36ff41	cf0fdb78-6819-4b2d-9048-e73688cdfb71
0a298e31-8cd6-4d2b-933d-a835424a8246	ce57fe49-91a1-49d7-8048-2d10ad36ff41	c03dd54a-72a7-49f6-b8ab-a99fc88ef4c0
45980930-e1fa-4e3f-96a6-26ba98d0fcda	ce57fe49-91a1-49d7-8048-2d10ad36ff41	1ab7a8cf-449d-4329-8f6c-aa928c81bf30
90eb0dd5-e10b-420e-b9bc-dea4fb3a95ea	ce57fe49-91a1-49d7-8048-2d10ad36ff41	bbb416eb-60e4-436f-aae6-ff1692a2f918
099071d1-36b1-4a05-a6a2-70c83b1cd242	ce57fe49-91a1-49d7-8048-2d10ad36ff41	9db449dc-bca8-4ede-b249-121fdf7d127f
eb006990-1cb8-4a4e-9dc9-d55811166e55	ce57fe49-91a1-49d7-8048-2d10ad36ff41	029a21d9-910a-479d-92bb-28b73796e2a8
7aa34d8c-9a32-4edb-90d4-181c364ea47e	ce57fe49-91a1-49d7-8048-2d10ad36ff41	3e2608da-d626-4c49-8f65-964a6d7b610d
9ee2127c-6fb7-41bf-bebe-021dabe3ded9	ce57fe49-91a1-49d7-8048-2d10ad36ff41	eba838a8-c7bd-4fa6-bd0a-7390c5d4bf0c
53451063-76c2-4b7e-b9dc-16020b825da3	ce57fe49-91a1-49d7-8048-2d10ad36ff41	0aa26c68-1c9e-40eb-a1a6-83089007f6aa
b30d0228-3e97-41a9-8a3a-05f7048407dd	ce57fe49-91a1-49d7-8048-2d10ad36ff41	5a6f5ea8-36dc-4419-89e2-c3aeee551d50
211d59eb-4fdd-44d1-9b99-ad539470754f	ce57fe49-91a1-49d7-8048-2d10ad36ff41	66ff0c48-15f8-41f2-a66f-c1076171cc30
451113bd-96a7-47e0-be4e-a2688e908a28	ce57fe49-91a1-49d7-8048-2d10ad36ff41	370a803d-6509-4c8a-8012-726c8a3df197
9bf87a2c-1feb-4cd9-bbcd-f73e480fe4e8	ce57fe49-91a1-49d7-8048-2d10ad36ff41	f0cfe329-4b2d-4bf0-86d1-f10e35dcb936
8f1c28fd-f8a4-4c74-b5fe-287d05a1195f	ce57fe49-91a1-49d7-8048-2d10ad36ff41	e9cda49b-7c06-48fb-8ab2-4287cd5f0ae3
00014bb0-54be-4cc9-8f4c-68f07ae1d754	ce57fe49-91a1-49d7-8048-2d10ad36ff41	e3c6d808-83fb-4b5d-92a8-8c94c448814a
554a23c8-d8a0-44cd-aff4-579ccb6df0cc	ce57fe49-91a1-49d7-8048-2d10ad36ff41	94b3a522-fa8b-4ec4-a0af-d9178d3b3719
26f8183f-d8d4-416f-a6e1-56bca2bc1d06	ce57fe49-91a1-49d7-8048-2d10ad36ff41	aacfd283-8e2b-4636-bea5-807358c19f3a
e9c5fff2-3c05-415c-9270-2c23a29038b2	ce57fe49-91a1-49d7-8048-2d10ad36ff41	e83ecb1b-2148-463d-bc52-1f0e7985c9cb
c5649652-3bb3-4be3-ad34-957e5927a67a	ce57fe49-91a1-49d7-8048-2d10ad36ff41	8752c5c6-6a4a-4365-9346-c209f1f0df48
073af114-bf19-4cd2-b83d-4f5602748379	ce57fe49-91a1-49d7-8048-2d10ad36ff41	7a2eeec6-4c63-4263-9177-1a112812a7f2
8d672038-44a0-49f3-8f22-d62bffa385a8	ce57fe49-91a1-49d7-8048-2d10ad36ff41	31b410f6-f0bf-42c5-99ff-85696a7079d4
6d0022f0-6ffb-48dd-879e-a5934e5508df	ce57fe49-91a1-49d7-8048-2d10ad36ff41	8b72962d-a5dd-4cc6-a807-49d5fbf083c2
2a6dc6ff-b462-4c7e-b681-bc8c8f3adfc5	ce57fe49-91a1-49d7-8048-2d10ad36ff41	37ac4db1-e605-42ed-b8a1-76daf023ba48
a4f4cbe7-4e37-4953-97c7-2e2086be8768	ce57fe49-91a1-49d7-8048-2d10ad36ff41	be1f384b-855e-402e-b9b6-78dc6c16437b
cf35effb-edae-40e8-816f-6f0467fcc7ed	ce57fe49-91a1-49d7-8048-2d10ad36ff41	6fcce6cc-ac33-4e9a-b7e0-d3838ca6f867
2378b371-1d28-4ca9-9ee7-58153aa55016	ce57fe49-91a1-49d7-8048-2d10ad36ff41	c63d1985-864a-4371-be56-6f414ea37813
53a51a10-1253-40a9-b046-3e2707c6db06	ce57fe49-91a1-49d7-8048-2d10ad36ff41	677d4299-7aaf-40c0-8b86-cf121cd44217
c0ebf4cf-4722-47e8-b877-0eb75c71a7e0	ce57fe49-91a1-49d7-8048-2d10ad36ff41	1dd1a701-6f5b-411e-a6c4-097da46ddc48
eacf39c7-4dcc-4c99-860e-23945fadb275	ce57fe49-91a1-49d7-8048-2d10ad36ff41	8b4911f7-10c0-4abf-9fee-c2e3c7625e4d
12e84653-af8d-4590-9382-69dca25a549f	ce57fe49-91a1-49d7-8048-2d10ad36ff41	0cd7749f-05ce-4b3e-9a2a-fb3cf5e27559
7373d383-1cfd-4f3d-bb43-8e2d0a637384	ce57fe49-91a1-49d7-8048-2d10ad36ff41	9012fbb6-381c-47a5-b87c-c45b082e020e
0e83be68-d0d4-4773-88d7-e97c0310b540	ce57fe49-91a1-49d7-8048-2d10ad36ff41	5e2de66c-4541-4e5e-bc1f-4ad44057896c
9dd0f9a4-c66d-4a0c-a55a-9b70ba08639a	ce57fe49-91a1-49d7-8048-2d10ad36ff41	d6886575-e452-4622-9d8a-7adf415480c5
df580e67-667c-4efc-b52b-d951a64420bd	ce57fe49-91a1-49d7-8048-2d10ad36ff41	395f88b0-85f6-4ab0-b628-bfa6b0e57870
8b357959-feb1-47ec-9f9d-eceda6f10379	ce57fe49-91a1-49d7-8048-2d10ad36ff41	bbac1077-a6ab-4160-8e48-b8251da43843
1ced1f36-92e5-4182-a06e-84c92514eeef	ce57fe49-91a1-49d7-8048-2d10ad36ff41	301dcf51-68d2-4439-9b99-02da1ec733b8
b8d86be3-ae92-4fb9-b9eb-e658b62d90ae	ce57fe49-91a1-49d7-8048-2d10ad36ff41	5540bcea-3dd8-49df-8526-5456641abaac
b7ff6c8e-7e0c-4190-9fc2-333dde24b75d	ce57fe49-91a1-49d7-8048-2d10ad36ff41	4d0ea855-5faa-491a-9a0c-1bd5ff7a4525
f3533f0a-16c4-4751-a6ab-b4ec6ac13a32	ce57fe49-91a1-49d7-8048-2d10ad36ff41	94431a99-0017-4fa4-b56c-7b013cdf2599
cfc65200-c128-467b-943b-ee0eec1b7079	ce57fe49-91a1-49d7-8048-2d10ad36ff41	0d9955ce-991e-4872-a417-23b916e8e817
f3a5150c-0261-4a14-abac-3d878170f9a6	ce57fe49-91a1-49d7-8048-2d10ad36ff41	5c166e6b-f3b0-4fec-8246-72b27f6e192d
0e77ea7a-52f2-4214-98ef-d301887b3a9b	ce57fe49-91a1-49d7-8048-2d10ad36ff41	c93b1478-17c6-400f-9e7e-6af63156bf5c
00c4586d-dc55-4c2c-aa23-2c4388f4db09	ce57fe49-91a1-49d7-8048-2d10ad36ff41	71e03254-8afc-4aa1-b9a3-d007a80a5439
1b81b2b9-5924-437c-b9e9-ef01cd29410e	ce57fe49-91a1-49d7-8048-2d10ad36ff41	168b5179-d418-4077-b033-1224015264bd
723c927a-5ef2-4c73-a540-a8f4ed9c42d3	ce57fe49-91a1-49d7-8048-2d10ad36ff41	1507644f-dbe5-41ca-b06d-d8c9a54f8d7b
6fd22e0b-93be-4b1d-9113-c4ab6b226657	ce57fe49-91a1-49d7-8048-2d10ad36ff41	8aea62cd-2101-4c21-800d-9d8e061413fc
50da15af-2eb0-4153-b2b6-bb717aa854cb	ce57fe49-91a1-49d7-8048-2d10ad36ff41	0e845288-af2b-4da4-bcb0-4541c4277e9e
f15c10b8-ba31-427e-830a-985ff1532bbb	ce57fe49-91a1-49d7-8048-2d10ad36ff41	f7252488-1337-4b81-80ea-2a0442bfb6d6
7e4d1501-e5f8-43be-92fb-c1390953eb26	ce57fe49-91a1-49d7-8048-2d10ad36ff41	0ca89143-6a38-4a6e-84a1-6a20448d4181
5d94efef-d6b5-4b0e-b887-0efaf92a793c	ce57fe49-91a1-49d7-8048-2d10ad36ff41	c7163d7a-650a-43f7-bad6-74b431e39781
9f708f23-1417-4409-a58d-fd336ff8fcd6	ce57fe49-91a1-49d7-8048-2d10ad36ff41	dfaf1ad4-9826-4c12-b5df-45617331d075
4115e6dc-dbe2-4725-b1e1-37013fd5582b	ce57fe49-91a1-49d7-8048-2d10ad36ff41	bbc0219a-ec22-425d-b6e8-9042307b0583
2590d955-4fbe-4a53-84f1-3707831aee50	ce57fe49-91a1-49d7-8048-2d10ad36ff41	1b7e1a5a-7f37-4195-a4e2-2e12a9698f81
4ae71326-7c0a-4691-a3af-d3e48ee9b161	ce57fe49-91a1-49d7-8048-2d10ad36ff41	32cd81e8-5594-40c9-b6b1-08a2653afe4f
3ec210ca-54c8-47f7-9ac7-6f276dfe4d19	ce57fe49-91a1-49d7-8048-2d10ad36ff41	b276e118-8d42-42d6-b425-d879300b2a60
c216a745-7f87-4fa7-88ef-4db600278214	ce57fe49-91a1-49d7-8048-2d10ad36ff41	6f0ca390-34cf-48b4-a460-6c6fd6c657e3
f17e9f3b-c0d9-4736-8257-10754f5e6491	ce57fe49-91a1-49d7-8048-2d10ad36ff41	da44ee02-361a-44d8-afac-a04317134a53
0c645904-a3fb-435b-8220-6f84dbdd56ac	ce57fe49-91a1-49d7-8048-2d10ad36ff41	51d43680-fb57-4c6d-9e39-e211fcaa5346
b177afa6-8a0c-4f7d-80e2-e855b5eace9e	ce57fe49-91a1-49d7-8048-2d10ad36ff41	4e42c236-1a71-4a3a-84b8-71e0efe33b9d
7290c62b-d5e1-4b1b-b207-05977f975df0	ce57fe49-91a1-49d7-8048-2d10ad36ff41	876bdfae-1535-46f2-a725-49e6832c8332
bbbd38d7-4f44-4bfd-992a-0f953d99a4b7	ce57fe49-91a1-49d7-8048-2d10ad36ff41	1995a5a4-932c-4927-a10a-b213d4b9f4f7
52e579ed-93d6-4c7b-b364-beebe8f81712	ce57fe49-91a1-49d7-8048-2d10ad36ff41	45526014-ee84-44d0-bf72-20201dfd0054
cd16d8ac-af61-4fbe-8171-7dd2fbe275e8	ce57fe49-91a1-49d7-8048-2d10ad36ff41	1bbda6a3-a53b-42f8-8952-9e0a8bdb9c36
577320f8-0540-4333-ac63-0ed6cb006432	ce57fe49-91a1-49d7-8048-2d10ad36ff41	27f31c3a-997f-4805-a280-3b7435f3e951
30b224c0-e2e6-4a31-930c-2669ff38587e	ce57fe49-91a1-49d7-8048-2d10ad36ff41	c2a0e627-28ed-43ea-a8a3-902958f649ef
fb461d90-6aab-4d1b-bf82-9e7d55f075ec	ce57fe49-91a1-49d7-8048-2d10ad36ff41	fdf1b8d8-5f62-4a88-b0b8-cc6a5311e90a
c4860113-168a-4956-b401-493310c9bcdd	ce57fe49-91a1-49d7-8048-2d10ad36ff41	2015f586-2222-433a-85bc-be14a1ef0146
91b2bb3d-721c-498d-8136-18d51e1dcef0	ce57fe49-91a1-49d7-8048-2d10ad36ff41	f8924ed5-9a4f-45cd-8107-a77aff815e73
96cbdcd6-94cc-49c8-8618-a10d3cadf193	ce57fe49-91a1-49d7-8048-2d10ad36ff41	7d16eb25-bd9e-4fbe-8264-511b5e1e01f9
4cbd4e7c-dcb6-422c-a35a-351c6a088951	ce57fe49-91a1-49d7-8048-2d10ad36ff41	96c96b87-0337-4c69-9bc5-985eb45367ee
a3076135-d081-467c-a7c6-8183dd80c78e	14bc4934-0b35-4a16-aee8-3f38be68920e	fa1a0ae1-0f94-4907-a935-4d847aaeb186
a60cf97f-93c4-4d37-b8ed-f57c638ba5d7	14bc4934-0b35-4a16-aee8-3f38be68920e	c7b0a59a-d726-4709-b3fe-ff5fe867819b
6903cdfb-2190-44d2-9cf9-d63ac715607f	14bc4934-0b35-4a16-aee8-3f38be68920e	32e2191f-ab14-45fc-8c08-1a097d34506c
3551da47-6812-4261-82e8-f5cb854be97a	14bc4934-0b35-4a16-aee8-3f38be68920e	db44c275-553d-48c6-90dd-84f7d5cbe1f5
78b5b093-6546-409a-a4fe-ddc69fa4374c	14bc4934-0b35-4a16-aee8-3f38be68920e	ac2ac696-e865-420d-91f5-8f8368963793
ce04e6cb-b5c8-480c-9444-83e544bc2bc4	14bc4934-0b35-4a16-aee8-3f38be68920e	3933d3ac-b5bb-424a-b6f2-b9b47f29cfa7
2833421c-7acc-444a-b801-21f366647520	14bc4934-0b35-4a16-aee8-3f38be68920e	9fa2ba1e-7940-4cfa-b010-75b386bed54e
c035c0f7-089c-487d-9402-160dce23b0e9	14bc4934-0b35-4a16-aee8-3f38be68920e	d866d692-79ac-4946-bb80-1aa33ab7b13c
d10aa2ee-1a7c-4f9d-a127-64ea8131bf66	14bc4934-0b35-4a16-aee8-3f38be68920e	57da45e1-2c4b-4c57-9bdf-a009e1bcd574
1cbd2ff4-0798-44f4-84cd-6c2eba7c6782	14bc4934-0b35-4a16-aee8-3f38be68920e	291d6e1c-9d5a-423f-9d32-f7ce8f885e2c
741baecd-ecb3-40e3-95aa-81ec22ffdc9a	14bc4934-0b35-4a16-aee8-3f38be68920e	17e7fc2c-a170-4147-a4cd-04b170952fac
f913cd82-c571-460f-8efc-996b4f0252d9	7f197236-0e33-4598-b882-32af183fa073	ac2ac696-e865-420d-91f5-8f8368963793
a60e93eb-6ea6-425a-8fec-4e45386e6259	7f197236-0e33-4598-b882-32af183fa073	3933d3ac-b5bb-424a-b6f2-b9b47f29cfa7
14592232-91d3-4d7b-aaed-f17c24e462a2	7f197236-0e33-4598-b882-32af183fa073	9fa2ba1e-7940-4cfa-b010-75b386bed54e
e9ddf913-0691-4d3a-bdd5-b81c9b300830	7f197236-0e33-4598-b882-32af183fa073	57da45e1-2c4b-4c57-9bdf-a009e1bcd574
532af3b3-2b5b-4f3d-b411-b647d07d8f06	7f197236-0e33-4598-b882-32af183fa073	291d6e1c-9d5a-423f-9d32-f7ce8f885e2c
055b9b97-79fc-407e-b092-537e90d266e3	7f197236-0e33-4598-b882-32af183fa073	17e7fc2c-a170-4147-a4cd-04b170952fac
\.


--
-- TOC entry 3810 (class 0 OID 24624)
-- Dependencies: 221
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, tenant_id, name, slug, description, is_system, created_at, updated_at) FROM stdin;
ce57fe49-91a1-49d7-8048-2d10ad36ff41	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مالك	owner	صلاحيات كاملة	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
14bc4934-0b35-4a16-aee8-3f38be68920e	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مدير	admin	صلاحيات إدارية عامة	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
fcf3339a-5267-43ec-9c4e-5c7b7392869b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مدير فرع	branch_manager	إدارة الفرع المحدد	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
7f197236-0e33-4598-b882-32af183fa073	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	كاشير	cashier	نقطة البيع فقط	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
430200a7-9c11-40a7-8794-f7b55f2b2324	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مدير مخزون	inventory_manager	إدارة المخزون والمنتجات	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
02d10c9e-0af4-4010-8568-f74f99ec93b8	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مسؤول مشتريات	purchasing_officer	إدارة المشتريات والموردين	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
5e9db4e0-dc29-46c6-bf7d-1565ace728ca	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	محاسب	accountant	التقارير المالية والمبيعات	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
362def58-0e74-420f-a50a-0e59b6f4657b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	مندوب مبيعات	sales_rep	متابعة المبيعات والعملاء	t	2026-05-22 11:27:18.647154	2026-05-22 11:27:18.647154
\.


--
-- TOC entry 3818 (class 0 OID 24728)
-- Dependencies: 229
-- Data for Name: sales_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_order_items (id, sales_order_id, product_id, product_name, quantity, unit_price, discount_amount, tax_percent, total_price) FROM stdin;
dc0008bb-6c1b-4492-aff6-c3ed75b9c70c	11ebf95b-86c0-4bc8-9eb6-65e1012f48dc	758b4df5-2528-447f-9fd6-960eeb1362e7	لبن كامل الدسم جهينة 1 لتر	3	32.00	0.00	14.00	96.00
4ebccca1-3912-4917-9630-f67c313110df	11ebf95b-86c0-4bc8-9eb6-65e1012f48dc	f1a8286d-a4bb-46a6-9a9d-e0c66c298cd6	شاي ناعم ليبتون 250 جرام	2	55.00	0.00	14.00	110.00
1faee521-77d3-4d80-acc7-390b9862ac9d	06c5f878-3654-4044-950c-10e9ae9bde14	45493d1f-2e52-46c8-bf0d-7d599d169b9d	مسحوق غسيل أريال 2.5 كيلو	2	220.00	0.00	14.00	440.00
a67683a5-99d2-4d76-a40c-1774f219f733	06c5f878-3654-4044-950c-10e9ae9bde14	0deedf81-e6a3-4200-b41b-4bffacb33d02	سكر أبيض الأسرة 1 كيلو	1	40.00	0.00	0.00	40.00
ffdcade9-6784-4cc6-b7c4-a0454c02b0f8	06c5f878-3654-4044-950c-10e9ae9bde14	a84691c2-89a0-4247-9c76-491f7c32b6ca	أرز مصري الضحى 5 كيلو	1	165.00	0.00	0.00	165.00
c8bf4187-cedc-4976-bdc9-95db55ca6c14	06c5f878-3654-4044-950c-10e9ae9bde14	2e8bbf98-a438-419d-b63a-4cd84c5534a0	مكرونة ريجينا 400 جرام	1	15.00	0.00	0.00	15.00
070460be-7051-4434-87a2-0e7c8a430370	b5b12aa5-38b4-437d-8a56-2eda4f24219d	a84691c2-89a0-4247-9c76-491f7c32b6ca	أرز مصري الضحى 5 كيلو	1	165.00	0.00	0.00	165.00
8d9dad02-56ca-4cec-98d7-6ad31217c3b1	b5b12aa5-38b4-437d-8a56-2eda4f24219d	ced331d9-dc96-40b9-b2e6-82187b9fbf8a	جبنة بيضاء دومتي 500 جرام	1	52.00	0.00	0.00	52.00
e0378cfa-cd5d-4c24-8915-15701dd83781	b5b12aa5-38b4-437d-8a56-2eda4f24219d	2e8bbf98-a438-419d-b63a-4cd84c5534a0	مكرونة ريجينا 400 جرام	1	15.00	0.00	0.00	15.00
76bd895b-1667-4f44-8749-0df194a4cdaf	b5b12aa5-38b4-437d-8a56-2eda4f24219d	42f2ba5a-62df-413d-b95f-1ee203d81b26	زيت عباد الشمس عافية 1.6 لتر	1	135.00	0.00	0.00	135.00
cb567fc8-ccc4-4deb-9e34-ff8cbd2cbb92	979d840e-f4d3-4345-b125-4e7eb1d5017b	0deedf81-e6a3-4200-b41b-4bffacb33d02	سكر أبيض الأسرة 1 كيلو	1	40.00	0.00	0.00	40.00
6d937cdd-cbe4-49bb-ae58-8ea0b1068371	979d840e-f4d3-4345-b125-4e7eb1d5017b	42f2ba5a-62df-413d-b95f-1ee203d81b26	زيت عباد الشمس عافية 1.6 لتر	1	135.00	0.00	0.00	135.00
28f7b5d3-50fd-45ff-92bf-f9f2081c3e07	4f1aa397-a0b1-41eb-b0e2-4c7414d0d375	a84691c2-89a0-4247-9c76-491f7c32b6ca	أرز مصري الضحى 5 كيلو	3	165.00	0.00	0.00	495.00
ffd488b3-471b-462b-a37c-736c6fe24661	4f1aa397-a0b1-41eb-b0e2-4c7414d0d375	ced331d9-dc96-40b9-b2e6-82187b9fbf8a	جبنة بيضاء دومتي 500 جرام	3	52.00	0.00	0.00	156.00
0d721e7a-9247-4306-bf05-cd0089dfae7e	4f1aa397-a0b1-41eb-b0e2-4c7414d0d375	2e8bbf98-a438-419d-b63a-4cd84c5534a0	مكرونة ريجينا 400 جرام	1	15.00	0.00	0.00	15.00
0ebb1e7e-ba8e-4629-a325-c1d01da95963	4f1aa397-a0b1-41eb-b0e2-4c7414d0d375	42f2ba5a-62df-413d-b95f-1ee203d81b26	زيت عباد الشمس عافية 1.6 لتر	1	135.00	0.00	0.00	135.00
3a67fe25-9f80-4f46-9c65-b81b4796bdc0	4f1aa397-a0b1-41eb-b0e2-4c7414d0d375	758b4df5-2528-447f-9fd6-960eeb1362e7	لبن كامل الدسم جهينة 1 لتر	1	32.00	0.00	0.00	32.00
5e89e6e8-ce58-457b-8650-16aecc3e72f3	4f1aa397-a0b1-41eb-b0e2-4c7414d0d375	d0939b87-8253-43f5-8676-8fcdfb4de2c7	مياه معدنية نستله 1.5 لتر	1	7.50	0.00	0.00	7.50
053faa85-bccf-4433-8339-e519e1c70a5c	5d3f2ba9-76f7-497e-a537-66ae2f774970	2e8bbf98-a438-419d-b63a-4cd84c5534a0	مكرونة ريجينا 400 جرام	1	15.00	0.00	0.00	15.00
60884f81-2794-4d0e-897b-fa73bfb10306	5d3f2ba9-76f7-497e-a537-66ae2f774970	ced331d9-dc96-40b9-b2e6-82187b9fbf8a	جبنة بيضاء دومتي 500 جرام	1	52.00	0.00	0.00	52.00
c380c008-2da3-462f-a9cb-e742fc8ce935	5d3f2ba9-76f7-497e-a537-66ae2f774970	42f2ba5a-62df-413d-b95f-1ee203d81b26	زيت عباد الشمس عافية 1.6 لتر	1	135.00	0.00	0.00	135.00
\.


--
-- TOC entry 3819 (class 0 OID 24739)
-- Dependencies: 230
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_orders (id, tenant_id, branch_id, customer_id, cashier_id, invoice_number, status, payment_method, subtotal, discount_amount, tax_amount, total_amount, notes, created_at, updated_at) FROM stdin;
11ebf95b-86c0-4bc8-9eb6-65e1012f48dc	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0001	completed	cash	408.33	0.00	57.17	465.50	\N	2026-05-06 11:27:20.022	2026-05-22 11:27:20.127295
9e87d1c3-7d35-4b8c-99ea-167cd66f6f6b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0002	completed	card	103.54	0.00	0.00	103.54	\N	2026-05-05 11:27:20.022	2026-05-22 11:27:20.127295
d30f619a-5cf0-4880-a525-51be88b76149	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0003	completed	wallet	163.98	0.00	22.96	186.94	\N	2026-05-10 11:27:20.022	2026-05-22 11:27:20.127295
33af0a3e-72a7-4b4a-ae63-266cf35e722b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0004	completed	cash	316.34	0.00	0.00	316.34	\N	2026-05-12 11:27:20.022	2026-05-22 11:27:20.127295
9de7a639-653d-4c75-92bb-6700a72a2cad	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0005	completed	card	69.61	0.00	9.75	79.36	\N	2026-05-02 11:27:20.022	2026-05-22 11:27:20.127295
8afab831-b42b-4eb4-b143-e5c1f7341896	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0006	returned	wallet	541.34	0.00	0.00	541.34	\N	2026-05-22 11:27:20.022	2026-05-22 11:27:20.127295
3c1861f3-6b2e-4e81-ae72-b902d3607910	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0007	completed	cash	146.23	0.00	20.47	166.70	\N	2026-05-06 11:27:20.022	2026-05-22 11:27:20.127295
2d4e6105-be43-4642-bc65-493f471395e5	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0008	completed	card	539.50	0.00	0.00	539.50	\N	2026-05-18 11:27:20.022	2026-05-22 11:27:20.127295
4a60fac2-91f9-4a5e-9f34-28b9b58766fa	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0009	completed	wallet	159.69	0.00	22.36	182.05	\N	2026-05-12 11:27:20.022	2026-05-22 11:27:20.127295
b3149e51-ae6f-410a-8019-1f769b6d074c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0010	completed	cash	220.08	0.00	0.00	220.08	\N	2026-05-22 11:27:20.022	2026-05-22 11:27:20.127295
ee4b51fb-6c02-4552-aa0a-e7bb85e4527e	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0011	completed	card	536.91	0.00	75.17	612.08	\N	2026-05-21 11:27:20.022	2026-05-22 11:27:20.127295
6c1d280c-9348-4438-8807-062e65924740	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0012	completed	wallet	52.94	0.00	0.00	52.94	\N	2026-05-18 11:27:20.022	2026-05-22 11:27:20.127295
5223cb71-54c0-4166-bc4e-c916ea6e870c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0013	completed	cash	512.05	0.00	71.69	583.74	\N	2026-05-22 11:27:20.022	2026-05-22 11:27:20.127295
9730ffeb-af73-4d97-af45-30a6c641ae5b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0014	completed	card	376.11	0.00	0.00	376.11	\N	2026-04-25 11:27:20.022	2026-05-22 11:27:20.127295
19bff85f-9814-431a-ab41-7ad8458276db	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0015	completed	wallet	499.00	0.00	69.86	568.86	\N	2026-05-16 11:27:20.022	2026-05-22 11:27:20.127295
ebca9457-e50e-4649-bd5c-b0b183848018	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0016	completed	cash	67.66	0.00	0.00	67.66	\N	2026-05-02 11:27:20.022	2026-05-22 11:27:20.127295
af12c4c6-150d-47e0-b8e0-4fab82373b6d	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0017	completed	card	256.93	0.00	35.97	292.90	\N	2026-05-10 11:27:20.022	2026-05-22 11:27:20.127295
3f9b09fc-1ce0-497c-b4f1-3d02e848d50f	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0018	completed	wallet	255.26	0.00	0.00	255.26	\N	2026-05-19 11:27:20.022	2026-05-22 11:27:20.127295
889d7184-ef50-487d-b84d-c65da39de2c5	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0019	completed	cash	72.31	0.00	10.12	82.43	\N	2026-05-22 11:27:20.022	2026-05-22 11:27:20.127295
47b9bfdb-624d-4f50-aa52-01f7dd739d27	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0020	completed	card	406.82	0.00	0.00	406.82	\N	2026-05-11 11:27:20.022	2026-05-22 11:27:20.127295
9521e479-230e-4177-aec6-1c5917925038	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0021	completed	wallet	370.11	0.00	51.82	421.93	\N	2026-04-26 11:27:20.022	2026-05-22 11:27:20.127295
9731995b-8b02-44b8-944c-4a8e82839193	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0022	completed	cash	473.86	0.00	0.00	473.86	\N	2026-05-08 11:27:20.022	2026-05-22 11:27:20.127295
3088fdee-0d11-43d0-9e84-35f1e6f45e44	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0023	completed	card	65.02	0.00	9.10	74.12	\N	2026-05-04 11:27:20.022	2026-05-22 11:27:20.127295
168ec58a-d146-42a1-a2ae-c583f7b29080	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0024	completed	wallet	495.67	0.00	0.00	495.67	\N	2026-05-05 11:27:20.022	2026-05-22 11:27:20.127295
de145e24-c830-4814-82c2-c8ea73e908af	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0025	completed	cash	501.18	0.00	70.17	571.35	\N	2026-05-16 11:27:20.022	2026-05-22 11:27:20.127295
b98272bf-d853-4e26-87ea-cdb93d0cbf30	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0026	completed	card	492.97	0.00	0.00	492.97	\N	2026-04-25 11:27:20.022	2026-05-22 11:27:20.127295
52c43bb2-a7e9-420a-8d8b-6c6da71e99f6	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0027	completed	wallet	151.89	0.00	21.26	173.15	\N	2026-05-16 11:27:20.022	2026-05-22 11:27:20.127295
59710fd9-f3e2-425a-a9bd-710079df4033	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	\N	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0028	completed	cash	63.43	0.00	0.00	63.43	\N	2026-04-23 11:27:20.022	2026-05-22 11:27:20.127295
999ddef4-5f37-4415-973b-83c39b93ceae	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	152f9980-921b-4ec1-9182-c917d221f934	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0029	completed	card	295.65	0.00	41.39	337.04	\N	2026-04-23 11:27:20.022	2026-05-22 11:27:20.127295
98cbde1d-d786-4659-b8b5-95a0dc5ef567	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	5274864e-abf9-474f-b0f5-99c650c828d3	c0d02483-0cf2-4542-9429-e0751a533434	INV-2024-0030	completed	wallet	353.12	0.00	0.00	353.12	\N	2026-04-29 11:27:20.022	2026-05-22 11:27:20.127295
06c5f878-3654-4044-950c-10e9ae9bde14	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	INV-10123662	completed	cash	660.00	0.00	61.60	721.60	\N	2026-05-24 08:08:45.072989	2026-05-24 08:08:45.072989
b5b12aa5-38b4-437d-8a56-2eda4f24219d	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	INV-28677111	returned	cash	367.00	0.00	0.00	367.00	\N	2026-05-24 13:17:59.274977	2026-05-24 13:18:24.754
979d840e-f4d3-4345-b125-4e7eb1d5017b	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	INV-29298389	completed	card	175.00	0.00	0.00	175.00	\N	2026-05-24 13:28:20.687869	2026-05-24 13:28:20.687869
4f1aa397-a0b1-41eb-b0e2-4c7414d0d375	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	INV-37526823	completed	cash	840.50	0.00	0.00	840.50	\N	2026-05-24 15:45:28.928816	2026-05-24 15:45:28.928816
5d3f2ba9-76f7-497e-a537-66ae2f774970	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	\N	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	INV-37564402	completed	cash	202.00	0.00	0.00	202.00	\N	2026-05-24 15:46:06.673983	2026-05-24 15:46:06.673983
\.


--
-- TOC entry 3827 (class 0 OID 24825)
-- Dependencies: 238
-- Data for Name: security_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.security_logs (id, user_id, tenant_id, branch_id, event, severity, ip_address, user_agent, metadata, created_at) FROM stdin;
35f17298-2f34-45d3-ac18-b2355373ebd3	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	curl/8.14.1	\N	2026-05-22 11:29:02.175497
7dd108f7-a287-4345-a61f-990507f3b8d7	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	curl/8.14.1	\N	2026-05-22 11:30:43.21453
e527bb49-4047-4c03-a4b4-ddd4eda5f688	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 11:31:16.330846
7ad2fab8-bfd4-46d6-9c90-e39ba5d579d5	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 11:34:03.023195
6ab237e6-c3b6-4369-a773-179d2333e1fb	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 11:45:51.456581
d9c96c45-65c0-46de-b3cf-d65174c072fb	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 12:40:51.523742
1497c64f-6d42-4067-8759-f30d87454639	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 13:18:38.947141
a0d99764-a524-4c48-ba86-2c0fceda6cea	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 13:22:15.253126
5354489c-aa98-4651-ae9a-e91a88975cb3	b1a5a370-1369-44e7-8a92-4e0e01db80a5	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 13:23:06.210031
ce8155cd-c022-43d2-988b-8fcda1d2d52b	b1a5a370-1369-44e7-8a92-4e0e01db80a5	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 13:23:17.40209
1b4e0bb1-0684-4069-90c3-9652d1b28c85	c0d02483-0cf2-4542-9429-e0751a533434	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 13:23:26.036917
e9e13e56-4ed0-4a13-bd6b-3e06b2f93cef	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 13:23:31.884726
356f5844-21ba-4421-b1f7-a858c782ca72	c0d02483-0cf2-4542-9429-e0751a533434	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 13:24:02.977237
daf5ced2-239a-4a58-a3fa-1a58cde9beff	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8457	\N	2026-05-22 20:04:15.479367
506e6eb0-596f-4854-9f47-8b3461a0424a	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-22 20:07:18.90143
b2c57a6f-9131-437c-9576-222fcd2f5c06	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-24 07:28:11.795672
269a448f-630d-4acf-82ef-6146559bd8f1	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-24 07:34:07.707843
99e045d9-6757-484d-807b-93383053ee7a	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-24 10:13:43.296154
45f5054d-7192-4ab4-8e2d-b4dd661408fd	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-24 13:16:52.20355
5340bdb6-63af-4dc0-ab83-1ed2b9301872	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-24 13:28:03.158602
56dd7d49-8241-4366-bbce-36f085b13028	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-05-24 15:43:49.291321
940bdffe-d05f-4eeb-81b0-c0a7c11a41d5	a521fb2e-7a48-4753-8663-4defdd60dc87	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	\N	2026-07-24 20:27:51.274147
f6460d2f-2a56-4626-8806-fc30f36a3fb3	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	\N	login_success	low	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	\N	2026-07-24 20:28:07.475411
\.


--
-- TOC entry 3821 (class 0 OID 24764)
-- Dependencies: 232
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, tenant_id, branch_id, product_id, type, quantity_before, quantity_change, quantity_after, reference_type, reference_id, notes, created_by, created_at) FROM stdin;
05d9ae40-4c86-4bc5-9b89-3f401790712c	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	758b4df5-2528-447f-9fd6-960eeb1362e7	sale	123	-3	120	\N	\N	مبيعات نقطة البيع	\N	2026-05-22 11:27:20.873032
b1c0db4a-d9d0-4252-9fe2-d710878196d4	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	2e8bbf98-a438-419d-b63a-4cd84c5534a0	waste	15	-10	5	\N	\N	هالك - تالف	\N	2026-05-22 11:27:20.873032
cc1501c5-dfca-4f6a-808d-144a5422263f	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	a84691c2-89a0-4247-9c76-491f7c32b6ca	purchase	0	45	45	\N	\N	استلام طلب شراء PO-2024-001	\N	2026-05-22 11:27:20.873032
\.


--
-- TOC entry 3830 (class 0 OID 24857)
-- Dependencies: 241
-- Data for Name: store_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_payments (id, store_id, subscription_id, amount, currency, payment_method, status, paid_at, notes, created_at) FROM stdin;
\.


--
-- TOC entry 3831 (class 0 OID 24870)
-- Dependencies: 242
-- Data for Name: store_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_subscriptions (id, store_id, plan_id, status, starts_at, ends_at, trial_ends_at, cancelled_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3832 (class 0 OID 24882)
-- Dependencies: 243
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name, description, price_monthly, price_yearly, currency, max_users, max_branches, max_products, features, is_active, is_recommended, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3816 (class 0 OID 24702)
-- Dependencies: 227
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, tenant_id, name, phone, email, address, tax_number, balance, rating, is_active, created_at, updated_at, deleted_at) FROM stdin;
2d94428e-3489-4a14-89ff-108c68787904	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	شركة النور للتوريدات	96522334455	contact@alnoor.com	منطقة الشويخ، الكويت	\N	-50000.00	4.5	t	2026-05-22 11:27:19.236881	2026-05-22 11:27:19.236881	\N
37c9e868-b607-4840-82b1-5510144674ba	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	شركة الخير للمواد الغذائية	96522998877	sales@alkheir.com	منطقة الري، الكويت	\N	0.00	4.8	t	2026-05-22 11:27:19.236881	2026-05-22 11:27:19.236881	\N
f1135356-f939-431e-b6ee-85ef9dc0f11f	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	شركة الصفوة للمشروبات	96523344556	info@alsafwa.com	منطقة السالمية، الكويت	\N	-120000.00	4.2	t	2026-05-22 11:27:19.236881	2026-05-22 11:27:19.236881	\N
28314244-7584-4998-85e0-8bffe97c9400	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	شركة المدينة للمنظفات	96555667788	orders@almadina.com	منطقة الفروانية، الكويت	\N	-15000.00	3.9	t	2026-05-22 11:27:19.236881	2026-05-22 11:27:19.236881	\N
\.


--
-- TOC entry 3834 (class 0 OID 24914)
-- Dependencies: 245
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, tenant_id, branch_id, created_by_id, title, department, description, priority, status, internal_note, reply_message, assigned_to, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3822 (class 0 OID 24773)
-- Dependencies: 233
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_comments (id, task_id, user_id, comment, created_at) FROM stdin;
\.


--
-- TOC entry 3823 (class 0 OID 24782)
-- Dependencies: 234
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, tenant_id, branch_id, title, description, status, priority, due_date, assigned_to, created_by, created_at, updated_at, deleted_at) FROM stdin;
714135ab-8e70-4863-859d-173e3c49d5e3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	جرد المخزون الشهري	مراجعة وجرد جميع المنتجات في المستودع الرئيسي	pending	high	\N	b1a5a370-1369-44e7-8a92-4e0e01db80a5	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	2026-05-22 11:27:20.572005	2026-05-22 11:27:20.572005	\N
86da8fe1-db45-4f46-bcee-eefde048a535	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	تجديد عقد المورد	التفاوض مع شركة الصفوة على شروط العقد الجديد	in_progress	urgent	\N	e45139c8-0583-4adc-ac20-f7ffc9bf7f35	a521fb2e-7a48-4753-8663-4defdd60dc87	2026-05-22 11:27:20.572005	2026-05-22 11:27:20.572005	\N
0ec7e290-a06e-4ef2-816b-4c6278d7eacc	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	تدريب الكاشيرين الجدد	عقد جلسة تدريبية على نظام نقطة البيع	pending	medium	\N	5ff04ce3-9fed-49c2-8c58-6bc9261f994a	a521fb2e-7a48-4753-8663-4defdd60dc87	2026-05-22 11:27:20.572005	2026-05-22 11:27:20.572005	\N
bec6a0fb-199d-4ac2-a6de-3e34c8831922	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	إعداد تقرير المبيعات الأسبوعي	تجميع وتحليل بيانات المبيعات للأسبوع الماضي	done	medium	\N	6d78d669-2a14-4b38-835c-91fd3350d01e	5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	2026-05-22 11:27:20.572005	2026-05-22 11:27:20.572005	\N
0bd92152-228c-4c79-9ee3-a587921569a4	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	فحص المنتجات منتهية الصلاحية	مراجعة تواريخ الصلاحية وسحب المنتجات المنتهية	in_progress	high	\N	b1a5a370-1369-44e7-8a92-4e0e01db80a5	5ff04ce3-9fed-49c2-8c58-6bc9261f994a	2026-05-22 11:27:20.572005	2026-05-22 11:27:20.572005	\N
\.


--
-- TOC entry 3835 (class 0 OID 32768)
-- Dependencies: 246
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenant_settings (tenant_id, setting_key, setting_value, updated_at) FROM stdin;
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_enabled	false	2026-05-24 10:19:09.935973
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_store_name	"شركة كنوز التجريبية"	2026-05-24 10:19:09.997507
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_description	""	2026-05-24 10:19:10.060805
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_whatsapp	""	2026-05-24 10:19:10.122516
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_phone	""	2026-05-24 10:19:10.184813
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_address	""	2026-05-24 10:19:10.246949
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_area	""	2026-05-24 10:19:10.309066
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_delivery_enabled	true	2026-05-24 10:19:10.373834
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_pickup_enabled	true	2026-05-24 10:19:10.436312
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_delivery_fee	0	2026-05-24 10:19:10.498285
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_min_order	0	2026-05-24 10:19:10.560833
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_show_stock	false	2026-05-24 10:19:10.622916
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_show_out_of_stock	false	2026-05-24 10:19:10.684875
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_cash	true	2026-05-24 10:19:10.748694
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_wallet	false	2026-05-24 10:19:10.812057
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	order_page_bank_transfer	false	2026-05-24 10:19:10.874958
\.


--
-- TOC entry 3807 (class 0 OID 24587)
-- Dependencies: 218
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, name, slug, logo_url, phone, address, tax_number, currency, timezone, owner_user_id, status, trial_starts_at, trial_ends_at, trial_days, subscription_status, current_plan_id, is_active, created_at, updated_at, deleted_at) FROM stdin;
c94e637d-21fc-407c-9f02-2ad0d47c2a2a	شركة كنوز التجريبية	demo	\N	\N	\N	\N	KWD	Asia/Kuwait	\N	active	2026-05-22 11:27:18.165	2026-06-21 11:27:18.165	30	active	\N	t	2026-05-22 11:27:18.270213	2026-05-24 15:43:42.903	\N
\.


--
-- TOC entry 3811 (class 0 OID 24637)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, tenant_id, branch_id, role_id, name, email, password_hash, phone, avatar, is_active, last_login_at, failed_login_attempts, account_locked_until, must_change_password, created_at, updated_at, deleted_at) FROM stdin;
5ff04ce3-9fed-49c2-8c58-6bc9261f994a	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	fcf3339a-5267-43ec-9c4e-5c7b7392869b	محمد الشمري	manager@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	96599111003	\N	t	\N	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
e45139c8-0583-4adc-ac20-f7ffc9bf7f35	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	02d10c9e-0af4-4010-8568-f74f99ec93b8	منى العجمي	purchasing@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	96599111006	\N	t	\N	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
6d78d669-2a14-4b38-835c-91fd3350d01e	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	5e9db4e0-dc29-46c6-bf7d-1565ace728ca	سارة حسن	accountant@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	96599111007	\N	t	\N	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
aa0065e7-16e3-482a-b92d-e29ca464a21f	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	c272eab1-878e-4215-8821-f6196582c577	362def58-0e74-420f-a50a-0e59b6f4657b	فيصل النجدي	sales@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	96599111008	\N	t	\N	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
5891baa0-c1cd-4d6c-b7db-97dcb9d232f3	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	ce57fe49-91a1-49d7-8048-2d10ad36ff41	أحمد الكنوز	owner@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	96599111001	\N	t	2026-07-24 20:28:05.748	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
b1a5a370-1369-44e7-8a92-4e0e01db80a5	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	430200a7-9c11-40a7-8794-f7b55f2b2324	خالد المطيري	inventory@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	96599111005	\N	t	2026-05-22 13:23:17.156	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
c0d02483-0cf2-4542-9429-e0751a533434	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	9312acbb-8458-4da5-8c7c-464481a64d55	7f197236-0e33-4598-b882-32af183fa073	عمر فاروق	cashier@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	01099111004	\N	t	2026-05-22 13:24:02.731	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
a521fb2e-7a48-4753-8663-4defdd60dc87	c94e637d-21fc-407c-9f02-2ad0d47c2a2a	0d30fd6b-87d7-4be2-84e5-1376d883e8d5	14bc4934-0b35-4a16-aee8-3f38be68920e	سلطان العمري	admin@demo.local	$2b$10$8K5UH4UdX3nYuZZSUiWuyuSm9ld0DZOZ/p9nLLs4xz7dq3HDtaJaK	96599111002	\N	t	2026-07-24 20:27:49.542	0	\N	f	2026-05-22 11:27:18.796341	2026-05-22 11:27:18.796341	\N
\.


--
-- TOC entry 3552 (class 2606 OID 24815)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 24824)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3466 (class 2606 OID 24586)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 3494 (class 2606 OID 24663)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3515 (class 2606 OID 24727)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 3548 (class 2606 OID 24806)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 3528 (class 2606 OID 24763)
-- Name: inventory_adjustments inventory_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_pkey PRIMARY KEY (id);


--
-- TOC entry 3586 (class 2606 OID 24913)
-- Name: order_requests order_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_requests
    ADD CONSTRAINT order_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3473 (class 2606 OID 24613)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3475 (class 2606 OID 24615)
-- Name: permissions permissions_resource_action_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_resource_action_unique UNIQUE (resource, action);


--
-- TOC entry 3569 (class 2606 OID 24847)
-- Name: platform_admins platform_admins_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_admins
    ADD CONSTRAINT platform_admins_email_unique UNIQUE (email);


--
-- TOC entry 3571 (class 2606 OID 24845)
-- Name: platform_admins platform_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_admins
    ADD CONSTRAINT platform_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 3575 (class 2606 OID 24856)
-- Name: platform_audit_logs platform_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_audit_logs
    ADD CONSTRAINT platform_audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3499 (class 2606 OID 24680)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3504 (class 2606 OID 24688)
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3506 (class 2606 OID 24701)
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3477 (class 2606 OID 24621)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3480 (class 2606 OID 24623)
-- Name: role_permissions role_permissions_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_id);


--
-- TOC entry 3482 (class 2606 OID 24634)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3485 (class 2606 OID 24636)
-- Name: roles roles_tenant_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_tenant_slug_unique UNIQUE (tenant_id, slug);


--
-- TOC entry 3519 (class 2606 OID 24738)
-- Name: sales_order_items sales_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3524 (class 2606 OID 24754)
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3564 (class 2606 OID 24834)
-- Name: security_logs security_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT security_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3533 (class 2606 OID 24772)
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 3577 (class 2606 OID 24869)
-- Name: store_payments store_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_payments
    ADD CONSTRAINT store_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3580 (class 2606 OID 24881)
-- Name: store_subscriptions store_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_subscriptions
    ADD CONSTRAINT store_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 3583 (class 2606 OID 24900)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3511 (class 2606 OID 24714)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 3591 (class 2606 OID 24925)
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3538 (class 2606 OID 24781)
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 3542 (class 2606 OID 24793)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 3595 (class 2606 OID 32775)
-- Name: tenant_settings tenant_settings_tenant_id_setting_key_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_tenant_id_setting_key_pk PRIMARY KEY (tenant_id, setting_key);


--
-- TOC entry 3469 (class 2606 OID 24603)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 3471 (class 2606 OID 24605)
-- Name: tenants tenants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- TOC entry 3488 (class 2606 OID 24649)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3491 (class 2606 OID 24651)
-- Name: users users_tenant_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_email_unique UNIQUE (tenant_id, email);


--
-- TOC entry 3550 (class 1259 OID 25285)
-- Name: activity_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_created_at_idx ON public.activity_logs USING btree (created_at);


--
-- TOC entry 3553 (class 1259 OID 25283)
-- Name: activity_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_tenant_id_idx ON public.activity_logs USING btree (tenant_id);


--
-- TOC entry 3554 (class 1259 OID 25284)
-- Name: activity_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_id_idx ON public.activity_logs USING btree (user_id);


--
-- TOC entry 3555 (class 1259 OID 25289)
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- TOC entry 3556 (class 1259 OID 25288)
-- Name: audit_logs_entity_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_entity_type_idx ON public.audit_logs USING btree (entity_type);


--
-- TOC entry 3559 (class 1259 OID 25286)
-- Name: audit_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_tenant_id_idx ON public.audit_logs USING btree (tenant_id);


--
-- TOC entry 3560 (class 1259 OID 25287)
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- TOC entry 3467 (class 1259 OID 25246)
-- Name: branches_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX branches_tenant_id_idx ON public.branches USING btree (tenant_id);


--
-- TOC entry 3495 (class 1259 OID 25252)
-- Name: categories_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_tenant_id_idx ON public.categories USING btree (tenant_id);


--
-- TOC entry 3513 (class 1259 OID 25263)
-- Name: customers_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);


--
-- TOC entry 3516 (class 1259 OID 25262)
-- Name: customers_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_tenant_id_idx ON public.customers USING btree (tenant_id);


--
-- TOC entry 3545 (class 1259 OID 25281)
-- Name: expenses_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_branch_id_idx ON public.expenses USING btree (branch_id);


--
-- TOC entry 3546 (class 1259 OID 25282)
-- Name: expenses_expense_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_expense_date_idx ON public.expenses USING btree (expense_date);


--
-- TOC entry 3549 (class 1259 OID 25280)
-- Name: expenses_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_tenant_id_idx ON public.expenses USING btree (tenant_id);


--
-- TOC entry 3529 (class 1259 OID 25271)
-- Name: inventory_adjustments_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_adjustments_product_id_idx ON public.inventory_adjustments USING btree (product_id);


--
-- TOC entry 3530 (class 1259 OID 25270)
-- Name: inventory_adjustments_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_adjustments_tenant_id_idx ON public.inventory_adjustments USING btree (tenant_id);


--
-- TOC entry 3584 (class 1259 OID 25301)
-- Name: order_requests_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_requests_created_at_idx ON public.order_requests USING btree (created_at);


--
-- TOC entry 3587 (class 1259 OID 25300)
-- Name: order_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_requests_status_idx ON public.order_requests USING btree (status);


--
-- TOC entry 3588 (class 1259 OID 25299)
-- Name: order_requests_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_requests_tenant_id_idx ON public.order_requests USING btree (tenant_id);


--
-- TOC entry 3572 (class 1259 OID 25295)
-- Name: platform_audit_logs_admin_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX platform_audit_logs_admin_id_idx ON public.platform_audit_logs USING btree (super_admin_id);


--
-- TOC entry 3573 (class 1259 OID 25296)
-- Name: platform_audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX platform_audit_logs_created_at_idx ON public.platform_audit_logs USING btree (created_at);


--
-- TOC entry 3496 (class 1259 OID 25255)
-- Name: products_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_barcode_idx ON public.products USING btree (barcode);


--
-- TOC entry 3497 (class 1259 OID 25256)
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- TOC entry 3500 (class 1259 OID 25254)
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- TOC entry 3501 (class 1259 OID 25253)
-- Name: products_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_tenant_id_idx ON public.products USING btree (tenant_id);


--
-- TOC entry 3502 (class 1259 OID 25257)
-- Name: purchase_order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_order_items_order_id_idx ON public.purchase_order_items USING btree (purchase_order_id);


--
-- TOC entry 3507 (class 1259 OID 25260)
-- Name: purchase_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_status_idx ON public.purchase_orders USING btree (status);


--
-- TOC entry 3508 (class 1259 OID 25259)
-- Name: purchase_orders_supplier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_supplier_id_idx ON public.purchase_orders USING btree (supplier_id);


--
-- TOC entry 3509 (class 1259 OID 25258)
-- Name: purchase_orders_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_tenant_id_idx ON public.purchase_orders USING btree (tenant_id);


--
-- TOC entry 3478 (class 1259 OID 25247)
-- Name: role_permissions_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_role_id_idx ON public.role_permissions USING btree (role_id);


--
-- TOC entry 3483 (class 1259 OID 25248)
-- Name: roles_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_tenant_id_idx ON public.roles USING btree (tenant_id);


--
-- TOC entry 3517 (class 1259 OID 25264)
-- Name: sales_order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_order_items_order_id_idx ON public.sales_order_items USING btree (sales_order_id);


--
-- TOC entry 3520 (class 1259 OID 25266)
-- Name: sales_orders_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_orders_branch_id_idx ON public.sales_orders USING btree (branch_id);


--
-- TOC entry 3521 (class 1259 OID 25267)
-- Name: sales_orders_cashier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_orders_cashier_id_idx ON public.sales_orders USING btree (cashier_id);


--
-- TOC entry 3522 (class 1259 OID 25269)
-- Name: sales_orders_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_orders_created_at_idx ON public.sales_orders USING btree (created_at);


--
-- TOC entry 3525 (class 1259 OID 25268)
-- Name: sales_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_orders_status_idx ON public.sales_orders USING btree (status);


--
-- TOC entry 3526 (class 1259 OID 25265)
-- Name: sales_orders_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_orders_tenant_id_idx ON public.sales_orders USING btree (tenant_id);


--
-- TOC entry 3561 (class 1259 OID 25294)
-- Name: security_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_logs_created_at_idx ON public.security_logs USING btree (created_at);


--
-- TOC entry 3562 (class 1259 OID 25292)
-- Name: security_logs_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_logs_event_idx ON public.security_logs USING btree (event);


--
-- TOC entry 3565 (class 1259 OID 25293)
-- Name: security_logs_severity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_logs_severity_idx ON public.security_logs USING btree (severity);


--
-- TOC entry 3566 (class 1259 OID 25290)
-- Name: security_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_logs_tenant_id_idx ON public.security_logs USING btree (tenant_id);


--
-- TOC entry 3567 (class 1259 OID 25291)
-- Name: security_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_logs_user_id_idx ON public.security_logs USING btree (user_id);


--
-- TOC entry 3531 (class 1259 OID 25275)
-- Name: stock_movements_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_created_at_idx ON public.stock_movements USING btree (created_at);


--
-- TOC entry 3534 (class 1259 OID 25273)
-- Name: stock_movements_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_product_id_idx ON public.stock_movements USING btree (product_id);


--
-- TOC entry 3535 (class 1259 OID 25272)
-- Name: stock_movements_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_tenant_id_idx ON public.stock_movements USING btree (tenant_id);


--
-- TOC entry 3536 (class 1259 OID 25274)
-- Name: stock_movements_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_type_idx ON public.stock_movements USING btree (type);


--
-- TOC entry 3578 (class 1259 OID 25297)
-- Name: store_payments_store_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX store_payments_store_id_idx ON public.store_payments USING btree (store_id);


--
-- TOC entry 3581 (class 1259 OID 25298)
-- Name: store_subscriptions_store_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX store_subscriptions_store_id_idx ON public.store_subscriptions USING btree (store_id);


--
-- TOC entry 3512 (class 1259 OID 25261)
-- Name: suppliers_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX suppliers_tenant_id_idx ON public.suppliers USING btree (tenant_id);


--
-- TOC entry 3589 (class 1259 OID 25304)
-- Name: support_tickets_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_created_at_idx ON public.support_tickets USING btree (created_at);


--
-- TOC entry 3592 (class 1259 OID 25303)
-- Name: support_tickets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_status_idx ON public.support_tickets USING btree (status);


--
-- TOC entry 3593 (class 1259 OID 25302)
-- Name: support_tickets_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_tenant_id_idx ON public.support_tickets USING btree (tenant_id);


--
-- TOC entry 3539 (class 1259 OID 25276)
-- Name: task_comments_task_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_comments_task_id_idx ON public.task_comments USING btree (task_id);


--
-- TOC entry 3540 (class 1259 OID 25278)
-- Name: tasks_assigned_to_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_assigned_to_idx ON public.tasks USING btree (assigned_to);


--
-- TOC entry 3543 (class 1259 OID 25279)
-- Name: tasks_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_status_idx ON public.tasks USING btree (status);


--
-- TOC entry 3544 (class 1259 OID 25277)
-- Name: tasks_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_tenant_id_idx ON public.tasks USING btree (tenant_id);


--
-- TOC entry 3486 (class 1259 OID 25250)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 3489 (class 1259 OID 25251)
-- Name: users_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_id_idx ON public.users USING btree (role_id);


--
-- TOC entry 3492 (class 1259 OID 25249)
-- Name: users_tenant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_tenant_id_idx ON public.users USING btree (tenant_id);


--
-- TOC entry 3640 (class 2606 OID 25151)
-- Name: activity_logs activity_logs_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3641 (class 2606 OID 25146)
-- Name: activity_logs activity_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3642 (class 2606 OID 25156)
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3643 (class 2606 OID 25166)
-- Name: audit_logs audit_logs_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3644 (class 2606 OID 25161)
-- Name: audit_logs audit_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3645 (class 2606 OID 25171)
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3596 (class 2606 OID 24926)
-- Name: branches branches_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3603 (class 2606 OID 24961)
-- Name: categories categories_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3614 (class 2606 OID 25016)
-- Name: customers customers_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3636 (class 2606 OID 25136)
-- Name: expenses expenses_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 3637 (class 2606 OID 25131)
-- Name: expenses expenses_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3638 (class 2606 OID 25141)
-- Name: expenses expenses_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3639 (class 2606 OID 25126)
-- Name: expenses expenses_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3621 (class 2606 OID 25066)
-- Name: inventory_adjustments inventory_adjustments_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 3622 (class 2606 OID 25056)
-- Name: inventory_adjustments inventory_adjustments_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3623 (class 2606 OID 25071)
-- Name: inventory_adjustments inventory_adjustments_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3624 (class 2606 OID 25061)
-- Name: inventory_adjustments inventory_adjustments_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3625 (class 2606 OID 25051)
-- Name: inventory_adjustments inventory_adjustments_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3654 (class 2606 OID 25221)
-- Name: order_requests order_requests_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_requests
    ADD CONSTRAINT order_requests_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3655 (class 2606 OID 25226)
-- Name: order_requests order_requests_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_requests
    ADD CONSTRAINT order_requests_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- TOC entry 3656 (class 2606 OID 25216)
-- Name: order_requests order_requests_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_requests
    ADD CONSTRAINT order_requests_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3649 (class 2606 OID 25191)
-- Name: platform_audit_logs platform_audit_logs_super_admin_id_platform_admins_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_audit_logs
    ADD CONSTRAINT platform_audit_logs_super_admin_id_platform_admins_id_fk FOREIGN KEY (super_admin_id) REFERENCES public.platform_admins(id);


--
-- TOC entry 3604 (class 2606 OID 24971)
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 3605 (class 2606 OID 24976)
-- Name: products products_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3606 (class 2606 OID 24966)
-- Name: products products_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3607 (class 2606 OID 24986)
-- Name: purchase_order_items purchase_order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3608 (class 2606 OID 24981)
-- Name: purchase_order_items purchase_order_items_purchase_order_id_purchase_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_purchase_orders_id_fk FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- TOC entry 3609 (class 2606 OID 24996)
-- Name: purchase_orders purchase_orders_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3610 (class 2606 OID 25006)
-- Name: purchase_orders purchase_orders_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3611 (class 2606 OID 25001)
-- Name: purchase_orders purchase_orders_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3612 (class 2606 OID 24991)
-- Name: purchase_orders purchase_orders_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3597 (class 2606 OID 24936)
-- Name: role_permissions role_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 3598 (class 2606 OID 24931)
-- Name: role_permissions role_permissions_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 3599 (class 2606 OID 24941)
-- Name: roles roles_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3615 (class 2606 OID 25026)
-- Name: sales_order_items sales_order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3616 (class 2606 OID 25021)
-- Name: sales_order_items sales_order_items_sales_order_id_sales_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_sales_order_id_sales_orders_id_fk FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;


--
-- TOC entry 3617 (class 2606 OID 25036)
-- Name: sales_orders sales_orders_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3618 (class 2606 OID 25046)
-- Name: sales_orders sales_orders_cashier_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_cashier_id_users_id_fk FOREIGN KEY (cashier_id) REFERENCES public.users(id);


--
-- TOC entry 3619 (class 2606 OID 25041)
-- Name: sales_orders sales_orders_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3620 (class 2606 OID 25031)
-- Name: sales_orders sales_orders_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3646 (class 2606 OID 25186)
-- Name: security_logs security_logs_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT security_logs_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3647 (class 2606 OID 25181)
-- Name: security_logs security_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT security_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3648 (class 2606 OID 25176)
-- Name: security_logs security_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT security_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3626 (class 2606 OID 25081)
-- Name: stock_movements stock_movements_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3627 (class 2606 OID 25091)
-- Name: stock_movements stock_movements_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3628 (class 2606 OID 25086)
-- Name: stock_movements stock_movements_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3629 (class 2606 OID 25076)
-- Name: stock_movements stock_movements_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3650 (class 2606 OID 25196)
-- Name: store_payments store_payments_store_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_payments
    ADD CONSTRAINT store_payments_store_id_tenants_id_fk FOREIGN KEY (store_id) REFERENCES public.tenants(id);


--
-- TOC entry 3651 (class 2606 OID 25201)
-- Name: store_payments store_payments_subscription_id_store_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_payments
    ADD CONSTRAINT store_payments_subscription_id_store_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.store_subscriptions(id);


--
-- TOC entry 3652 (class 2606 OID 25211)
-- Name: store_subscriptions store_subscriptions_plan_id_subscription_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_subscriptions
    ADD CONSTRAINT store_subscriptions_plan_id_subscription_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- TOC entry 3653 (class 2606 OID 25206)
-- Name: store_subscriptions store_subscriptions_store_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_subscriptions
    ADD CONSTRAINT store_subscriptions_store_id_tenants_id_fk FOREIGN KEY (store_id) REFERENCES public.tenants(id);


--
-- TOC entry 3613 (class 2606 OID 25011)
-- Name: suppliers suppliers_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3657 (class 2606 OID 25236)
-- Name: support_tickets support_tickets_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3658 (class 2606 OID 25241)
-- Name: support_tickets support_tickets_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- TOC entry 3659 (class 2606 OID 25231)
-- Name: support_tickets support_tickets_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3630 (class 2606 OID 25096)
-- Name: task_comments task_comments_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 3631 (class 2606 OID 25101)
-- Name: task_comments task_comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3632 (class 2606 OID 25116)
-- Name: tasks tasks_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- TOC entry 3633 (class 2606 OID 25111)
-- Name: tasks tasks_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3634 (class 2606 OID 25121)
-- Name: tasks tasks_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3635 (class 2606 OID 25106)
-- Name: tasks tasks_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3660 (class 2606 OID 32776)
-- Name: tenant_settings tenant_settings_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3600 (class 2606 OID 24951)
-- Name: users users_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3601 (class 2606 OID 24956)
-- Name: users users_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 3602 (class 2606 OID 24946)
-- Name: users users_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


-- Completed on 2026-07-27 18:33:02

--
-- PostgreSQL database dump complete
--

\unrestrict GA1qvlGcgb0VkUtyEdZ8K2kRdx194doB7bfmrfGK3vIi9LXzT6zgNN3CF6YczpY

