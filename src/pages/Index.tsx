import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AIRecommendationForm } from '@/components/properties/AIRecommendationForm';
import { PropertyCard } from '@/components/PropertyCard';
import { recommendationAPI, propertyAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Search, History, BookmarkCheck, Mail, Phone, MapPin } from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('ai');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Browse all properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyAPI.search({}),
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
      const result = await recommendationAPI.generate(formData);
      setRecommendations(result.recommendations || []);
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
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{t('hero.beta')}</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  {t('hero.title')}
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-xl">
                  {t('hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-base"
                  onClick={() => scrollToSection('properties')}
                >
                  {t('hero.viewProperties')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base"
                  onClick={() => scrollToSection('properties')}
                >
                  {t('hero.addProperties')}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
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
            </motion.div>

            {/* Hero Images - Overlapping Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Desktop: Overlapping layout */}
              <div className="hidden md:block relative h-[500px]">
                <div className="absolute top-0 left-0 w-[280px] h-[400px] rounded-2xl overflow-hidden shadow-premium-lg transform rotate-[-6deg] hover:rotate-[-3deg] transition-transform">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-8xl">🏠</span>
                  </div>
                </div>
                <div className="absolute top-12 right-0 w-[280px] h-[400px] rounded-2xl overflow-hidden shadow-premium-lg transform rotate-[6deg] hover:rotate-[3deg] transition-transform">
                  <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <span className="text-8xl">🏢</span>
                  </div>
                </div>
              </div>

              {/* Mobile: Stacked layout */}
              <div className="md:hidden space-y-4">
                <div className="w-full h-64 rounded-2xl overflow-hidden shadow-premium">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-8xl">🏠</span>
                  </div>
                </div>
                <div className="w-full h-64 rounded-2xl overflow-hidden shadow-premium">
                  <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <span className="text-8xl">🏢</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RentAI?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of rental property management with AI-powered recommendations
            </p>
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
              <p className="text-muted-foreground">
                Our advanced AI analyzes your preferences and finds the perfect properties for you
              </p>
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
              <p className="text-muted-foreground">
                Find properties based on proximity to work, transport costs, and local amenities
              </p>
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
              <p className="text-muted-foreground">
                Get recommendations that fit your budget with detailed affordability analysis
              </p>
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
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : recommendationsHistory?.length > 0 ? (
                    <div className="space-y-3">
                      {recommendationsHistory.map((rec: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-sm font-medium">{rec.job_location}</p>
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

      {/* About Section */}
      <section id="about" className="py-20 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold mb-4">About RentAI</h2>
              <p className="text-lg text-muted-foreground">
                Ethiopia's premier AI-powered rental management platform
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-lg">
                RentAI is revolutionizing the rental property market in Ethiopia by combining
                cutting-edge artificial intelligence with deep local market knowledge. Our platform
                helps both tenants and landlords make smarter decisions faster.
              </p>

              <div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg">
                  To make finding and managing rental properties effortless, transparent, and
                  accessible to everyone in Ethiopia through the power of AI technology.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">What We Do</h3>
                <ul className="space-y-2 text-lg">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>AI-powered property recommendations based on your unique needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Intelligent location analysis considering work commute and transport costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Budget optimization to help you find affordable options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Comprehensive property database across Addis Ababa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Multi-language support for all Ethiopians</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
                <p className="text-lg">
                  Unlike traditional property search platforms, RentAI understands the Ethiopian
                  context. We factor in local transportation, neighborhood characteristics, and
                  cost-of-living considerations to provide truly personalized recommendations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
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

            <Card className="shadow-premium">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
