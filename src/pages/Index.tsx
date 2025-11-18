import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AIRecommendationForm } from '@/components/properties/AIRecommendationForm';
import { PropertyCard } from '@/components/PropertyCard';
import { recommendationAPI, propertyAPI, HAS_PROPERTY_SEARCH } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Search, History, BookmarkCheck, Mail, Phone, MapPin } from 'lucide-react';
import FrontPage from '@/components/FrontPage';

const Index = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('ai');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [tenantPrefId, setTenantPrefId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Browse all properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyAPI.search({}),
    enabled: HAS_PROPERTY_SEARCH,
  });

  // Recommendations history
  const { data: recommendationsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['my-recommendations'],
    queryFn: recommendationAPI.getMine,
    enabled: isAuthenticated,
  });

  const handleGenerateRecommendations = async (formData: any) => {
    setIsGenerating(true);
    try {
      // Map UI form fields to API schema
      const payload = {
        job_school_location: formData.job_location,
        salary: Number(formData.salary),
        house_type: formData.house_type,
        family_size: Number(formData.family_size),
        preferred_amenities: formData.amenities || [],
        language: formData.language === 'om' ? 'or' : formData.language,
      };
      const result = await recommendationAPI.generate(payload);
      setTenantPrefId(result.tenant_preference_id ?? null);
      // Adapt API response to PropertyCard expected shape
      const adapted = (result.recommendations || []).map((r: any) => ({
        id: r.property_id,
        title: r.title,
        location: r.location,
        price: r.price,
        transport_cost: r.transport_cost,
        affordability_score: r.affordability_score,
        ai_reason: r.reason,
        preview_url: r.map_url,
        image_url: r.images?.[0],
        amenities: r.details?.amenities || [],
        house_type: r.details?.house_type,
        distance: r.route?.distance_km,
      }));
      setRecommendations(adapted);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Recommendation error:', error);
      setRecommendations([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section replaced with FrontPage */}
      <section id="home" className="relative scroll-mt-24">
        <div className="container mx-auto px-4 py-8">
          <FrontPage />
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div>
              <p className="text-3xl font-bold text-primary">1000+</p>
              <p className="text-sm text-muted-foreground">Properties</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Happy Tenants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">95%</p>
              <p className="text-sm text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Why Choose RentAI? */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RentAI?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Experience the future of rental property management with AI-powered recommendations</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card p-6 rounded-xl shadow-premium hover-lift"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-muted-foreground">Our advanced AI analyzes your preferences and finds the perfect properties for you</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card p-6 rounded-xl shadow-premium hover-lift"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Location Intelligence</h3>
              <p className="text-muted-foreground">Find properties based on proximity to work, transport costs, and local amenities</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card p-6 rounded-xl shadow-premium hover-lift"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Optimization</h3>
              <p className="text-muted-foreground">Get recommendations that fit your budget with detailed affordability analysis</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="properties" className="py-20 scroll-mt-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-4xl font-bold mb-2">Find Your Perfect Home</h2>
            <p className="text-lg text-muted-foreground">
              Get AI-powered recommendations or browse all properties
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className={`grid w-full max-w-md mx-auto ${HAS_PROPERTY_SEARCH ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t('properties.aiRecommendations')}
              </TabsTrigger>
              {HAS_PROPERTY_SEARCH && (
                <TabsTrigger value="browse" className="gap-2">
                  <Search className="h-4 w-4" />
                  {t('properties.browseAll')}
                </TabsTrigger>
              )}
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
                    <h3 className="text-2xl font-bold">Your Personalized Recommendations</h3>
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
                          onFeedback={async (feedback) => {
                            if (!tenantPrefId) return;
                            try {
                              await recommendationAPI.sendFeedback({
                                tenant_preference_id: tenantPrefId,
                                property_id: property.id,
                                liked: feedback === 'like',
                              });
                            } catch (e) {
                              console.error('Feedback submit failed', e);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {HAS_PROPERTY_SEARCH && (
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
            )}
          </Tabs>
        </div>
      </section>

      {/* Dashboard Section (only shown when authenticated) */}
      {isAuthenticated && (
        <section id="dashboard" className="py-20 bg-muted/30 scroll-mt-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-4xl font-bold mb-2">{t('nav.dashboard')}</h2>
              <p className="text-lg text-muted-foreground">
                Manage your searches and recommendations
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Saved Searches */}
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                    {t('dashboard.savedSearches')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    {t('dashboard.noData')}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation History */}
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    {t('dashboard.recommendationHistory')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-sm font-medium">Preference #{rec.tenant_preference_id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rec.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('dashboard.noData')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* About Section removed per request */}

      {/* Contact Section (simplified) */}
      <section id="contact" className="py-20 bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
              <p className="text-lg text-muted-foreground">
                Get in touch with our team. We're here to help!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover-lift">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">contact@rentai.et</p>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-sm text-muted-foreground">+251 911 123 456</p>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Office</h3>
                  <p className="text-sm text-muted-foreground">Bole, Addis Ababa</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
