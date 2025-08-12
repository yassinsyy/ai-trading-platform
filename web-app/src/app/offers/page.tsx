'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { usePricingSocket } from '@/hooks/usePricingSocket';
import { WSIndicator } from '@/components/ui/ws-indicator';
import { DeltaBadge } from '@/components/ui/delta-badge';
import { KPIPanel } from '@/components/ui/kpi-panel';
import { Filters, FilterState } from '@/components/ui/filters';
import { OfferSkeleton } from '@/components/ui/offer-skeleton';

interface Offer {
  id: string;
  sku: string;
  title: string;
  marketplace: string;
  currentPrice: number | null;
  recommendedPrice: number | null;
  stock: number | null;
  compMin: number | null;
  compAvg: number | null;
  status: string | null;
  adapterMode?: 'feed' | 'api' | 'sim';
  lastFeedUrl?: string;
  lastFeedStatus?: 'success' | 'error' | 'pending';
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingPrice, setApplyingPrice] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState({
    sumExpectedProfit: 0,
    turnover: 0,
    gmroi: 0,
    lastFeed: new Date().toISOString()
  });
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    marketplace: '',
    status: ''
  });

  // WebSocket подключение
  const { isConnected, connectionStatus, reconnect } = usePricingSocket({
    merchantId: 'demo-merchant',
    onPriceUpdate: (event) => {
      setOffers(prev => 
        prev.map(offer => 
          offer.id === event.offerId 
            ? { ...offer, currentPrice: event.newPrice }
            : offer
        )
      );
    },
  });

  // Загрузка офферов и KPI
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Загрузка офферов
        const offersResponse = await fetch('/api/offers');
        if (!offersResponse.ok) {
          throw new Error('Failed to load offers');
        }
        const offersData: Offer[] = await offersResponse.json();
        setOffers(offersData);
        
        // Вычисление KPI из данных офферов
        const sumExpectedProfit = offersData.reduce((sum, offer) => {
          if (offer.recommendedPrice && offer.currentPrice) {
            return sum + (offer.recommendedPrice - offer.currentPrice) * (offer.stock || 0);
          }
          return sum;
        }, 0);
        
        const turnover = offersData.reduce((sum, offer) => {
          return sum + (offer.currentPrice || 0) * (offer.stock || 0);
        }, 0);
        
        const gmroi = offersData.length > 0 ? (sumExpectedProfit / turnover) * 100 : 0;
        
        setKpiData({
          sumExpectedProfit,
          turnover,
          gmroi,
          lastFeed: new Date().toISOString()
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Фильтрация офферов
  const filterOffers = (offers: Offer[], filters: FilterState) => {
    return offers.filter(offer => {
      const matchesSearch = !filters.search || 
        offer.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
        offer.title.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesMarketplace = !filters.marketplace || 
        offer.marketplace.toLowerCase() === filters.marketplace.toLowerCase();
      
      const matchesStatus = !filters.status || 
        (offer.status && offer.status.toLowerCase() === filters.status.toLowerCase());
      
      return matchesSearch && matchesMarketplace && matchesStatus;
    });
  };

  // Обновление отфильтрованных офферов при изменении данных или фильтров
  useEffect(() => {
    const filtered = filterOffers(offers, filters);
    setFilteredOffers(filtered);
  }, [offers, filters]);

  // Apply pricing
  const applyPricing = async (offerId: string) => {
    try {
      const offer = offers.find(o => o.id === offerId);
      if (!offer || !offer.recommendedPrice) return;
      
      setApplyingPrice(offerId);
      
      // Optimistic update
      setOffers(prev => 
        prev.map(o => 
          o.id === offerId 
            ? { ...o, currentPrice: o.recommendedPrice }
            : o
        )
      );

      const response = await fetch(`/api/offers/pricing/${offerId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPrice: offer.recommendedPrice,
          reason: 'Manual adjustment',
          priority: 3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to apply pricing');
      }

      const result = await response.json();
      console.log('Pricing applied:', result);
      
      // Show success toast (можно заменить на toast библиотеку)
      console.log(`✅ Price updated: ${result.oldPrice} → ${result.newPrice}`);
    } catch (err) {
      console.error('Apply pricing error:', err);
      
      // Rollback optimistic update
      setOffers(prev => 
        prev.map(o => 
          o.id === offerId 
            ? { ...o, currentPrice: o.currentPrice }
            : o
        )
      );
      
      console.error('❌ Failed to apply pricing');
    } finally {
      setApplyingPrice(null);
    }
  };

  // Run rebalance
  const runRebalance = async () => {
    try {
      const response = await fetch('/api/jobs-dev/pricing-rebalance/run', {
        method: 'POST',
        headers: { 'x-dev-key': 'dev' }
      });

      if (!response.ok) {
        throw new Error('Failed to run rebalance');
      }

      const result = await response.json();
      console.log('Rebalance result:', result);
      alert(`Rebalance completed: ${result.res.processed} processed, ${result.res.updated} updated`);
    } catch (err) {
      console.error('Rebalance error:', err);
      alert('Failed to run rebalance');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Offers Management</h1>
            <div className="flex items-center gap-4 mt-2">
              <WSIndicator status={connectionStatus} onReconnect={reconnect} />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6">
          {[...Array(5)].map((_, index) => (
            <OfferSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Offers Management</h1>
          <div className="flex items-center gap-4 mt-2">
            <WSIndicator status={connectionStatus} onReconnect={reconnect} />
            <span className="text-sm text-gray-500">
              {offers.length} offers • Real-time updates {isConnected ? 'enabled' : 'disabled'}
            </span>
          </div>
               </div>
       <Button onClick={runRebalance} className="bg-blue-600 hover:bg-blue-700">
         <TrendingUp className="w-4 h-4 mr-2" />
         Run Rebalance
       </Button>
     </div>

          {/* KPI Panel */}
     <KPIPanel {...kpiData} />

     {/* Filters */}
     <Filters onFiltersChange={setFilters} />

            <div className="grid gap-6">
         {filteredOffers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    {offer.sku}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {offer.title}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {offer.marketplace}
                  </Badge>
                  {offer.adapterMode && (
                    <Badge variant="secondary" className="text-xs">
                      {offer.adapterMode.toUpperCase()}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {offer.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="text-xl font-bold text-green-600">
                    ₸{offer.currentPrice?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recommended</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-blue-600">
                      ₸{offer.recommendedPrice?.toLocaleString() || 'N/A'}
                    </p>
                    {offer.currentPrice && offer.recommendedPrice && (
                      <DeltaBadge
                        currentPrice={offer.currentPrice}
                        recommendedPrice={offer.recommendedPrice}
                        reason="AI recommendation based on market analysis"
                        guardrailsApplied={['min_price', 'max_price']}
                        expectedProfit={offer.recommendedPrice * 0.15}
                        expectedUnits={Math.floor(offer.stock || 0 * 0.8)}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="text-lg font-semibold">
                    {offer.stock || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Competition</p>
                  <p className="text-lg font-semibold">
                    ₸{offer.compMin?.toLocaleString() || 'N/A'} - ₸{offer.compAvg?.toLocaleString() || 'N/A'}
                  </p>
                  {offer.lastFeedUrl && (
                    <p className="text-xs text-blue-600 mt-1">
                      <a href={offer.lastFeedUrl} target="_blank" rel="noopener noreferrer">
                        Last Feed ↗
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => applyPricing(offer.id)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!offer.recommendedPrice || applyingPrice === offer.id || offer.currentPrice === offer.recommendedPrice}
                >
                  {applyingPrice === offer.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Apply Pricing
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

             {filteredOffers.length === 0 && (
         <div className="text-center text-gray-500 mt-8">
           {offers.length === 0 ? 'No offers found' : 'No offers match your filters'}
         </div>
       )}
    </div>
  );
}
