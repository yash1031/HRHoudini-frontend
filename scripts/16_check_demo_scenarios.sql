-- Check what scenarios exist in the database
SELECT 
    id,
    name,
    target_personas,
    is_active,
    company_id
FROM demo_scenarios 
ORDER BY id;

-- Also check personas
SELECT 
    id,
    name,
    role,
    company_id,
    is_active
FROM demo_personas 
ORDER BY id;
