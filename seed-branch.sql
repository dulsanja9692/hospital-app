INSERT INTO branches (branch_id, hospital_id, name, location, is_active, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Main Branch', 'Colombo', true, NOW(), NOW())
ON CONFLICT (branch_id) DO NOTHING;
