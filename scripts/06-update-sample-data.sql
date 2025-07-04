-- Update sample users with the correct email
UPDATE public.users 
SET email = 'o@b-p.co.jp' 
WHERE employee_id = 'EMP001';

-- Insert additional user if needed
INSERT INTO public.users (employee_id, name, email, role) 
VALUES ('EMP004', 'テストユーザー', 'o@b-p.co.jp', 'admin')
ON CONFLICT (employee_id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name;
