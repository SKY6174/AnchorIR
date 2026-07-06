-- Update RISE to 앵커 in committees table
UPDATE committees
SET name = REPLACE(name, 'RISE', '앵커'),
    full_name = REPLACE(full_name, 'RISE', '앵커'),
    purpose = REPLACE(purpose, 'RISE', '앵커'),
    description = REPLACE(description, 'RISE', '앵커'),
    constitution = REPLACE(constitution, 'RISE', '앵커');

-- For JSONB array replacement in functions, since it's an array of strings, we need a small trick in Postgres
-- or we can just update it using a subquery if we want to be fully compliant, but since the array length is small
-- and Supabase allows JS-like functions, it might be easier to rebuild it, or just use REPLACE on the text cast.
UPDATE committees
SET functions = REPLACE(functions::text, 'RISE', '앵커')::jsonb;

-- Update RISE to 앵커 in committee_members table
UPDATE committee_members
SET dept = REPLACE(dept, 'RISE', '앵커')
WHERE dept LIKE '%RISE%';
