const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres:C0l0rHu7%40456@db.sdkrbzzdnbljkhzaqqxy.supabase.co:5432/postgres";

const client = new Client({
  connectionString: DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const sql = `
      -- Create the magic_docs table
      create table if not exists public.magic_docs (
        id uuid default gen_random_uuid() primary key,
        title text not null default 'Untitled Document',
        content text default '',
        last_updated timestamp with time zone default now(),
        created_at timestamp with time zone default now()
      );

      -- Enable Row Level Security (RLS)
      alter table public.magic_docs enable row level security;

      -- Create Policies (Allow public read/write for now)
      create policy "Public Read Access"
        on public.magic_docs for select
        using (true);

      create policy "Public Insert Access"
        on public.magic_docs for insert
        with check (true);

      create policy "Public Update Access"
        on public.magic_docs for update
        using (true)
        with check (true);

      create policy "Public Delete Access"
        on public.magic_docs for delete
        using (true);

      -- Enable Realtime for the table
      alter publication supabase_realtime add table public.magic_docs;
    `;

    await client.query(sql);
    console.log("Successfully created magic_docs table, policies, and enabled Realtime!");

  } catch (err) {
    console.error("Error executing SQL:", err.message);
  } finally {
    await client.end();
  }
}

run();
