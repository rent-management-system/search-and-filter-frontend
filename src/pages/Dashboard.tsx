import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { recommendationAPI, propertyAPI, HAS_PROPERTY_SEARCH } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { Search, History, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('browse');

  // Browse all properties (tenant view)
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['dashboard-properties'],
    queryFn: () => propertyAPI.search({}),
    enabled: HAS_PROPERTY_SEARCH,
  });

  // My recommendations
  const { data: recommendationsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['dashboard-my-recommendations'],
    queryFn: recommendationAPI.getMine,
  });

  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('dashboard') || 'Dashboard'}</h1>
        <p className="text-muted-foreground">
          {t('dashboard_subtitle') || 'Browse properties, view your AI recommendations, and continue where you left off.'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className={`grid w-full max-w-md ${HAS_PROPERTY_SEARCH ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {HAS_PROPERTY_SEARCH && (
            <TabsTrigger value="browse" className="gap-2">
              <Search className="h-4 w-4" />
              {t('properties.browseAll') || 'Browse All'}
            </TabsTrigger>
          )}
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            {t('dashboard.recommendationHistory') || 'My Recommendations'}
          </TabsTrigger>
        </TabsList>

        {HAS_PROPERTY_SEARCH && (
          <TabsContent value="browse">
            {propertiesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : properties?.results?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.results.map((property: any, idx: number) => (
                  <PropertyCard key={idx} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">{t('properties.noResults') || 'No properties available yet.'}</p>
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="history">
          {historyLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : recommendationsHistory?.length > 0 ? (
            <div className="space-y-3">
              {recommendationsHistory.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{t('recommendation')} #{rec.tenant_preference_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-primary text-sm">
                    <Sparkles className="h-4 w-4" />
                    {t('view') || 'View'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">{t('dashboard.noData') || 'No recommendations yet.'}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
