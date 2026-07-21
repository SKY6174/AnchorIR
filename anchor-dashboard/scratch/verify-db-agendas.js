import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(Boolean)
    .filter(line => !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).replace(/["\r]/g, '').trim()];
    })
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const meetingId = 'b62f11cd-3768-4b9f-9aee-f52b0c1920c6';
  console.log("Checking committee_meetings table for ID:", meetingId);
  const { data: meeting, error: mErr } = await supabase
    .from('committee_meetings')
    .select('*')
    .eq('id', meetingId);
  console.log("Meeting:", meeting, "Error:", mErr);

  console.log("Checking meeting_agendas table for meetingId:", meetingId);
  const { data: agendas, error: aErr } = await supabase
    .from('meeting_agendas')
    .select('*')
    .eq('meeting_id', meetingId);
  console.log("Agendas:", agendas, "Error:", aErr);

  console.log("Checking meeting_agenda_votes table for meetingId:", meetingId);
  const { data: votes, error: vErr } = await supabase
    .from('meeting_agenda_votes')
    .select('*')
    .eq('meeting_id', meetingId);
  console.log("Votes:", votes, "Error:", vErr);
}

main();
