-- Supabase Storage RLS Policies Setup Script
-- Run this in your Supabase SQL Editor to fix the upload permissions

-- First, enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for storage bucket" ON storage.objects;

-- Policy 1: Allow authenticated users to INSERT (upload) files to the storage bucket
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'storage'
);

-- Policy 2: Allow authenticated users to SELECT (view/download) files from the storage bucket
CREATE POLICY "Allow authenticated users to view files" ON storage.objects
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'storage'
);

-- Policy 3: Allow users to UPDATE files they uploaded (optional)
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'storage'
)
WITH CHECK (
  bucket_id = 'storage'
);

-- Policy 4: Allow users to DELETE files they uploaded (optional)
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'storage'
);

-- Alternative: If you want to allow public read access (for public announcements)
-- Uncomment the following policy if needed:
-- CREATE POLICY "Public read access for storage bucket" ON storage.objects
-- FOR SELECT 
-- TO public
-- USING (
--   bucket_id = 'storage'
-- );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
