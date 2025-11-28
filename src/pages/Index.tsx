import { useEffect, useState, useMemo } from 'react';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AIRecommendationForm } from '@/components/properties/AIRecommendationForm';
import { PropertyCard } from '@/components/PropertyCard';
import { recommendationAPI, propertyAPI, HAS_PROPERTY_SEARCH } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Search,
  History,
  BookmarkCheck,
  Mail,
  Phone,
  MapPin,
  Home as HomeIcon,
} from 'lucide-react';
import FrontPage from '@/components/FrontPage';
import { Steps } from '@/components/Steps';

const Index = () => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('ai');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [tenantPrefId, setTenantPrefId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Manual search filters (Adama-only service)
  const [filters, setFilters] = useState({
    price_range: '',
    house_type: '',
    amenities: [] as string[],
    sort_by: 'distance',
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');

  const priceRanges = useMemo(() => [
    { label: t('dashboard.price_ranges.under', { max: '3,000' }), value: '0-3000', min: 0, max: 3000 },
    { label: t('dashboard.price_ranges.between', { min: '3,000', max: '5,000' }), value: '3000-5000', min: 3000, max: 5000 },
    { label: t('dashboard.price_ranges.between', { min: '5,000', max: '8,000' }), value: '5000-8000', min: 5000, max: 8000 },
    { label: t('dashboard.price_ranges.between', { min: '8,000', max: '12,000' }), value: '8000-12000', min: 8000, max: 12000 },
    { label: t('dashboard.price_ranges.between', { min: '12,000', max: '20,000' }), value: '12000-20000', min: 12000, max: 20000 },
    { label: t('dashboard.price_ranges.over', { min: '20,000' }), value: '20000-999999', min: 20000, max: 999999 },
  ], [t]);

  // Only fetch when user explicitly submits via Search
  const [submittedFilters, setSubmittedFilters] = useState<typeof filters | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  // Fetch all approved properties
  const { data: approvedProperties, isLoading: approvedLoading } = useQuery({
    queryKey: ['approved-properties'],
    queryFn: propertyAPI.getAllApproved,
    enabled: true,
    staleTime: 60_000,
    retry: 1,
  });

  const isValidRange = (min?: number, max?: number) =>
    min === undefined || max === undefined || min <= max;

  // Browse properties with filters
  const { data: properties, isLoading: propertiesLoading, error: propertiesError } = useQuery<{ results: any[] }>({
    queryKey: ['properties', submittedFilters],
    queryFn: ({ signal }) => {
      const f = submittedFilters!;
      // Parse price range
      let min_price, max_price;
      if (f.price_range) {
        const range = priceRanges.find(r => r.value === f.price_range);
        if (range) {
          min_price = range.min;
          max_price = range.max;
        }
      }
      return propertyAPI.search(
        {
          min_price,
          max_price,
          house_type: f.house_type || undefined,
          amenities: f.amenities.length ? f.amenities : undefined,
          sort_by: f.sort_by,
        },
        { signal }
      );
    },
    // Fetch automatically when filters change
    enabled: (() => {
      if (!HAS_PROPERTY_SEARCH) return false;
      if (!submittedFilters) return false;
      if (cooldownUntil && Date.now() < cooldownUntil) return false;
      return !!submittedFilters.price_range;
    })(),
    // v5 replacement for keepPreviousData
    placeholderData: (prev) => prev,
    retry: false,
    staleTime: 20_000,
    refetchOnReconnect: false,
    // Avoid background refetches that can lead to duplicate calls / 429s
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Enter a short cooldown on 429 errors
  useEffect(() => {
    if (isAxiosError(propertiesError) && propertiesError.response?.status === 429) {
      setCooldownUntil(Date.now() + 2000);
    }
  }, [propertiesError]);

  // Recommendations history
  const { data: recommendationsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['my-recommendations'],
    queryFn: recommendationAPI.getMine,
    enabled: isAuthenticated,
  });

  // Saved searches
  const { data: savedSearches, isLoading: savedSearchesLoading } = useQuery({
    queryKey: ['dashboard-saved-searches'],
    queryFn: propertyAPI.getSavedSearches,
    enabled: isAuthenticated && HAS_PROPERTY_SEARCH,
    staleTime: 30_000,
  });

  const handleGenerateRecommendations = async (formData: any) => {
    setIsGenerating(true);
    try {
      // Map UI form fields to API schema
      const payload = {
        job_school_location: formData.job_school_location,
        salary: Number(formData.salary),
        house_type: formData.house_type,
        family_size: Number(formData.family_size),
        preferred_amenities: formData.amenities || [],
        language: formData.language === 'om' ? 'or' : formData.language,
      };
      const result = await recommendationAPI.generate(payload);
      setTenantPrefId(result.tenant_preference_id ?? null);
      
      console.log('AI Recommendation API Response:', result);
      
      // Fetch full property details for each recommendation using the same API as "All Properties"
      const enriched = await Promise.all(
        (result.recommendations || []).map(async (r: any, idx: number) => {
          const propertyId = r.property_id || r.id || r._id || r.propertyId;
          
          console.log('=== Processing Recommendation #' + (idx + 1) + ' ===');
          console.log('Property ID:', propertyId);
          
          // Fetch full property details using the same API endpoint as "All Properties" tab
          let fullProperty = null;
          if (propertyId) {
            try {
              console.log('Fetching full property details from /property/' + propertyId);
              fullProperty = await propertyAPI.getById(propertyId);
              console.log('Full property data retrieved:', fullProperty);
              console.log('Owner contact from full property:', {
                owner_contact: fullProperty.owner_contact,
                owner: fullProperty.owner,
                contact: fullProperty.contact,
                owner_name: fullProperty.owner_name,
                owner_phone: fullProperty.owner_phone,
                owner_email: fullProperty.owner_email,
              });
            } catch (error) {
              console.error('Failed to fetch property details for ID:', propertyId, error);
            }
          }
          
          // Merge AI recommendation data with full property data
          // Use full property data for owner contact, fall back to recommendation data
          return {
            id: propertyId || `temp-${Date.now()}-${idx}`,
            title: r.title || fullProperty?.title,
            location: r.location || fullProperty?.location,
            price: r.price ?? fullProperty?.price,
            lat: r.lat || r.latitude || fullProperty?.lat || fullProperty?.latitude,
            lon: r.lon || r.longitude || fullProperty?.lon || fullProperty?.longitude,
            transport_cost: r.transport_cost,
            affordability_score: r.affordability_score,
            ai_reason: r.reason,
            image_url: r.images?.[0] || r.image_url || fullProperty?.images?.[0] || fullProperty?.image_url || r.photo || r.photos?.[0],
            amenities: fullProperty?.amenities || r.details?.amenities || r.amenities || [],
            house_type: fullProperty?.house_type || r.details?.house_type || r.house_type,
            distance: r.route?.distance_km || r.distance,
            bedrooms: fullProperty?.bedrooms || r.details?.bedrooms || r.bedrooms,
            bathrooms: fullProperty?.bathrooms || r.details?.bathrooms || r.bathrooms,
            area: fullProperty?.area || r.details?.area || r.area,
            approved: fullProperty?.approved || fullProperty?.status === 'APPROVED',
            // Owner contact - prioritize full property data from the API
            owner_contact: fullProperty?.owner_contact || fullProperty?.owner || fullProperty?.contact || r.owner_contact || r.owner || r.contact,
            owner_name: fullProperty?.owner_name || fullProperty?.owner?.name || fullProperty?.contact?.name || r.owner_name || r.owner?.name,
            owner_phone: fullProperty?.owner_phone || fullProperty?.owner?.phone || fullProperty?.contact?.phone || fullProperty?.phone || r.owner_phone || r.phone,
            owner_email: fullProperty?.owner_email || fullProperty?.owner?.email || fullProperty?.contact?.email || r.owner_email,
          };
        })
      );
      
      console.log('Final enriched recommendations:', enriched);
      setRecommendations(enriched);
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
          <Steps />
        </div>
      </section>

      {/* Features Section - Why Choose RentAI? */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.why_choose_rentai')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('index.experience_the_future')}</p>
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
              <h3 className="text-xl font-semibold mb-2">{t('index.ai_powered_matching')}</h3>
              <p className="text-muted-foreground">{t('index.advanced_ai_analysis')}</p>
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
              <h3 className="text-xl font-semibold mb-2">{t('index.location_intelligence')}</h3>
              <p className="text-muted-foreground">{t('index.find_properties_based_on_proximity')}</p>
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
              <h3 className="text-xl font-semibold mb-2">{t('index.budget_optimization')}</h3>
              <p className="text-muted-foreground">{t('index.get_recommendations_that_fit_your_budget')}</p>
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
            <h2 className="text-4xl font-bold mb-2">{t('index.find_your_perfect_home')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('index.get_ai_powered_recommendations')}
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className={`grid w-full max-w-2xl mx-auto ${HAS_PROPERTY_SEARCH ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t('properties.aiRecommendations')}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <HomeIcon className="h-4 w-4" />
                {t('index.all_properties')}
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
                    <h3 className="text-2xl font-bold">{t('index.your_personalized_recommendations')}</h3>
                    <button
                      onClick={() => setRecommendations([])}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('index.new_search')}
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
                          showContactOwner={true}
                          tenantPreferenceId={tenantPrefId}
                          onFeedback={async (feedback) => {
                            // Check authentication first
                            if (!isAuthenticated || !token) {
                              toast.error('Please sign in to submit feedback', {
                                description: 'You need to be authenticated to provide feedback on properties.',
                                action: {
                                  label: 'Sign In',
                                  onClick: () => window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/'
                                }
                              });
                              return;
                            }
                            
                            if (!tenantPrefId) return;
                            try {
                              await recommendationAPI.sendFeedback({
                                tenant_preference_id: tenantPrefId,
                                property_id: property.id,
                                liked: feedback === 'like',
                              });
                            } catch (e: any) {
                              console.error('Feedback submit failed', e);
                              // Handle 401 specifically
                              if (e?.response?.status === 401) {
                                toast.error('Authentication expired', {
                                  description: 'Please sign in again to continue.',
                                  action: {
                                    label: 'Sign In',
                                    onClick: () => window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/'
                                  }
                                });
                              }
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* All Approved Properties Tab */}
            <TabsContent value="all" className="space-y-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{t('index.all_approved_properties')}</h3>
                <p className="text-muted-foreground">{t('index.browse_our_complete_collection')}</p>
              </div>

              {approvedLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : approvedProperties && approvedProperties.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedProperties.map((property: any, idx: number) => (
                    <PropertyCard 
                      key={property.id || idx} 
                      property={property}
                      showContactOwner={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HomeIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">{t('index.no_approved_properties')}</p>
                </div>
              )}
            </TabsContent>

            {HAS_PROPERTY_SEARCH && (
            <TabsContent value="browse" className="space-y-8">
              {/* Manual Search UI (distinct from AI) */}
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" /> {t('index.manual_search')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Price Range Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">{t('index.select_your_budget_range')}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {priceRanges.map((range) => (
                        <button
                          key={range.value}
                          type="button"
                          onClick={() => {
                            setSelectedPriceRange(range.value);
                            const newFilters = { ...filters, price_range: range.value };
                            setFilters(newFilters);
                            setSubmittedFilters(newFilters);
                          }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedPriceRange === range.value
                              ? 'border-primary bg-primary/10 shadow-lg scale-105'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <div className="font-semibold text-foreground">{range.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{t('index.monthly_rent')}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {/* House Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('index.house_type')}</label>
                      <select
                        className="w-full h-11 rounded-lg border-2 bg-background px-4 font-medium"
                        value={filters.house_type}
                        onChange={(e) => {
                          const newFilters = { ...filters, house_type: e.target.value };
                          setFilters(newFilters);
                          if (selectedPriceRange) setSubmittedFilters(newFilters);
                        }}
                      >
                        <option value="">{t('index.any_type')}</option>
                        <option value="apartment">{t('index.apartment')}</option>
                        <option value="house">{t('index.house')}</option>
                        <option value="villa">{t('index.villa')}</option>
                        <option value="studio">{t('index.studio')}</option>
                      </select>
                    </div>
                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('properties.sortBy')}</label>
                      <select
                        className="w-full h-11 rounded-lg border-2 bg-background px-4 font-medium"
                        value={filters.sort_by}
                        onChange={(e) => {
                          const newFilters = { ...filters, sort_by: e.target.value };
                          setFilters(newFilters);
                          if (selectedPriceRange) setSubmittedFilters(newFilters);
                        }}
                      >
                        <option value="distance">{t('properties.distance')}</option>
                        <option value="price">{t('properties.price')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Amenities + Distance */}
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">{t('index.amenities')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['wifi','parking','security','water','balcony','garden'].map((a) => (
                          <label key={a} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={filters.amenities.includes(a)}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...filters.amenities, a]
                                  : filters.amenities.filter((x) => x !== a);
                                const newFilters = { ...filters, amenities: next };
                                setFilters(newFilters);
                                if (selectedPriceRange) setSubmittedFilters(newFilters);
                              }}
                            />
                            <span className="capitalize font-medium">{t(`index.amenities_options.${a}`)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Info Message */}
                  {!selectedPriceRange && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        {t('index.select_price_range_to_start')}
                      </p>
                    </div>
                  )}
                  
                  {selectedPriceRange && (
                    <div className="mt-6 flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-200">{t('index.searching_properties')}</p>
                          <p className="text-sm text-green-600 dark:text-green-300">{t('index.results_update_automatically')}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const range = priceRanges.find(r => r.value === selectedPriceRange);
                            const payload: any = {
                              location: 'Adama',
                              min_price: range?.min ?? 0,
                              max_price: range?.max ?? 0,
                              house_type: filters.house_type || 'apartment',
                              amenities: filters.amenities.length > 0 ? filters.amenities : [],
                              bedrooms: 2,
                              max_distance_km: 0,
                              photos: [],
                              property_id: '00000000-0000-0000-0000-000000000000',
                            };
                            await propertyAPI.saveSearch(payload);
                            toast.success(t('index.search_preferences_saved'));
                          } catch (e) {
                            console.error('Save search failed', e);
                            toast.error(t('index.failed_to_save_search'));
                          }
                        }}
                      >
                        {t('index.save_search')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    <PropertyCard key={idx} property={property} showContactOwner={true} />
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

      {/* Dashboard Section */}
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
              {t('index.manage_your_searches')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Saved Searches */}
            <Card className="shadow-premium">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                  {t('dashboard.savedSearches')}
                </CardTitle>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    See More <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {savedSearchesLoading && isAuthenticated ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : savedSearches && savedSearches.length > 0 ? (
                  <div className="space-y-3">
                    {savedSearches.slice(0, 3).map((search: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-sm font-medium truncate">
                          {search.location || `Search #${search.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(search.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <p className="text-sm font-medium">Apartment in Bole</p>
                      <p className="text-xs text-muted-foreground">5,000 - 8,000 ETB</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendation History */}
            <Card className="shadow-premium">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  {t('dashboard.recommendationHistory')}
                </CardTitle>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    See More <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {historyLoading && isAuthenticated ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : recommendationsHistory?.length > 0 ? (
                  <div className="space-y-3">
                    {recommendationsHistory.slice(0, 3).map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-sm font-medium">
                          AI Recommendation #{rec.tenant_preference_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rec.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <p className="text-sm font-medium">AI Recommendation #123</p>
                      <p className="text-xs text-muted-foreground">Nov 28, 2025</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
              <h2 className="text-4xl font-bold mb-4">{t('contactUs')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('index.get_in_touch')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover-lift">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{t('index.email')}</h3>
                  <p className="text-sm text-muted-foreground">contact@rentai.et</p>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{t('index.phone')}</h3>
                  <p className="text-sm text-muted-foreground">+251 911 123 456</p>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{t('index.office')}</h3>
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
