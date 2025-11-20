# Sistema de Cartas Colecionáveis - Fadas Lindas

## 📋 Visão Geral

O jogo "Fadas Lindas" agora possui um sistema completo de **cartas colecionáveis** que substituiu o sistema anterior de cartas simples. Cada vez que uma criança completa o jogo, ela recebe uma carta única com:

- ✨ **Prompts infinitamente variados** usando templates combinatórios
- 🎯 **Sistema de raridade** (Comum, Rara, Épica, Lendária)
- 📊 **Estatísticas detalhadas** de desempenho
- 🎨 **Design visual único** baseado na raridade
- 🔢 **Numeração sequencial** para coleção

## 🎮 Como Funciona

### 1. Geração de Cartas

Quando uma criança completa todos os três mini-jogos:

1. O sistema coleta o **contexto do jogo**:
   - Personagem escolhido (Fada Sophie ou Julie)
   - Dificuldade selecionada (Fácil, Médio, Difícil)
   - Pontuação total
   - Estrelas coletadas
   - Jogos completados

2. **Determina a raridade** baseada no desempenho:
   - Maior dificuldade = mais pontos de raridade
   - Mais pontos = mais pontos de raridade
   - Mais estrelas = mais pontos de raridade
   - 2% de chance de "sorte" para upgrade de raridade

3. **Gera um prompt único** usando templates:
   - 10 temas diferentes (aventura mágica, conquista heroica, etc.)
   - 6 tons diferentes (orgulhoso, emocionado, maravilhado, etc.)
   - 5 formatos diferentes (carta curta, mensagem especial, etc.)
   - = **300 combinações únicas possíveis**

4. Usa **OpenAI GPT-3.5-turbo** para gerar o texto da carta

### 2. Sistema de Raridade

#### Pontuação de Raridade

```
Dificuldade:
- HARD: +40 pontos
- MEDIUM: +20 pontos
- EASY: +10 pontos

Score:
- ≥5000: +30 pontos
- ≥3000: +20 pontos
- ≥1500: +10 pontos

Estrelas:
- ≥20: +20 pontos
- ≥10: +10 pontos

Jogos completados: +5 pontos cada
Fator sorte (2%): +30 pontos
```

#### Classificação

- **≥90 pontos**: 👑 **LENDÁRIA** (dourada, brilho amarelo)
- **≥60 pontos**: 💎 **ÉPICA** (roxa, brilho púrpura)
- **≥30 pontos**: ✨ **RARA** (azul, brilho azul claro)
- **<30 pontos**: ⭐ **COMUM** (cinza, sem brilho especial)

### 3. Templates de Prompt

O sistema usa três camadas de templates:

#### Temas (10 opções)
- aventura mágica
- conquista heroica
- jornada épica
- missão especial
- descoberta brilhante
- feito corajoso
- momento mágico
- triunfo luminoso
- vitória encantada
- façanha extraordinária

#### Tons (6 opções)
- orgulhoso e afetuoso
- emocionado e carinhoso
- maravilhado e amoroso
- impressionado e terno
- inspirado e doce
- admirado e protetor

#### Formatos (5 opções)
- carta curta e emocionante
- mensagem especial de 2-3 frases
- bilhete mágico breve
- recado encantado curto
- nota carinhosa pequena

## 🎨 Interface Visual

### Tela de Vitória (Ending)

A tela final agora mostra:

