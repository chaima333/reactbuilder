require('dotenv').config({ path: 'C:/Users/kabou/Desktop/ReactBuilder/backend/.env', quiet: true });
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  await c.connect();
  const pages = await c.query(`
    select id,title,slug,status,visibility,system_type,is_homepage,
      jsonb_array_length(case when jsonb_typeof(blocks::jsonb)='array' then blocks::jsonb else '[]'::jsonb end) as block_count
    from pages where site_id=$1 order by id
  `, [478]);
  console.table(pages.rows);
  await c.end();
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
