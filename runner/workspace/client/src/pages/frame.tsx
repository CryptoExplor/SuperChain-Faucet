import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Wallet, Shield, Coins, ExternalLink, Clock, CheckCircle, Share } from "lucide-react";
import { farcasterSDK, type FarcasterContext } from "@/components/farcaster-sdk";

// FarcasterContext is now imported from farcaster-sdk

interface PassportData {
  score: number;
  address: string;
  passing_score: boolean;
  threshold: string;
}

interface RateLimitData {
  isRateLimited: boolean;
  nextClaimTime: number | null;
  remainingTime: number;
}

interface ClaimResponse {
  success: boolean;
  txHash: string;
  amount: string;
  blockNumber: number;
  gasUsed: string;
}

function formatTimeRemaining(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} days, ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else {
    return "< 1 hour";
  }
}

export default function FarcasterFrame() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [farcasterContext, setFarcasterContext] = useState<FarcasterContext | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Initialize Farcaster SDK
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await farcasterSDK.init();
        const context = await farcasterSDK.getContext();
        setFarcasterContext(context);
        
        // Get wallet address from Farcaster
        const address = await farcasterSDK.getEthereumProvider();
        setWalletAddress(address);
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to Farcaster",
          variant: "destructive",
        });
      }
    };

    initFarcaster();
  }, [toast]);

  // Fetch Gitcoin Passport score
  const { data: passportData, isLoading: passportLoading, error: passportError } = useQuery<PassportData>({
    queryKey: ["/api/passport", walletAddress],
    enabled: !!walletAddress,
    retry: false,
  });

  // Check rate limiting
  const { data: rateLimitData } = useQuery<RateLimitData>({
    queryKey: ["/api/rate-limit", walletAddress],
    enabled: !!walletAddress,
    refetchInterval: 30000,
  });

  // Claim tokens mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!walletAddress || !passportData) {
        throw new Error("Wallet or passport data not available");
      }
      
      const response = await apiRequest("POST", "/api/claim", {
        walletAddress,
        amount: "0.001",
        txHash: "",
        passportScore: passportData.score.toString(),
      });
      
      return response.json() as Promise<ClaimResponse>;
    },
    onSuccess: (data) => {
      setLastTxHash(data.txHash);
      toast({
        title: "Transaction Successful!",
        description: `0.001 ETH sent to your wallet`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rate-limit", walletAddress] });
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "An error occurred while processing your claim",
        variant: "destructive",
      });
    },
  });

  const openTransaction = (hash: string) => {
    farcasterSDK.openUrl(`https://sepolia.basescan.org/tx/${hash}`);
  };

  const shareSuccess = () => {
    const message = `Just claimed 0.001 ETH from the Base Sepolia Faucet! 🚰\n\nBuilt by @CryptoExplor for the Farcaster ecosystem.\n\nTx: ${lastTxHash?.slice(0, 10)}...`;
    farcasterSDK.composeCast(message, [window.location.href]);
  };

  const isEligible = passportData && passportData.score >= 10;
  const canClaim = walletAddress && isEligible && !rateLimitData?.isRateLimited && !claimMutation.isPending;

  if (!farcasterContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Farcaster context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Coins className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">Base Sepolia Faucet</h1>
                <p className="text-sm text-gray-600">Unofficial • Mini App for Farcaster</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <img 
                src={farcasterContext.user.pfpUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <div>
                <p className="font-medium text-gray-900">{farcasterContext.user.displayName}</p>
                <p className="text-sm text-gray-500">@{farcasterContext.user.username}</p>
              </div>
            </div>
            {walletAddress && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
                <p className="font-mono text-sm text-gray-900">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gitcoin Passport Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Shield className="text-emerald-500 mr-2 h-4 w-4" />
              Gitcoin Passport
            </h3>
            
            {passportLoading ? (
              <div className="flex items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-gray-600">Checking score...</span>
              </div>
            ) : passportError ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  No Passport found. Create one at passport.gitcoin.co
                </p>
              </div>
            ) : passportData ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{passportData.score.toFixed(1)}</span>
                    <Badge className={isEligible ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                      {isEligible ? "Eligible" : "Need 10+"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Score: {passportData.score} / 10 required</p>
                </div>
                <CheckCircle className={`h-8 w-8 ${isEligible ? "text-emerald-500" : "text-red-500"}`} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Claim Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Coins className="text-amber-500 mr-2 h-4 w-4" />
              Claim 0.001 ETH
            </h3>

            {!isEligible ? (
              <Button disabled className="w-full bg-gray-300 text-gray-500">
                Need Gitcoin Passport Score ≥ 10
              </Button>
            ) : rateLimitData?.isRateLimited ? (
              <div>
                <Button disabled className="w-full bg-amber-300 text-amber-800">
                  <Clock className="mr-2 h-4 w-4" />
                  Rate Limited
                </Button>
                <p className="text-sm text-amber-600 mt-2 text-center">
                  Next claim in {formatTimeRemaining(rateLimitData.remainingTime)}
                </p>
              </div>
            ) : claimMutation.isPending ? (
              <Button disabled className="w-full bg-blue-500 text-white">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </Button>
            ) : (
              <Button 
                onClick={() => claimMutation.mutate()}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                <Coins className="mr-2 h-4 w-4" />
                Claim Test ETH
              </Button>
            )}

            <p className="text-xs text-gray-500 mt-2 text-center">
              One claim per week • Base Sepolia Testnet
            </p>
          </CardContent>
        </Card>

        {/* Transaction Result */}
        {lastTxHash && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-emerald-600 h-6 w-6" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Success!</h3>
                <p className="text-sm text-gray-600 mb-3">0.001 ETH sent to your wallet</p>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTransaction(lastTxHash)}
                    className="text-blue-500 flex-1"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View Transaction
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareSuccess}
                    className="text-emerald-500 flex-1"
                  >
                    <Share className="mr-1 h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>Unofficial • Built by @CryptoExplor • Base Sepolia Testnet</p>
        </div>
      </div>
    </div>
  );
}