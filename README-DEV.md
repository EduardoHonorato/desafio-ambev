# Modo Desenvolvimento com Hot Reload

## Para usar Hot Reload:

### 1. Parar containers atuais (se estiverem rodando):
```bash
docker compose down
```

### 2. Iniciar em modo desenvolvimento:
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### 3. Acessar a aplicação:
- Frontend: http://localhost:3005 (com hot reload ativo)
- API: http://localhost:3006/api
- MySQL: localhost:3007

## Como funciona:

- **Modo Dev**: Usa `Dockerfile.dev` que roda `npm run dev` ao invés de fazer build
- **Hot Reload**: Qualquer mudança em arquivos do frontend será refletida automaticamente no navegador
- **Volumes**: O código fonte é mapeado via volumes, então mudanças são detectadas em tempo real

## Para voltar ao modo produção:

```bash
docker compose -f docker-compose.dev.yml down
docker compose up -d --build
```

## Observações:

- No modo dev, o frontend roda na porta 5173 internamente (Vite dev server)
- A porta 3005 mapeia para 5173 no container
- Mudanças em arquivos `.tsx`, `.ts`, `.css` são detectadas automaticamente
- Não é necessário fazer rebuild após mudanças de código