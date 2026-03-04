# VDAO MVP — Setup en NUC

Levanta el proyecto VDAO MVP completo en esta máquina para testing local.

## Requisitos previos
- Node.js 18+ (`node -v`)
- pnpm (`npm i -g pnpm` si no lo tienes)
- PostgreSQL (`psql --version`)

Si falta PostgreSQL:
```bash
# Mac
brew install postgresql@17 && brew services start postgresql@17

# Linux (Debian/Ubuntu)
sudo apt install -y postgresql && sudo systemctl start postgresql
```

## Paso 1 — Clonar e instalar

```bash
cd ~
git clone https://github.com/ClauBot/vdao-mvp.git
cd vdao-mvp
pnpm install
```

## Paso 2 — Crear base de datos

```bash
# En Mac, el superuser es tu usuario del sistema:
psql postgres -c "CREATE DATABASE vdao_mvp;"
psql postgres -c "CREATE USER vdao WITH PASSWORD 'vdao2026';"
psql postgres -c "ALTER DATABASE vdao_mvp OWNER TO vdao;"
psql postgres -d vdao_mvp -c "GRANT ALL ON SCHEMA public TO vdao;"

# Si estás en Linux y el superuser es 'postgres':
# sudo -u postgres psql -c "CREATE DATABASE vdao_mvp;"
# sudo -u postgres psql -c "CREATE USER vdao WITH PASSWORD 'vdao2026';"
# sudo -u postgres psql -c "ALTER DATABASE vdao_mvp OWNER TO vdao;"
# sudo -u postgres psql -d vdao_mvp -c "GRANT ALL ON SCHEMA public TO vdao;"

# Ejecutar schema (7 tablas)
PGPASSWORD=vdao2026 psql -h localhost -U vdao -d vdao_mvp -f database-schema.sql
```

Deberías ver: CREATE TABLE (x7), CREATE INDEX (x16), CREATE POLICY (x7), CREATE FUNCTION (x3).
Los errores de `schema "auth" does not exist` son normales (son de Supabase, ignorar).

## Paso 3 — Seedear rubros

```bash
node -e "
const{Pool}=require('pg');
const rubros=require('./src/config/rubros-seed.json');
const pool=new Pool({connectionString:'postgresql://vdao:vdao2026@localhost:5432/vdao_mvp'});
(async()=>{
  const c=await pool.connect();
  await c.query('BEGIN');
  for(const r of rubros){
    await c.query('INSERT INTO rubros(id,nombre,nombre_en,descripcion,activo) VALUES(\$1,\$2,\$3,\$4,\$5) ON CONFLICT DO NOTHING',[r.id,r.nombre,r.nombre_en,r.descripcion,r.activo!==false]);
    if(r.padres) for(const p of r.padres) await c.query('INSERT INTO rubro_padres(rubro_id,padre_id) VALUES(\$1,\$2) ON CONFLICT DO NOTHING',[r.id,p]);
  }
  await c.query(\"INSERT INTO usuarios(wallet,nombre_display,nivel) VALUES('0xfD9ED4278C8132C768340ACbFef69B19C9D04480','mexi',2) ON CONFLICT DO NOTHING\");
  await c.query('COMMIT');
  c.release();
  const rc=(await pool.query('SELECT count(*) FROM rubros')).rows[0].count;
  const pc=(await pool.query('SELECT count(*) FROM rubro_padres')).rows[0].count;
  await pool.end();
  console.log('Rubros:',rc,'| Relaciones padre:',pc);
})();
"
```

Resultado esperado: `Rubros: 140 | Relaciones padre: 160`

## Paso 4 — Variables de entorno

```bash
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://vdao:vdao2026@localhost:5432/vdao_mvp

NEXT_PUBLIC_EAS_CONTRACT=0xC2679fBD37d54388Ce493F1DB75320D236e1815e
NEXT_PUBLIC_SCHEMA_EVALUATION_UID=0xc6fb97ee8ff47e6e81db00330937bcfcc1add401a9eca8c3b45149aa2a8c09c5
NEXT_PUBLIC_SCHEMA_PROXIMITY_UID=0xd363eb1054af738797280d7a7c954d2c10d0cbf67ed0f676126971e28cbc30df
NEXT_PUBLIC_SCHEMA_VALIDATION_UID=0x2b5d3d86ad720516a52401bc5000a1cf92f080bde9df0820ebecc7077cb3e8be
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=placeholder

NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
EOF
```

## Paso 5 — Correr

```bash
npx next dev -p 3456 -H 0.0.0.0
```

Abrir en el navegador: `http://localhost:3456`

Si quieres acceder desde otra máquina en la red: `http://<IP-DE-ESTA-MAQUINA>:3456`

## Verificar que funciona

### 1. Landing page
- Abre `http://localhost:3456` — debería cargar la página principal con info de VDAO

### 2. API de rubros
```bash
curl http://localhost:3456/api/rubros | head -100
```
Debería devolver JSON con 140 rubros.

### 3. CoRu Visualizer
- Abre `http://localhost:3456/coru` — tabla de rubros con categorías

### 4. Wallet Explorer
- Abre `http://localhost:3456/explorer` — conectar wallet con MetaMask (Sepolia testnet)

## Qué probar

1. **Landing** (`/`) — ¿Carga? ¿Se ve bien? ¿El texto dice Sepolia (no Arbitrum)?
2. **CoRu** (`/coru`) — ¿Aparecen los 140 rubros? ¿Se pueden expandir categorías? ¿Funciona la búsqueda?
3. **Explorer** (`/explorer`) — ¿Se puede conectar MetaMask? ¿Buscar una wallet?
4. **API** — `curl localhost:3456/api/rubros` devuelve rubros, `curl localhost:3456/api/usuarios` devuelve el usuario test
5. **Mobile** — Abrir desde el teléfono en la misma red, ¿se ve bien?

## Troubleshooting

**PostgreSQL no arranca:**
```bash
# Mac
brew services restart postgresql@17

# Linux
sudo systemctl restart postgresql
```

**Error "pg_hba.conf" o "peer authentication failed":**
Edita `pg_hba.conf` y cambia `peer` a `md5` para conexiones locales, luego reinicia PostgreSQL.

**Puerto ocupado:**
```bash
lsof -i :3456  # ver qué lo usa
# Usa otro puerto:
npx next dev -p 3000 -H 0.0.0.0
```

**Build en vez de dev (usa menos RAM):**
```bash
npx next build
DATABASE_URL=postgresql://vdao:vdao2026@localhost:5432/vdao_mvp npx next start -p 3456 -H 0.0.0.0
```
