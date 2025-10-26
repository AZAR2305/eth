# Fix Envio 2.31 Deployment Issues

## Problem
- ReScript version mismatch
- `rescript-schema` wrong version
- Missing compiled `.res.js` files

## Solution Steps

### Step 1: Clean Everything
```bash
cd /mnt/c/Users/thame/eth/envio-indexer

# Remove node_modules and lock files
rm -rf node_modules generated/node_modules
rm -f pnpm-lock.yaml generated/pnpm-lock.yaml

# Remove compiled files
rm -rf generated/lib
rm -rf lib
```

### Step 2: Install Correct Dependencies
```bash
# Install with exact versions for Envio 2.31
pnpm install

# Verify versions
pnpm list rescript rescript-schema rescript-envsafe
```

**Expected Output:**
```
rescript 11.1.3
rescript-schema 9.3.0
rescript-envsafe 5.0.0
```

### Step 3: Setup Generated Folder
```bash
# Install dependencies in generated folder
cd generated
pnpm install

# Build ReScript files
pnpm exec rescript clean
pnpm exec rescript build

# Go back to root
cd ..
```

### Step 4: Generate Code (Optional)
```bash
# If you need to regenerate code from config.yaml
envio codegen
```

### Step 5: Start PostgreSQL and Hasura
```bash
# Start Docker services (PostgreSQL + Hasura)
docker-compose -f docker-compose-simple.yml up -d

# Wait for services to be ready (30 seconds)
sleep 30

# Verify services are running
docker ps | grep envio
```

**Expected output:**
```
envio-postgres    postgres:14        Up (healthy)
envio-hasura      hasura/graphql...  Up (healthy)
```

### Step 6: Start Envio Indexer
```bash
# Set API token (if needed)
export ENVIO_API_TOKEN="your-api-token-here"

# Start the indexer
envio dev
```

**Or use the automated script:**
```bash
chmod +x start-envio.sh
./start-envio.sh
```

## Alternative: Manual ReScript Build

If `envio codegen` still fails, manually build the generated code:

```bash
# Go to generated folder
cd generated

# Install dependencies
pnpm install

# Build ReScript files
pnpm exec rescript clean
pnpm exec rescript build

# Go back to root
cd ..

# Try envio dev again
envio dev
```

## Verification

After successful build, you should see:
```
generated/
├── lib/
│   └── bs/
│       └── src/
│           └── db/
│               ├── Migrations.res.js  ✅
│               ├── Db.res.js         ✅
│               └── ...
└── src/
    └── db/
        ├── Migrations.res
        └── ...
```

## Common Issues

### Issue 1: "Cannot find module './src/db/Migrations.res.js'"
**Solution**: ReScript didn't compile. Run:
```bash
cd generated
pnpm exec rescript build
cd ..
```

### Issue 2: "rescript-schema version mismatch"
**Solution**: Make sure you have `rescript-schema@9.3.0` (NOT `9.3.0-rescript12.0`):
```bash
pnpm remove rescript-schema
pnpm add -D rescript-schema@9.3.0
```

### Issue 3: "Syntax error in S_Core.res"
**Solution**: This means wrong rescript-schema version. Should be 9.3.0 for ReScript 11.x

### Issue 4: Envio keeps reinstalling wrong versions
**Solution**: 
1. Delete `pnpm-lock.yaml`
2. Make sure `package.json` has correct versions
3. Run `pnpm install` fresh

## Package.json Correct Versions

```json
{
  "devDependencies": {
    "rescript": "11.1.3",
    "rescript-envsafe": "5.0.0",
    "rescript-schema": "9.3.0"
  },
  "dependencies": {
    "envio": "2.31.0"
  }
}
```

## Final Check

```bash
# Check if indexer is running
curl http://localhost:8080/health

# Check GraphQL endpoint
curl http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'
```

## If Everything Fails

Complete reset:
```bash
# Stop any running envio processes
pkill -f envio

# Remove everything
rm -rf node_modules generated/node_modules generated/lib lib
rm -f pnpm-lock.yaml generated/pnpm-lock.yaml

# Fresh install
pnpm install

# Regenerate
envio codegen

# Start
envio dev
```
