import type { Express } from "express";

// Farcaster Mini App specific routes
export function registerFrameRoutes(app: Express) {
  // Serve the manifest file for Farcaster Mini App discovery
  app.get("/.well-known/farcaster.json", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const manifest = {
      accountAssociation: {
        // Note: For production, these need to be generated via Farcaster developer tools
        token: "",
        signature: ""
      },
      miniapp: {
        version: "vNext",
        name: "Base Sepolia Faucet (Unofficial)",
        iconUrl: `${baseUrl}/icon.svg`,
        splashImageUrl: `${baseUrl}/splash.svg`,
        homeUrl: `${baseUrl}/frame`,
        webhookUrl: null,
        description: "Unofficial faucet for Base Sepolia testnet. Claim test ETH with Gitcoin Passport verification. Built by @CryptoExplor for the Farcaster ecosystem.",
        theme: {
          backgroundColor: "#f8fafc"
        }
      }
    };
    
    res.json(manifest);
  });

  // Frame embed meta tags endpoint
  app.get("/frame", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base Sepolia Faucet - Farcaster Mini App</title>
    
    <!-- Farcaster Mini App Meta Tags -->
    <meta property="fc:miniapp" content='{
      "version": "1",
      "imageUrl": "${baseUrl}/frame-image.svg",
      "button": {
        "title": "🚰 Claim Test ETH (Unofficial)",
        "action": {
          "type": "launch_frame",
          "name": "Base Sepolia Faucet (Unofficial)",
          "url": "${baseUrl}/frame",
          "splashImageUrl": "${baseUrl}/splash.svg",
          "splashBackgroundColor": "#f8fafc"
        }
      }
    }' />
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="Unofficial faucet for Base Sepolia testnet. Claim test ETH with Gitcoin Passport verification.">
    <meta property="og:title" content="Base Sepolia Faucet (Unofficial)">
    <meta property="og:description" content="Unofficial faucet for Base Sepolia development. Get test ETH with Gitcoin Passport score ≥ 10.">
    <meta property="og:image" content="${baseUrl}/frame-image.svg">
    <meta property="og:url" content="${baseUrl}/frame">
    <meta name="twitter:card" content="summary_large_image">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
        }
        .icon {
            width: 64px;
            height: 64px;
            background: #3b82f6;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 24px;
        }
        h1 {
            color: #1f2937;
            margin: 0 0 8px;
            font-size: 24px;
            font-weight: 600;
        }
        .subtitle {
            color: #6b7280;
            margin: 0 0 24px;
            font-size: 16px;
        }
        .features {
            text-align: left;
            margin: 24px 0;
        }
        .feature {
            display: flex;
            align-items: center;
            margin: 12px 0;
            color: #374151;
        }
        .feature-icon {
            width: 20px;
            height: 20px;
            background: #10b981;
            border-radius: 4px;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
        }
        .button {
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            margin-top: 24px;
        }
        .footer {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🚰</div>
        <h1>Base Sepolia Faucet</h1>
        <p class="subtitle">Unofficial • Get test ETH for blockchain development</p>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>0.001 ETH per claim</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>Gitcoin Passport verified</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>7-day rate limiting</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>Base Sepolia testnet</span>
            </div>
        </div>
        
        <button class="button" onclick="window.location.href='${baseUrl}'">
            Open Web App
        </button>
        
        <div class="footer">
            Built by @CryptoExplor<br>
            <small>Works in Farcaster as a Mini App</small>
        </div>
    </div>
</body>
</html>`;
    
    res.send(html);
  });

  // Serve custom SVG assets with proper headers
  app.get("/frame-image.svg", (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile('frame-image.svg', { root: 'client/public' });
  });

  app.get("/splash.svg", (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile('splash.svg', { root: 'client/public' });
  });

  app.get("/icon.svg", (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile('icon.svg', { root: 'client/public' });
  });
}