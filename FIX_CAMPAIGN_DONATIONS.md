# Campaign Donation Tracking Fix

This SQL script will enable proper campaign donation tracking by setting up the correct RLS policies.

## Run these SQL commands in your Supabase SQL Editor

```sql
-- 1. Allow service role to update campaigns (for the verify-payment API)
CREATE POLICY IF NOT EXISTS "Allow service role to update campaigns"
ON campaigns FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Allow authenticated users to update campaigns (backup if service role key is not set)
CREATE POLICY IF NOT EXISTS "Allow authenticated to update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Allow anon users to update campaigns (if using anon key for API routes)
CREATE POLICY IF NOT EXISTS "Allow anon to update campaigns"
ON campaigns FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 4. Verify the policies were created
SELECT * FROM pg_policies WHERE tablename = 'campaigns';
```

## After running the SQL script:

1. **Add Service Role Key to `.env.local`**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (secret)
   - Add to `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

2. **Restart your Next.js dev server**:
   ```bash
   # Press Ctrl+C to stop, then run:
   npm run dev
   ```

3. **Test the donation flow**:
   - Make a test donation
   - Check the server console for `[VERIFY-PAYMENT]` logs
   - The raised amount should update in real-time!

## Troubleshooting

If you still see issues:
- Check server logs for any errors
- Verify the `campaign_id` column exists in the `donations` table
- Make sure you're donating from a campaign page (URL should have `?campaign=ID`)
