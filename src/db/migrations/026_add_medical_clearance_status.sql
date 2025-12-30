-- Add status field to medical_clearances
alter table medical_clearances 
add column if not exists status text default 'pending' check (status in ('pending', 'approved', 'rejected'));

-- Update existing clearances to 'approved' if they have a clearance date
update medical_clearances 
set status = 'approved' 
where status = 'pending' and clearance_date is not null;