1. **Badge de Raridade** com cor e brilho animado
2. **Número da Carta** (ex: Carta #5)
3. **Estatísticas Expandidas**:
   - Pontos Totais
   - Estrelas Coletadas ⭐
   - Dificuldade 🎯
   - Número da Carta 📜

### Galeria Mágica (Memories)

A galeria foi completamente renovada com:

1. **Seção de Cartas Colecionáveis**:
   - Grid responsivo (1/2/3 colunas)
   - Filtros por raridade
   - Cards com hover e animação
   - Badges de raridade
   - Numeração da carta
   - Estatísticas compactas

2. **Filtros Inteligentes**:
   - "Todas" - mostra todas as cartas
   - "👑 Lendárias" - só aparece se você tiver alguma
   - "Épicas" - só aparece se você tiver alguma

3. **Visual das Cartas**:
   - Borda colorida baseada na raridade
   - Sombra com brilho da cor de raridade
   - Badge de raridade (topo direito)
   - Número da carta (topo esquerdo)
   - Foto do personagem
   - Preview do texto da carta
   - Stats: Pontos, Estrelas, Dificuldade

## 🔧 Configuração Técnica

### 1. Instalar Dependências

```bash
npm install openai
```

### 2. Configurar API Key

Crie um arquivo `.env` na raiz do projeto:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Obter API Key da OpenAI

1. Acesse https://platform.openai.com/
2. Crie uma conta ou faça login
3. Vá em "API Keys"
4. Crie uma nova chave
5. Cole no arquivo `.env`

### 4. Custo Estimado

Com GPT-3.5-turbo:
- ~150 tokens por carta
- ~$0.0015 por carta gerada
- 1000 cartas = ~$1.50

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

- `services/openaiService.ts` - Serviço de geração de cartas com OpenAI
- `COLLECTIBLE_CARDS.md` - Esta documentação
- `.env.example` - Exemplo de configuração

### Arquivos Modificados

- `types.ts` - Adicionados: CardRarity, CollectibleCard, GameContext
- `storageService.ts` - Métodos para salvar/recuperar cartas
- `App.tsx` - Integração completa do sistema
- `vite.config.ts` - Suporte para variável OPENAI_API_KEY

## 🎯 Dados Armazenados

Cada carta armazena:

```typescript
{
  id: string; // ID único
  character: Character; // Sophie ou Julie
  rarity: CardRarity; // comum, rara, épica, lendária
  theme: string; // tema usado
  letterText: string; // texto da carta
  stats: {
    score: number;
    starsCollected: number;
    difficulty: Difficulty;
    gamesCompleted: string[];
    date: string; // ISO timestamp
  };
  metadata: {
    cardNumber: number; // Numeração sequencial
    seasonYear: string; // Ano da temporada
    promptTheme: string; // Template usado
    promptTone: string;
    promptFormat: string;
  };
}
```

## 🔄 Modo Fallback

Se a API Key não estiver configurada:

1. O sistema usa um **texto pré-definido** simples
2. A carta ainda é salva com raridade baseada no desempenho
3. Todos os stats são registrados normalmente
4. Apenas o texto da carta é genérico

## 🚀 Próximos Passos (Opcionais)

### Recursos Futuros Possíveis

1. **Imagens Geradas por IA**
   - Usar DALL-E 3 para criar imagem única em cada carta
   - Custo: ~$0.04 por carta

2. **Sistema de Trading**
   - Permitir compartilhar cartas entre dispositivos
   - QR Code para transferência

3. **Conquistas/Badges**
   - "Colecionador Mestre" - 10 cartas lendárias
   - "Primeira Lendária" - badge especial

4. **Estatísticas da Coleção**
   - Gráficos de progresso
   - Taxa de drop de raridades
   - Carta mais rara

5. **Temporadas**
   - Temas sazonais (Natal, Páscoa, etc.)
   - Cartas exclusivas por temporada
   - Design visual diferente

## 🐛 Troubleshooting

### Cartas não estão sendo salvas

1. Verifique o console do navegador para erros
2. Teste localStorage: `localStorage.getItem('fabula_collectible_cards_v1')`
3. Limpe o cache se necessário

### Texto da carta está genérico

1. Verifique se `.env` existe e tem `OPENAI_API_KEY`
2. Confirme que a API key é válida
3. Verifique o console para erros da OpenAI
4. Teste se há créditos na conta OpenAI

### Raridade sempre COMUM

1. Verifique se está passando os dados corretos em `GameContext`
2. Teste jogando em dificuldade HARD com boa pontuação
3. O sistema é baseado em desempenho real

## 📊 Estatísticas de Raridade Esperadas

Com jogo balanceado:

- **Comum**: ~60% das cartas
- **Rara**: ~30% das cartas
- **Épica**: ~8% das cartas
- **Lendária**: ~2% das cartas

Para maximizar chance de lendária:
- Escolher dificuldade HARD
- Coletar muitas estrelas (20+)
- Fazer pontuação alta (5000+)
- Ter sorte com o 2% de boost aleatório

## 💡 Dicas de Uso

1. **Economize API calls**: Use fallback durante desenvolvimento
2. **Monitore custos**: OpenAI dashboard mostra uso em tempo real
3. **Variação infinita**: Cada carta é única graças aos templates
4. **Preserve memórias antigas**: Sistema mantém compatibilidade

---

**Desenvolvido com ❤️ para Clínica Fábula Odontopediatria**
