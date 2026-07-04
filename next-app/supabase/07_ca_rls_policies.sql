-- ============================================================
-- Sharma Industries: Supabase Row Level Security (RLS) Policies
-- ============================================================
-- This file configures database-level RLS policies to control read/write permissions
-- based on user roles and record ownership.

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS factory_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS raw_materials ENABLE ROW LEVEL SECURITY;

-- 2. Define custom session parameter mappings
-- In Next.js Server Actions or API routes, before executing queries, the server client
-- can run the following SQL local transaction parameters to enforce session-based RLS:
--   SET LOCAL app.current_user_id = 'user-uuid-here';
--   SET LOCAL app.current_user_role = 'ca';

CREATE OR REPLACE FUNCTION get_current_user_id() 
RETURNS TEXT AS $$
  SELECT current_setting('app.current_user_id', true);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_current_user_role() 
RETURNS TEXT AS $$
  SELECT current_setting('app.current_user_role', true);
$$ LANGUAGE sql STABLE;

-- ------------------------------------------------------------
-- POLICIES FOR 'users' TABLE
-- ------------------------------------------------------------
CREATE POLICY select_all_users_for_ceo_and_ca ON users
  FOR SELECT TO authenticated, anon
  USING (
    get_current_user_role() = 'ceo' 
    OR get_current_user_role() = 'ca'
    OR id = get_current_user_id()
  );

CREATE POLICY modify_users_for_ceo ON users
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'ceo')
  WITH CHECK (get_current_user_role() = 'ceo');

-- ------------------------------------------------------------
-- POLICIES FOR 'invoices' TABLE
-- ------------------------------------------------------------
CREATE POLICY view_all_invoices_for_ceo_and_ca ON invoices
  FOR SELECT TO authenticated
  USING (get_current_user_role() = 'ceo' OR get_current_user_role() = 'ca');

CREATE POLICY view_own_invoices_for_dealer ON invoices
  FOR SELECT TO authenticated
  USING (
    get_current_user_role() = 'dealer' 
    AND (client_id = get_current_user_id() OR customer_id = get_current_user_id())
  );

CREATE POLICY manage_invoices_for_ceo_and_dealer ON invoices
  FOR ALL TO authenticated
  USING (
    get_current_user_role() = 'ceo' 
    OR (get_current_user_role() = 'dealer' AND (client_id = get_current_user_id() OR customer_id = get_current_user_id()))
  )
  WITH CHECK (
    get_current_user_role() = 'ceo'
    OR (get_current_user_role() = 'dealer' AND (client_id = get_current_user_id() OR customer_id = get_current_user_id()))
  );

-- ------------------------------------------------------------
-- POLICIES FOR 'purchase_master' TABLE (Purchases)
-- ------------------------------------------------------------
CREATE POLICY view_purchases_for_ceo_and_ca ON purchase_master
  FOR SELECT TO authenticated
  USING (get_current_user_role() = 'ceo' OR get_current_user_role() = 'ca');

CREATE POLICY manage_purchases_for_ceo ON purchase_master
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'ceo')
  WITH CHECK (get_current_user_role() = 'ceo');

-- ------------------------------------------------------------
-- POLICIES FOR 'factory_expenses' TABLE (Expenses)
-- ------------------------------------------------------------
CREATE POLICY view_expenses_for_ceo_and_ca ON factory_expenses
  FOR SELECT TO authenticated
  USING (get_current_user_role() = 'ceo' OR get_current_user_role() = 'ca');

CREATE POLICY manage_expenses_for_ceo ON factory_expenses
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'ceo')
  WITH CHECK (get_current_user_role() = 'ceo');

-- ------------------------------------------------------------
-- POLICIES FOR 'clients' TABLE
-- ------------------------------------------------------------
CREATE POLICY view_clients_for_all_authenticated ON clients
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY manage_clients_for_ceo ON clients
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'ceo')
  WITH CHECK (get_current_user_role() = 'ceo');
