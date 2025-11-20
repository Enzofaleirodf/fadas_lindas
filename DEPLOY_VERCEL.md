# 🚀 Deploy na Vercel - Fadas Lindas

## Pré-requisitos
- Conta na [Vercel](https://vercel.com)
- Repositório GitHub conectado: `https://github.com/Enzofaleirodf/fadas_lindas`
- Chave da API da OpenAI

## Passo a Passo

### 1. Importar Projeto na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em "Import Project"
3. Conecte sua conta do GitHub se ainda não estiver conectada
4. Selecione o repositório: `Enzofaleirodf/fadas_lindas`
5. Clique em "Import"

### 2. Configurar Projeto

Na tela de configuração:

**Framework Preset:**
- Selecione: `Vite`

**Root Directory:**
- Deixe como está (raiz do projeto)

**Build Command:**
- Deixe padrão: `npm run build`

**Output Directory:**
- Deixe padrão: `dist`

### 3. Configurar Variáveis de Ambiente

**IMPORTANTE:** Antes de fazer deploy, adicione as variáveis de ambiente:

1. Na página de configuração do projeto, role até "Environment Variables"
2. Adicione a seguinte variável:

```
Nome: OPENAI_API_KEY
Valor: [SUA_OPENAI_API_KEY_AQUI]
```

**IMPORTANTE:** Use a mesma API key que está no arquivo `.env` local.

3. Marque todas as opções: Production, Preview, Development

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar (1-3 minutos)
3. Quando terminar, clique no link gerado (ex: `fadas-lindas.vercel.app`)

## Configuração Adicional (Opcional)

### Domínio Personalizado

1. No dashboard da Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio customizado
3. Configure o DNS conforme instruções da Vercel

### Proteção de Produção

Para evitar que API keys apareçam no código:

1. Na Vercel, vá em "Settings" > "Environment Variables"
2. Certifique-se que `VITE_OPENAI_API_KEY` está configurada
3. Não commite o arquivo `.env` (já está no .gitignore)

## Verificação Pós-Deploy

Teste as seguintes funcionalidades:

- [ ] Página inicial carrega
- [ ] Seleção de personagem funciona
- [ ] Todos os 3 jogos funcionam
- [ ] Cartas são geradas com OpenAI
- [ ] Sistema de raridade funciona
- [ ] Galeria salva e exibe cartas
- [ ] Layout responsivo em mobile

## Atualizações Futuras

Sempre que fizer alterações no código:

1. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Sua mensagem"
   git push
   ```

2. A Vercel fará deploy automático da branch `main`

## Troubleshooting

### Erro: "Build failed"
- Verifique se `VITE_OPENAI_API_KEY` está configurada
- Certifique-se que o comando `npm run build` funciona localmente

### Cartas não estão sendo geradas
- Verifique se a variável de ambiente `VITE_OPENAI_API_KEY` está configurada corretamente
- Veja os logs no console do navegador
- Certifique-se que a API key da OpenAI é válida

### Layout quebrado
- Limpe o cache do navegador
- Force refresh (Ctrl+Shift+R)
- Verifique se Tailwind CSS foi buildado corretamente

## Custos Estimados

**Vercel:**
- Plano gratuito: suficiente para este projeto
- Limits: 100GB bandwidth/mês

**OpenAI:**
- ~$0.0015 por carta gerada
- 1000 cartas ≈ $1.50

## Suporte

Em caso de problemas:
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Vite](https://vitejs.dev)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

**Deploy realizado em:** 20/11/2025
**Versão:** 1.0.0
**Desenvolvido para:** Clínica Fábula Odontopediatria
