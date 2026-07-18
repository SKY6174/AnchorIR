import pg from 'pg';
const { Client } = pg;

const regions = [
  'ap-northeast-2', 'ap-northeast-1', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2', 'ap-south-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'sa-east-1'
];

async function scan() {
  console.log("=== Supabase 테넌트 리전 정밀 스캔 시작 ===");
  
  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    const client = new Client({
      host: host,
      port: 5432,
      user: 'postgres.qpojcgpdgvzlivjrhrhn',
      password: 'wrong_password_on_purpose', // 비밀번호 오류가 나더라도 테넌트가 있으면 authentication failed가 뜸
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });

    try {
      await client.connect();
      console.log(`🎉 [MATCH] 연결 성공 (설마?!): ${host}`);
      await client.end();
      return;
    } catch (err) {
      if (err.message.includes("tenant/user postgres.qpojcgpdgvzlivjrhrhn not found")) {
        // 테넌트 없음
      } else if (err.message.includes("password authentication failed") || err.message.includes("authentication failed")) {
        console.log(`🎯 [FOUND REGION!] 테넌트 발견 리전: ${r} (Host: ${host})`);
        return;
      } else {
        console.log(`❓ [${r}] 기타 에러: ${err.message}`);
      }
    }
  }
  console.log("=== 스캔 종료 (일치하는 리전 없음) ===");
}

scan();
