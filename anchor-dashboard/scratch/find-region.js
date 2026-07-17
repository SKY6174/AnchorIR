import pg from 'pg';

const { Client } = pg;

const regions = [
  'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ca-central-1', 'sa-east-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'me-central-1', 'af-south-1', 'ap-south-2', 'eu-south-1', 'eu-south-2'
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new Client({
    host: host,
    port: 6543,
    user: 'postgres.qpojcgpdgvzlivjrhrhn',
    password: 'uc_anchor',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`\n🎉 SUCCESS! Region is: ${region}\n`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes("tenant/user postgres.qpojcgpdgvzlivjrhrhn not found")) {
      // tenant not found
    } else {
      console.log(`❓ ${region}: ${err.message}`);
    }
    return false;
  }
}

async function main() {
  console.log("Scanning all Supabase regions...");
  for (const region of regions) {
    process.stdout.write(`Testing ${region}... `);
    const ok = await testRegion(region);
    if (ok) return;
    else console.log("not found");
  }
  console.log("Scan complete. No matching region found.");
}

main();
