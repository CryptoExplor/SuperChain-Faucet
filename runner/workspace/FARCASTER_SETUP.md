# Farcaster Mini App Setup Guide

## Current Status
✅ Mini App code implemented and working  
✅ Manifest endpoint at `/.well-known/farcaster.json`  
✅ Frame page with embedded meta tags  
✅ Social sharing functionality  
⚠️ Account association tokens needed for production  

## To Publish as Official Farcaster Mini App

### 1. Enable Developer Mode
- Go to https://farcaster.xyz/~/settings/developer-tools
- Enable developer mode on mobile or desktop

### 2. Generate Account Association
You'll need to generate these tokens for the manifest:
```json
{
  "accountAssociation": {
    "token": "your_token_here",
    "signature": "your_signature_here"
  }
}
```

### 3. Update Manifest URLs
The manifest automatically uses your deployment domain, but verify:
- `iconUrl`: Should point to a 64x64 PNG icon
- `splashImageUrl`: Should point to a 400x400 PNG splash screen
- `homeUrl`: Points to `/frame` endpoint

### 4. Test Your Mini App
- Use Farcaster's developer tools to preview
- Test the manifest at: `https://your-domain/.well-known/farcaster.json`
- Verify frame embeds work in Farcaster clients

## Current Endpoints

### Manifest
- **URL**: `/.well-known/farcaster.json`
- **Purpose**: Mini App discovery and configuration

### Frame Page
- **URL**: `/frame`
- **Purpose**: Main Mini App interface with embedded meta tags

### Assets
- **Icon**: `/icon.png` (currently placeholder)
- **Splash**: `/splash.png` (currently placeholder)
- **Frame Image**: `/frame-image.png` (for social embeds)

## Development vs Production

### Development (Current)
- Uses simulated Farcaster SDK
- Placeholder images
- No account association tokens

### Production (To Deploy)
- Real `@farcaster/miniapp-sdk`
- Custom icon/splash images
- Valid account association tokens
- Domain verification

## Next Steps
1. Deploy to get stable URL
2. Create custom icon and splash images
3. Generate account association tokens
4. Test in Farcaster developer tools
5. Submit for review (if needed)

Built by @CryptoExplor • 2025