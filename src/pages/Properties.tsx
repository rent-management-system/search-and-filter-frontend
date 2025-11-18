import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AIRecommendationForm } from '@/components/properties/AIRecommendationForm';
import { PropertyCard } from '@/components/PropertyCard';
import { recommendationAPI, propertyAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';

export default function Properties() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ai');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Browse all properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyAPI.search({}),
    enabled: activeTab === 'browse',
  });

  const handleGenerateRecommendations = async (formData: any) => {
    setIsGenerating(true);
    try {
      const result = await recommendationAPI.generate(formData);
      setRecommendations(result.recommendations || []);
    } catch (error) {
      console.error('Recommendation error:', error);
      setRecommendations([]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Home</h1>
          <p className="text-lg text-muted-foreground">
            Get AI-powered recommendations or browse all properties
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t('properties.aiRecommendations')}
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <Search className="h-4 w-4" />
              {t('properties.browseAll')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-8">
            {recommendations.length === 0 ? (
              <div className="bg-card rounded-xl shadow-premium p-8">
                <AIRecommendationForm
                  onSubmit={handleGenerateRecommendations}
                  isLoading={isGenerating}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your Personalized Recommendations</h2>
                  <button
                    onClick={() => setRecommendations([])}
                    className="text-sm text-primary hover:underline"
                  >
                    New Search
                  </button>
                </div>

                {isGenerating ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((property, idx) => (
                      <PropertyCard
                        key={idx}
                        property={property}
                        showAIReason
                        onFeedback={(feedback) => {
                          console.log('Feedback:', feedback, 'for property:', property.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-8">
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
                <p className="text-lg text-muted-foreground">{t('properties.noResults')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
