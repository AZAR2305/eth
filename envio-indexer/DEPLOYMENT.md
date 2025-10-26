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

Check these common issues:

1. **"Failed to apply schema"**:
   - Verify `schema.graphql` syntax (no trailing spaces)
   - Ensure all event types match config.yaml

2. **"Contract not found"**:
   - Check contract addresses are deployed on Sepolia
   - Verify `start_block` is at or after deployment block

3. **"RPC error"**:
   - Use a reliable RPC URL (Alchemy, Infura, or public Sepolia RPC)
   - Update `rpc_config.url` in config.yaml

4. **"ABI parsing error"**:
   - Verify ABI files are valid JSON
   - Check event signatures match exactly

## 💡 Pro Tips

- Use environment variable for RPC URL in production
- Set `start_block` to your earliest contract deployment block
- Monitor indexer logs in Envio dashboard
- Test queries in Hasura console before using in frontend

---

**Your indexer is now configured for Envio Cloud deployment! 🎉**
