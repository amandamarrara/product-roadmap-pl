# Deploy no Google Cloud Run

## Pré-requisitos

1. **Google Cloud CLI instalado**:
```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

2. **Docker instalado**

3. **Projeto configurado no Google Cloud Console**

## Comandos de Deploy

### 1. Configurar projeto Google Cloud
```bash
# Definir variáveis
export PROJECT_ID="seu-project-id"
export REGION="us-central1"
export SERVICE_NAME="roadmap-app"

# Configurar projeto
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Build e Push da imagem
```bash
# Build da imagem usando o Dockerfile otimizado para Cloud Run
docker build -f Dockerfile.cloudrun -t $SERVICE_NAME .

# Tag para Google Container Registry
docker tag $SERVICE_NAME gcr.io/$PROJECT_ID/$SERVICE_NAME

# Configurar autenticação do Docker
gcloud auth configure-docker

# Push para GCR
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME
```

### 3. Deploy no Cloud Run
```bash
# Deploy básico
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars VITE_SUPABASE_URL="https://onyscnytemwkjeeevtvh.supabase.co" \
  --set-env-vars VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXNjbnl0ZW13a2plZWV2dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTIyNDgsImV4cCI6MjA3MzEyODI0OH0.cuQgo5gpW8LMa_Shj_iisc-OuHowHfwX01UCITSVBa4" \
  --set-env-vars VITE_SUPABASE_PROJECT_ID="onyscnytemwkjeeevtvh"
```

### 4. Deploy com domínio customizado (opcional)
```bash
# Mapear domínio customizado
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain seu-dominio.com \
  --region $REGION
```

## Scripts Automatizados

### Script de build e deploy completo
```bash
#!/bin/bash

# Configurações
PROJECT_ID="seu-project-id"
REGION="us-central1"
SERVICE_NAME="roadmap-app"

echo "🚀 Iniciando deploy para Cloud Run..."

# Build da imagem
echo "📦 Building Docker image..."
docker build -f Dockerfile.cloudrun -t $SERVICE_NAME .

# Tag e push
echo "📤 Pushing to Container Registry..."
docker tag $SERVICE_NAME gcr.io/$PROJECT_ID/$SERVICE_NAME
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars VITE_SUPABASE_URL="https://onyscnytemwkjeeevtvh.supabase.co" \
  --set-env-vars VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXNjbnl0ZW13a2plZWV2dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTIyNDgsImV4cCI6MjA3MzEyODI0OH0.cuQgo5gpW8LMa_Shj_iisc-OuHowHfwX01UCITSVBa4" \
  --set-env-vars VITE_SUPABASE_PROJECT_ID="onyscnytemwkjeeevtvh"

echo "✅ Deploy concluído com sucesso!"

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
echo "🔗 Aplicação disponível em: $SERVICE_URL"
```

## Monitoramento e Logs

### Ver logs
```bash
# Logs em tempo real
gcloud run services logs tail $SERVICE_NAME --region $REGION

# Logs históricos
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100
```

### Métricas
```bash
# Informações do serviço
gcloud run services describe $SERVICE_NAME --region $REGION

# Revisar configurações
gcloud run revisions list --service $SERVICE_NAME --region $REGION
```

## Configurações Avançadas

### Variáveis de ambiente via arquivo
```bash
# Criar arquivo de variáveis
cat > env.yaml << EOF
VITE_SUPABASE_URL: "https://onyscnytemwkjeeevtvh.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXNjbnl0ZW13a2plZWV2dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTIyNDgsImV4cCI6MjA3MzEyODI0OH0.cuQgo5gpW8LMa_Shj_iisc-OuHowHfwX01UCITSVBa4"
VITE_SUPABASE_PROJECT_ID: "onyscnytemwkjeeevtvh"
EOF

# Deploy com arquivo de variáveis
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --env-vars-file env.yaml \
  --region $REGION
```

## Características da Configuração

### ✅ Otimizações implementadas:
- **Porta dinâmica**: Usa `$PORT` do Cloud Run
- **Multi-stage build**: Imagem otimizada de ~15MB
- **Runtime env vars**: Configuração flexível
- **Nginx otimizado**: Gzip, cache, headers de segurança
- **Health checks**: `/health` e `/ready` endpoints
- **SPA routing**: Suporte completo ao React Router
- **Performance**: Assets com cache de 1 ano
- **Segurança**: Headers CSP e HTTPS

### 💡 Benefícios:
- Startup rápido (~2 segundos)
- Auto-scaling (0 a 10 instâncias)
- HTTPS automático
- CDN global do Google
- Logs estruturados
- Monitoramento integrado