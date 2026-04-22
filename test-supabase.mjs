import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERRO: Variáveis de ambiente não encontradas.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testando conexão com o Supabase...');
  console.log(`URL: ${SUPABASE_URL}`);
  
  // Test 1: Fetch profiles
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  
  if (error) {
    console.error('❌ ERRO AO CONECTAR:', error.message);
  } else {
    console.log('✅ SUCESSO! Conexão estabelecida com o Supabase.');
    console.log(`Recebidos ${data.length} perfis.`);
    console.log('Perfis de teste:', data.map(p => `${p.name} (${p.email}) - ${p.role}`).join(', '));
  }
}

testConnection();
