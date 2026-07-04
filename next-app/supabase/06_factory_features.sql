-- Update expenses table to include expense_frequency
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_frequency TEXT DEFAULT 'Daily';
