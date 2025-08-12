'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Offer {
  id: string;
  sku: string;
  title: string;
  currentPrice: number;
  recommendedPrice: number;
  stock: number;
  competition: {
    min: number;
    avg: number;
    max: number;
  };
  lastUpdate: string;
  daysToOOS?: number;
}

interface OffersTableProps {
  merchantId: string;
}

export function OffersTable({ merchantId }: OffersTableProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingPrice, setApplyingPrice] = useState<string | null>(null);

  // Моковые данные для демонстрации
  useEffect(() => {
    const mockOffers: Offer[] = [
      {
        id: '1',
        sku: 'SKU-001',
        title: 'iPhone 15 Pro 128GB',
        currentPrice: 999.99,
        recommendedPrice: 1049.99,
        stock: 25,
        competition: { min: 999.99, avg: 1049.99, max: 1099.99 },
        lastUpdate: new Date().toISOString(),
        daysToOOS: 8
      },
      {
        id: '2',
        sku: 'SKU-002',
        title: 'Samsung Galaxy S24',
        currentPrice: 899.99,
        recommendedPrice: 879.99,
        stock: 15,
        competition: { min: 849.99, avg: 879.99, max: 929.99 },
        lastUpdate: new Date().toISOString(),
        daysToOOS: 3
      },
      {
        id: '3',
        sku: 'SKU-003',
        title: 'MacBook Air M2',
        currentPrice: 1199.99,
        recommendedPrice: 1249.99,
        stock: 8,
        competition: { min: 1199.99, avg: 1249.99, max: 1299.99 },
        lastUpdate: new Date().toISOString(),
        daysToOOS: 12
      }
    ];

    setOffers(mockOffers);
    setLoading(false);
  }, []);

  const handleApplyPrice = async (offerId: string, recommendedPrice: number) => {
    setApplyingPrice(offerId);
    
    try {
      // TODO: Реальный API вызов
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Обновляем локальное состояние
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, currentPrice: recommendedPrice, lastUpdate: new Date().toISOString() }
          : offer
      ));
      
      // TODO: WebSocket событие для обновления в реальном времени
    } catch (error) {
      console.error('Failed to apply price:', error);
    } finally {
      setApplyingPrice(null);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Offers</h2>
        <div className="text-sm text-gray-500">
          Merchant: {merchantId}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recommended
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days to OOS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {offer.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {offer.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(offer.currentPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-medium ${
                    offer.recommendedPrice > offer.currentPrice ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPrice(offer.recommendedPrice)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {offer.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    offer.daysToOOS && offer.daysToOOS < 5 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {offer.daysToOOS || 'N/A'} days
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="text-xs">
                    <div>Min: {formatPrice(offer.competition.min)}</div>
                    <div>Avg: {formatPrice(offer.competition.avg)}</div>
                    <div>Max: {formatPrice(offer.competition.max)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(offer.lastUpdate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Button
                    onClick={() => handleApplyPrice(offer.id, offer.recommendedPrice)}
                    disabled={applyingPrice === offer.id}
                    variant="outline"
                    size="sm"
                  >
                    {applyingPrice === offer.id ? 'Applying...' : 'Apply Price'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
