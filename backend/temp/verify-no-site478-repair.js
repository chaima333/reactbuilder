require('dotenv').config({ path: 'C:/Users/kabou/Desktop/ReactBuilder/backend/.env', quiet: true });
const { Client } = require('pg');
(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:15000}); await c.connect(); const res=await c.query('select id,title,slug,status,system_type from pages where site_id=$1 and slug=$2',[478,'client-portal']); console.table(res.rows); await c.end(); process.exit(0);})().catch(e=>{console.error(e);process.exit(1)});
