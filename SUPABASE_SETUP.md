# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be set up

## 2. Get Your Project Credentials

1. Go to Project Settings > API
2. Copy your Project URL and anon public key

## 3. Create the Database Table

Go to the SQL Editor in your Supabase dashboard and run this SQL:

```sql
CREATE TABLE maze_completions (
  student_id VARCHAR(13) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completion_time INTEGER NOT NULL, -- Time in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, timestamp)
);

-- Add an index for better query performance on individual columns
CREATE INDEX idx_maze_completions_student_id ON maze_completions(student_id);
CREATE INDEX idx_maze_completions_timestamp ON maze_completions(timestamp);
CREATE INDEX idx_maze_completions_completion_time ON maze_completions(completion_time);
```

## 4. Configure Your Application

1. Open `main.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual Supabase URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key
   ```

## 5. Row Level Security (Optional but Recommended)

To secure your data, you can enable RLS policies:

```sql
-- Enable RLS
ALTER TABLE maze_completions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (since it's a public game)
CREATE POLICY "Allow public insert" ON maze_completions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow only authenticated users to read (optional)
-- CREATE POLICY "Allow read for authenticated" ON maze_completions
--   FOR SELECT TO authenticated
--   USING (true);
```

## 6. Test the Integration

1. Complete the maze game
2. Enter a 13-character student ID when prompted
3. Check your Supabase dashboard to see if the data was inserted

## Data Structure

The table will store:
- `student_id`: 13-character student identifier (part of composite primary key)
- `timestamp`: When the maze was completed with millisecond precision (part of composite primary key)
- `completion_time`: Time taken to complete the maze **in milliseconds** (for precise timing)
- `created_at`: When the record was created in the database

**Primary Key:** Combination of `student_id` and `timestamp` - This allows the same student to complete the maze multiple times while ensuring each completion is uniquely identified. The timestamp includes millisecond precision to handle rapid successive completions.

**Note:** The `completion_time` is now stored in milliseconds (e.g., 5250ms for 5.25 seconds) for precise timing analytics.

## Troubleshooting

- Make sure your Supabase URL and key are correct
- Check the browser console for any error messages
- Verify that the table name matches (`maze_completions`)
- Ensure RLS policies allow the insertion if you've enabled them
