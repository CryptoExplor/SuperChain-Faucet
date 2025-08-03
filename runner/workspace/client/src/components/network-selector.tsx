import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Network } from "@shared/schema";

interface NetworkSelectorProps {
  selectedNetwork?: Network | null;
  onNetworkSelect: (network: Network) => void;
  className?: string;
}

export function NetworkSelector({ selectedNetwork, onNetworkSelect, className }: NetworkSelectorProps) {
  const { data: networks, isLoading } = useQuery<Network[]>({
    queryKey: ["/api/networks"],
  });

  const handleNetworkChange = (networkId: string) => {
    const network = networks?.find(n => n.id === networkId);
    if (network) {
      onNetworkSelect(network);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!networks || networks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">No networks available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Network
        </label>
        <Select value={selectedNetwork?.id || ""} onValueChange={handleNetworkChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a blockchain network" />
          </SelectTrigger>
          <SelectContent>
            {networks.map((network) => (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center space-x-3">
                  <img 
                    src={network.iconUrl || '/networks/base.svg'} 
                    alt={network.name}
                    className="w-5 h-5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/networks/base.svg';
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{network.name}</span>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{network.faucetAmount} {network.nativeCurrency}</span>
                      <Badge variant="secondary" className="px-1 py-0 text-xs">
                        Chain {network.chainId}
                      </Badge>
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedNetwork && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img 
                src={selectedNetwork.iconUrl || '/networks/base.svg'} 
                alt={selectedNetwork.name}
                className="w-6 h-6"
              />
              <div>
                <p className="font-medium text-blue-900">{selectedNetwork.name}</p>
                <p className="text-sm text-blue-700">
                  Claim {selectedNetwork.faucetAmount} {selectedNetwork.nativeCurrency} per request
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}