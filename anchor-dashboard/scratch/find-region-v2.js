import pg from 'pg';

const { Client } = pg;

const prefixes = ['aws-0', 'aws-1', 'gcp-0', 'gcp-1'];
const ports = [6543, 5432];
const passwords = ['Snake1201@', 'uc_anchor'];
const regions = ['ap-northeast-2', 'ap-northeast-1', 'ap-southeast-1', 'us-east-1']; // 주요 아시아 및 글로벌 리전만 타겟팅

async function testCombination(prefix, region, port, password) {
  const host = `${prefix}-${region}.pooler.supabase.com`;
  const client = new Client({
    host: host,
    port: port,
    user: 'postgres.qpojcgpdgvzlivjrhrhn',
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 2000
  });

  try {
    await client.connect();
    console.log(`\n🎉🎉🎉 SUCCESS!!! 🎉🎉🎉`);
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`Password: ${password}`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes("tenant/user postgres.qpojcgpdgvzlivjrhrhn not found")) {
      // 테넌트를 찾을 수 없음
    } else if (err.message.includes("authentication failed") || err.message.includes("password authentication failed")) {
      console.log(`🔑 FOUND TENANT! But password failed: Host: ${host}, Port: ${port}, Password: ${password}`);
    } else {
      console.log(`❌ ${host}:${port} (${password}) -> ${err.message}`);
    }
    return false;
  }
}

async function main() {
  console.log("Starting precision scan for Supabase database combinations...");
  for (const region of regions) {
    for (const prefix of prefixes) {
      for (const port of ports) {
        for (const password of passwords) {
          process.stdout.write(`Testing ${prefix}-${region}.pooler.supabase.com:${port} [${password}]... `);
          const ok = await testCombination(prefix, region, port, password);
          if (ok) {
            console.log("\nScan terminated successfully.");
            return;
          }
          console.log("failed");
        }
      }
    }
  }
  console.log("Scan complete. No working combination found.");
}

main();
