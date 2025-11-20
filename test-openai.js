// Script de teste para verificar se a OpenAI está funcionando
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const testOpenAI = async () => {
  console.log('🧪 Testando integração com OpenAI...\n');

  // Verificar API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERRO: OPENAI_API_KEY não encontrada no .env');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`   Key: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('\n🚀 Fazendo requisição de teste...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é a Fada Mãe Gabriela, uma dentista amorosa.'
        },
        {
          role: 'user',
          content: 'Escreva UMA ÚNICA frase curta (máximo 10 palavras) de parabéns para uma criança que venceu o jogo da fada.'
        }
      ],
      temperature: 0.9,
      max_tokens: 50
    });

    const response = completion.choices[0].message.content;

    console.log('\n✅ SUCESSO! OpenAI respondeu:');
    console.log(`   "${response}"`);
    console.log('\n✨ A IA está funcionando perfeitamente!');
    console.log('\n📊 Detalhes da requisição:');
    console.log(`   Modelo: ${completion.model}`);
    console.log(`   Tokens usados: ${completion.usage.total_tokens}`);
    console.log(`   Custo estimado: $${(completion.usage.total_tokens * 0.000002).toFixed(6)}`);

  } catch (error) {
    console.error('\n❌ ERRO ao chamar OpenAI:');
    console.error(`   ${error.message}`);

    if (error.status === 401) {
      console.error('\n💡 A API key parece ser inválida ou expirada.');
    } else if (error.status === 429) {
      console.error('\n💡 Limite de taxa excedido. Aguarde um momento.');
    } else {
      console.error('\n💡 Verifique sua conexão e créditos da OpenAI.');
    }

    process.exit(1);
  }
};

testOpenAI();
