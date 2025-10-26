# Envio Cloud Deployment Guide

## ✅ Fixed Configuration for Cloud Deployment

### Changes Made:

1. **Updated `config.yaml`**:
   - ✅ Added `rpc_config` with RPC URL (required for cloud)
   - ✅ Added `abi_file_path` for both contracts
   - ✅ Set proper `start_block: 7365000` (your deployment block)
   - ✅ Added descriptive `name` and `description`
   - ✅ Removed unsupported `ecosystem` field

2. **Created ABI Files**:
   - ✅ Created `abis/MovieManager.json` (extracted from blockchain artifacts)
   - ✅ Created `abis/TicketEscrow.json` (extracted from blockchain artifacts)

3. **Updated Dependencies**:
   - ✅ Added all required runtime dependencies to root `package.json`
   - ✅ Fixed ReScript version to 11.1.3 (compatible with Envio 2.31)
   - ✅ Fixed rescript-schema version to 9.3.0

4. **Updated `.gitignore`**:
   - ✅ Removed `*.res.js` from generated folder (needed for deployment)
   - ✅ Removed `artifacts` line to allow `abis/` folder

## 📦 Files to Include in Git

Make sure these are committed:

```bash
git add envio-indexer/config.yaml
git add envio-indexer/abis/MovieManager.json
git add envio-indexer/abis/TicketEscrow.json
git add envio-indexer/schema.graphql
git add envio-indexer/src/EventHandlers.ts
git add envio-indexer/package.json
git add envio-indexer/generated/**/*.res.js
git commit -m "Fix Envio cloud deployment configuration"
git push origin main
```

## 🚀 Deploy to Envio Cloud

### Option 1: Via Envio Dashboard

1. Go to https://envio.dev/app/
2. Click "New Indexer"
3. Connect your GitHub repository: `AZAR2305/eth`
4. Select folder: `envio-indexer`
5. Click "Deploy"

### Option 2: Via CLI

```bash
cd /mnt/c/Users/thame/eth/envio-indexer

# Login to Envio (if not already)
pnpm exec envio login

# Deploy
pnpm exec envio deploy
```

## 🔍 Deployment Checklist

Before deploying, verify:

- [x] `config.yaml` has `rpc_config.url`
- [x] ABI files exist in `abis/` folder
- [x] `start_block` is set to deployment block (7365000)
- [x] Contract addresses are correct:
  - MovieManager: 0x0d9C35FA08D03b1106FceBF0aa097F92C95E8b88
  - TicketEscrow: 0x5BAFcCD137A7318e2dd1b3c696A035940e9c09E2
- [x] All `.res.js` files are not ignored by git
- [x] `schema.graphql` matches your event types

## 📊 After Deployment

Once deployed, you'll get:

- **GraphQL Endpoint**: `https://indexer.envio.dev/[your-id]/v1/graphql`
- **Hasura Console**: `https://indexer.envio.dev/[your-id]/console`

Update your frontend to use the hosted endpoint:

```typescript
// frontend/lib/envio.ts
const ENVIO_URL = 'https://indexer.envio.dev/your-id/v1/graphql';
```

## 🐛 If Deployment Still Fails

### "Failed to apply schema" - Common Causes:

1. **Line Ending Issues**:
   ```bash
   # Convert CRLF to LF
   cd /mnt/c/Users/thame/eth/envio-indexer
   cat schema.graphql | tr -d '\r' > schema.graphql.tmp
   mv schema.graphql.tmp schema.graphql
   ```

2. **RPC URL Issues**:
   - ❌ Don't use: `https://eth-sepolia.g.alchemy.com/v2/demo`
   - ✅ Use public RPC: `https://ethereum-sepolia-rpc.publicnode.com`
   - ✅ Or get your own Alchemy/Infura key

3. **Config Validation**:
   ```bash
   # Test locally first
   pnpm exec envio codegen
   
   # Should finish without errors
   ```

4. **Schema Validation**:
   - No trailing whitespace
   - No empty lines at end
   - All types must match event names exactly
   - Example: `MovieManager_MovieAdded` (contract_event format)

5. **ABI Files**:
   ```bash
   # Verify ABIs exist and are valid JSON
   ls -lh abis/
   cat abis/MovieManager.json | jq . > /dev/null && echo "Valid JSON"
   ```

6. **Remove Optional Features** (if still failing):
   ```yaml
   # In config.yaml, remove these lines:
   # unordered_multichain_mode: true
   # preload_handlers: true
   
   # Keep minimal config:
   field_selection:
     transaction_fields:
       - "hash"
   ```

### Step-by-Step Debug Process:

**Step 1**: Validate config locally
```bash
cd /mnt/c/Users/thame/eth/envio-indexer
pnpm exec envio codegen
```

**Step 2**: Check file integrity
```bash
# Schema should have exactly 42 lines, no CRLF
wc -l schema.graphql
file schema.graphql  # Should say "ASCII text"

# ABIs should be valid JSON
jq . abis/MovieManager.json > /dev/null
jq . abis/TicketEscrow.json > /dev/null
```

**Step 3**: Verify Git files
```bash
# Make sure all files are committed
git status

# Should show:
# abis/MovieManager.json
# abis/TicketEscrow.json
# config.yaml
# schema.graphql
```

**Step 4**: Clean deployment
```bash
# Remove any cache
rm -rf generated/lib
rm -rf .envio

# Regenerate
pnpm exec envio codegen

# Commit and push
git add .
git commit -m "Clean Envio deployment"
git push
```

**Step 5**: Check Envio dashboard logs
- Go to https://envio.dev/app/
- Click on your indexer
- Check "Logs" tab for detailed error messages

### Alternative: Use Envio CLI Deployment

Instead of GitHub deployment, try CLI:

```bash
cd /mnt/c/Users/thame/eth/envio-indexer

# Login (if not already)
export ENVIO_API_TOKEN="ac3f7148-2a59-4bc1-866f-936d1e9a2b98"
pnpm exec envio login

# Deploy directly
pnpm exec envio deploy

# Follow prompts
```

### Contact Envio Support

If still failing after all fixes:
1. Join Envio Discord: https://discord.gg/envio
2. Share error logs from dashboard
3. Mention you're using:
   - Envio v2.31.0
   - ReScript 11.1.3
   - Sepolia testnet
   - 2 contracts (MovieManager, TicketEscrow)

## 💡 Pro Tips

- Use environment variable for RPC URL in production
- Set `start_block` to your earliest contract deployment block
- Monitor indexer logs in Envio dashboard
- Test queries in Hasura console before using in frontend

---

**Your indexer is now configured for Envio Cloud deployment! 🎉**
