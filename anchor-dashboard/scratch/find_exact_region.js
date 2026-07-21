import pg from 'pg';
const { Client } = pg;

const regions = [
  'ap-northeast-2', 'ap-northeast-1', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2', 'ap-south-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'sa-east-1'
];

async function scan() {
  console.log("=== AWS/GCP 테넌트 정밀 스캔 시작 ===");
  for (const r of regions) {
    for (const prefix of ['aws-0', 'gcp-0']) {
      for (const port of [5432, 6543]) {
        const host = `${prefix}-${r}.pooler.supabase.com`;
        const client = new Client({
          host: host,
          port: port,
          user: 'postgres.qpojcgpdgvzlivjrhrhn',
          password: 'uc_anchor',
          database: 'postgres',
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 1000
        });

        try {
          await client.connect();
          console.log(`\n🎉🎉🎉 [SUCCESS CONNECT!] 성공: ${host}:${port}\n`);
          await client.end();
          return;
        } catch (err) {
          if (err.message.includes("tenant/user postgres.qpojcgpdgvzlivjrhrhn not found")) {
            // 테넌트 없음
          } else if (err.message.includes("password authentication failed") || err.message.includes("authentication failed")) {
            console.log(`🎯 [FOUND TENANT!] 테넌트가 매칭되는 서버 발견: ${host}:${port} (에러: ${err.message})`);
            await client.end();
            return;
          } else {
            // ENOTFOUND 등 통신 에러
          }
        }
      }
    }
  }
  console.log("=== 스캔 완료 ===");
}

scan();
