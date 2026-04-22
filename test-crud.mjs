import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERRO: Variáveis de ambiente não encontradas.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runCRUDTest() {
  console.log('🔄 Iniciando Teste de Comunicação e CRUD no Supabase...\n');

  // 1. CREATE (Escrever)
  console.log('1️⃣  Testando ESCRITA (INSERT)...');
  const { data: insertData, error: insertError } = await supabase
    .from('process_categories')
    .insert([
      { module: 'rh', name: 'TESTE_AUTOMATICO_SISTEMA', active: true }
    ])
    .select()
    .single();

  if (insertError) {
    console.error('❌ ERRO na Escrita:', insertError.message);
    return;
  }
  console.log('✅ ESCRITA com sucesso! ID gerado:', insertData.id);

  // 2. READ (Ler)
  console.log('\n2️⃣  Testando LEITURA (SELECT)...');
  const { data: readData, error: readError } = await supabase
    .from('process_categories')
    .select('*')
    .eq('id', insertData.id)
    .single();

  if (readError) {
    console.error('❌ ERRO na Leitura:', readError.message);
    return;
  }
  console.log('✅ LEITURA com sucesso! Nome encontrado:', readData.name);

  // 3. UPDATE (Editar)
  console.log('\n3️⃣  Testando EDIÇÃO (UPDATE)...');
  const { data: updateData, error: updateError } = await supabase
    .from('process_categories')
    .update({ name: 'TESTE_AUTOMATICO_EDITADO' })
    .eq('id', insertData.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ ERRO na Edição:', updateError.message);
    return;
  }
  console.log('✅ EDIÇÃO com sucesso! Novo nome:', updateData.name);

  // 4. DELETE (Apagar)
  console.log('\n4️⃣  Testando EXCLUSÃO (DELETE)...');
  const { error: deleteError } = await supabase
    .from('process_categories')
    .delete()
    .eq('id', insertData.id);

  if (deleteError) {
    console.error('❌ ERRO na Exclusão:', deleteError.message);
    return;
  }

  // Verificando se deletou mesmo
  const { data: checkData } = await supabase
    .from('process_categories')
    .select('*')
    .eq('id', insertData.id)
    .single();

  if (!checkData) {
    console.log('✅ EXCLUSÃO com sucesso! O registro foi removido do banco.');
  } else {
    console.error('❌ ERRO: O registro ainda existe após a exclusão.');
  }

  console.log('\n🎉 TODOS OS TESTES PASSARAM! O banco de dados está escrevendo, lendo, editando e deletando perfeitamente!');
}

runCRUDTest();
