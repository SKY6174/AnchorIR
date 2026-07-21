import pg from 'pg';
const { Client } = pg;

const regions = [
  'ap-northeast-2', 'ap-northeast-1', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2', 'ap-south-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'sa-east-1'
];

async function scan() {
  console.log("=== GCP 리전 및 포트 스캔 시작 ===");
  for (const r of regions) {
    for (const port of [5432, 6543]) {
      const host = `gcp-0-${r}.pooler.supabase.com`;
      const client = new Client({
        host: host,
        port: port,
        user: 'postgres.qpojcgpdgvzlivjrhrhn',
        password: 'wrong_password_on_purpose',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 1500
      });

      try {
        await client.connect();
        console.log(`🎉 [MATCH] 연결 성공 (설마?!): ${host}:${port}`);
        await client.end();
        return;
      } catch (err) {
        if (err.message.includes("tenant/user postgres.qpojcgpdgvzlivjrhrhn not found")) {
          // 테넌트 없음
        } else if (err.message.includes("password authentication failed") || err.message.includes("authentication failed")) {
          console.log(`🎯 [FOUND!] 테넌트 발견: ${host}:${port}`);
          await client.end();
          return;
        } else {
          // ENOTFOUND 등 조용히 넘어감
        }
      }
    }
  }
  console.log("=== GCP 스캔 종료 ===");
}

scan();
