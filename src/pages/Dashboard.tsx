import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { recommendationAPI, propertyAPI, HAS_PROPERTY_SEARCH } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { Search, History, Sparkles, User, Mail, Phone, Shield, Globe2, Hash, Calendar, MapPin, TrendingUp, Home, Star, ChevronRight, DollarSign, Bed, Archive, Trash2 } from 'lucide-react';
import { decodeJwt } from '@/lib/jwt';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Component to display saved property with full details
const SavedPropertyCard = ({ searchData, onDelete }: { searchData: any; onDelete: () => void }) => {
  const { data: propertyDetails, isLoading } = useQuery({
    queryKey: ['saved-property', searchData.property_id],
    queryFn: () => propertyAPI.getById(searchData.property_id),
    enabled: !!searchData.property_id,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!propertyDetails) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Property details not available</p>
            <p className="text-xs mt-1">Property ID: {searchData.property_id}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use PropertyCard component with the fetched property details wrapped with archive button
  return (
    <div className="relative group/saved">
      <PropertyCard property={propertyDetails} showContactOwner={true} />
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-3 right-3 opacity-0 group-hover/saved:opacity-100 transition-opacity shadow-lg z-10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Archive className="h-4 w-4 mr-1" />
        Remove
      </Button>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('browse');

  // Decode JWT for user panel
  const jwt = useMemo(() => decodeJwt(localStorage.getItem('authToken')), []);

  // Manual search filters (Adama-only service)
  const [filters, setFilters] = useState({
    price_range: '',
    house_type: '',
    amenities: [] as string[],
    sort_by: 'distance',
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');

  // Predefined price ranges
  const priceRanges = [
    { label: 'Under 3,000 ETB', value: '0-3000', min: 0, max: 3000 },
    { label: '3,000 - 5,000 ETB', value: '3000-5000', min: 3000, max: 5000 },
    { label: '5,000 - 8,000 ETB', value: '5000-8000', min: 5000, max: 8000 },
    { label: '8,000 - 12,000 ETB', value: '8000-12000', min: 8000, max: 12000 },
    { label: '12,000 - 20,000 ETB', value: '12000-20000', min: 12000, max: 20000 },
    { label: '20,000+ ETB', value: '20000-999999', min: 20000, max: 999999 },
  ];
  // Only fetch when user explicitly submits via Search
  const [submittedFilters, setSubmittedFilters] = useState<typeof filters | null>(null);

  // Browse properties (tenant view) with filters — manual submission only
  const { data: properties, isLoading: propertiesLoading, error: propertiesError } = useQuery({
    queryKey: ['dashboard-properties', submittedFilters],
    queryFn: () => {
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
      return propertyAPI.search({
        min_price,
        max_price,
        house_type: f.house_type || undefined,
        amenities: f.amenities.length ? f.amenities : undefined,
        sort_by: f.sort_by,
      });
    },
    enabled: HAS_PROPERTY_SEARCH && !!submittedFilters,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 20_000,
    retry: false,
  });

  // Optional: throttle further searches briefly on 429
  useEffect(() => {
    // If needed, we could add a local cooldown here similar to Index.tsx
    void propertiesError;
  }, [propertiesError]);

  // My recommendations
  const { data: recommendationsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['dashboard-my-recommendations'],
    queryFn: recommendationAPI.getMine,
  });

  // Saved searches
  const { data: savedSearches, isLoading: savedSearchesLoading, error: savedSearchesError, refetch: refetchSavedSearches } = useQuery<any[]>({
    queryKey: ['dashboard-saved-searches'],
    queryFn: propertyAPI.getSavedSearches,
    enabled: HAS_PROPERTY_SEARCH,
    staleTime: 30_000,
    retry: 1,
  });

  // Handle saved searches error
  useEffect(() => {
    if (savedSearchesError) {
      console.error('Failed to load saved searches:', savedSearchesError);
      const errorMsg = (savedSearchesError as any)?.response?.data?.message || (savedSearchesError as any)?.message || 'Failed to load saved searches';
      toast.error('Could not load saved searches', {
        description: errorMsg + '. This may be due to authentication or permission issues.'
      });
    }
  }, [savedSearchesError]);

  // Handle delete saved search
  const handleDeleteSavedSearch = async (searchId: number) => {
    try {
      await propertyAPI.deleteSavedSearch(searchId);
      toast.success('Saved search removed successfully');
      refetchSavedSearches();
    } catch (error: any) {
      console.error('Failed to delete saved search:', error);
      toast.error('Failed to remove saved search', {
        description: error?.response?.data?.message || error?.message
      });
    }
  };

  // Stats for dashboard
  const stats = useMemo(() => ({
    totalProperties: properties?.results?.length || 0,
    totalRecommendations: recommendationsHistory?.length || 0,
    recentActivity: recommendationsHistory?.slice(0, 3) || [],
  }), [properties, recommendationsHistory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-300 bg-clip-text text-transparent mb-3">
                {t('dashboard') || 'Dashboard'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                {t('dashboard_subtitle') || 'Discover your perfect home with AI-powered recommendations and browse available properties.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{jwt?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{jwt?.role || 'tenant'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Available Properties</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalProperties}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Recommendations</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalRecommendations}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Match Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.totalRecommendations > 0 ? '85%' : '—'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Profile Card */}
        <motion.section variants={itemVariants} className="mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Profile Sidebar */}
                <div className="lg:w-1/3 bg-gradient-to-b from-blue-600 to-purple-700 text-white p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{jwt?.email?.split('@')[0] || 'User'}</h3>
                      <Badge className="bg-white/20 text-white border-0 mt-1 capitalize">
                        {jwt?.role || 'tenant'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Verified Account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date().getFullYear()}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="lg:w-2/3 p-6">
                  <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Profile Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{jwt?.email || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{jwt?.phone_number || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Globe2 className="h-4 w-4" />
                        Preferred Language
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white uppercase">{jwt?.preferred_language || 'en'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Hash className="h-4 w-4" />
                        User ID
                      </div>
                      <p className="font-mono text-sm text-gray-600 dark:text-gray-300">{jwt?.sub || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className={`grid w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg ${
              HAS_PROPERTY_SEARCH ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'
            }`}>
              {HAS_PROPERTY_SEARCH && (
                <TabsTrigger 
                  value="browse" 
                  className="gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 py-2"
                >
                  <Search className="h-4 w-4" />
                  <span className="truncate">{t('properties.browseAll') || 'Browse All'}</span>
                </TabsTrigger>
              )}
              {HAS_PROPERTY_SEARCH && (
                <TabsTrigger 
                  value="saved" 
                  className="gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 py-2"
                >
                  <Star className="h-4 w-4" />
                  <span className="truncate">{t('dashboard.savedSearches') || 'My Saved Searches'}</span>
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="history" 
                className="gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 py-2"
              >
                <History className="h-4 w-4" />
                <span className="truncate">{t('dashboard.recommendationHistory') || 'Recommendation History'}</span>
              </TabsTrigger>
            </TabsList>

            {/* Browse Properties Tab */}
            {HAS_PROPERTY_SEARCH && (
              <TabsContent value="browse" className="space-y-6">
                {/* Manual Search UI (distinct from AI) */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    {/* Price Range Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium">Select Your Budget Range</label>
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
                            <div className="text-xs text-muted-foreground mt-1">Monthly rent</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      {/* House Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2">House Type</label>
                        <select
                          className="w-full h-11 rounded-lg border-2 bg-background px-4 font-medium"
                          value={filters.house_type}
                          onChange={(e) => {
                            const newFilters = { ...filters, house_type: e.target.value };
                            setFilters(newFilters);
                            if (selectedPriceRange) setSubmittedFilters(newFilters);
                          }}
                        >
                          <option value="">Any Type</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="villa">Villa</option>
                          <option value="studio">Studio</option>
                        </select>
                      </div>
                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Sort By</label>
                        <select
                          className="w-full h-11 rounded-lg border-2 bg-background px-4 font-medium"
                          value={filters.sort_by}
                          onChange={(e) => {
                            const newFilters = { ...filters, sort_by: e.target.value };
                            setFilters(newFilters);
                            if (selectedPriceRange) setSubmittedFilters(newFilters);
                          }}
                        >
                          <option value="distance">Distance</option>
                          <option value="price">Price</option>
                        </select>
                      </div>
                    </div>

                    {/* Amenities + Distance */}
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">Amenities</label>
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
                              <span className="capitalize font-medium">{a}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Info Message */}
                    {!selectedPriceRange && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                          👆 Select a price range above to start browsing properties
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
                            <p className="font-semibold text-green-800 dark:text-green-200">Searching properties...</p>
                            <p className="text-sm text-green-600 dark:text-green-300">Results update automatically as you adjust filters</p>
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
                              toast.success('Search preferences saved!');
                              refetchSavedSearches();
                            } catch (e) {
                              console.error('Save search failed', e);
                              toast.error('Failed to save search');
                            }
                          }}
                        >
                          Save Search
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Available Properties
                  </h3>
                  <Badge variant="secondary" className="text-sm">
                    {properties?.results?.length || 0} properties found
                  </Badge>
                </div>

                {propertiesLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="border-0 shadow-lg">
                        <CardContent className="p-0">
                          <Skeleton className="h-48 w-full rounded-t-lg" />
                          <div className="p-4 space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-10 w-full mt-4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : properties?.results?.length > 0 ? (
                  <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {properties.results.map((property: any, idx: number) => (
                      <motion.div key={idx} variants={itemVariants}>
                        <PropertyCard property={property} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <Card className="border-0 shadow-lg text-center py-12">
                    <CardContent>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Properties Available
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        There are currently no properties available. Check back later for new listings.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* Saved Searches Tab */}
            {HAS_PROPERTY_SEARCH && (
              <TabsContent value="saved" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 dark:from-white dark:to-teal-300 bg-clip-text text-transparent">
                      Saved Properties
                    </h3>
                    <p className="text-muted-foreground mt-1">Your bookmarked properties and search preferences</p>
                  </div>
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    <Star className="h-3.5 w-3.5 mr-1.5" />
                    {savedSearches?.length || 0} saved
                  </Badge>
                </div>

                {savedSearchesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-10 w-20" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : savedSearches && savedSearches.length > 0 ? (
                  <div className="space-y-6">
                    {/* Saved Properties - Full Property Cards */}
                    {savedSearches.filter((s: any) => s.property_id && s.property_id !== '00000000-0000-0000-0000-000000000000').length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Saved Properties</h4>
                        <motion.div 
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {savedSearches.filter((s: any) => s.property_id && s.property_id !== '00000000-0000-0000-0000-000000000000').map((search: any, idx: number) => (
                            <motion.div key={search.id || idx} variants={itemVariants}>
                              <SavedPropertyCard 
                                searchData={search} 
                                onDelete={() => handleDeleteSavedSearch(search.id)}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Saved Search Criteria */}
                    {savedSearches.filter((s: any) => !s.property_id || s.property_id === '00000000-0000-0000-0000-000000000000').length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Criteria</h4>
                        <motion.div 
                          className="grid md:grid-cols-2 gap-6"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {savedSearches.filter((s: any) => !s.property_id || s.property_id === '00000000-0000-0000-0000-000000000000').map((search: any, idx: number) => {
                            const hasPropertyImage = search.photos && search.photos.length > 0;
                            return (
                        <motion.div key={search.id || idx} variants={itemVariants} className="relative group/search">
                          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                            {/* Archive Button */}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-3 right-3 opacity-0 group-hover/search:opacity-100 transition-opacity shadow-lg z-10"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleDeleteSavedSearch(search.id);
                              }}
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            {/* Property Image Header (if available) */}
                            {hasPropertyImage && (
                              <div className="relative h-48 overflow-hidden">
                                <img 
                                  src={search.photos[0]} 
                                  alt={search.location}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                {isPropertySave && (
                                  <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg">
                                    <Home className="h-3 w-3 mr-1" />
                                    Saved Property
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    {!hasPropertyImage && (
                                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                        {isPropertySave ? (
                                          <Home className="h-7 w-7 text-white" />
                                        ) : (
                                          <MapPin className="h-7 w-7 text-white" />
                                        )}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors truncate">
                                          {search.location || 'Property Search'}
                                        </h4>
                                        {!hasPropertyImage && isPropertySave && (
                                          <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-400">
                                            Property
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(search.created_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Price Banner */}
                                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 border-l-4 border-teal-600 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-1">Price Range</p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {search.min_price === search.max_price 
                                          ? `${new Intl.NumberFormat('en-ET').format(search.min_price)} ETB`
                                          : `${new Intl.NumberFormat('en-ET').format(search.min_price)} - ${new Intl.NumberFormat('en-ET').format(search.max_price)} ETB`
                                        }
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-0.5">per month</p>
                                    </div>
                                    <DollarSign className="h-10 w-10 text-teal-600/30" />
                                  </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors">
                                    <Home className="h-5 w-5 text-teal-600 mx-auto mb-1.5" />
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white capitalize">
                                      {search.house_type || 'Any'}
                                    </p>
                                  </div>
                                  <div className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors">
                                    <Bed className="h-5 w-5 text-teal-600 mx-auto mb-1.5" />
                                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                      {search.bedrooms || 'Any'}
                                    </p>
                                  </div>
                                </div>

                                {/* Amenities */}
                                {search.amenities && search.amenities.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Amenities</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {search.amenities.slice(0, 4).map((amenity: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs capitalize bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border-0">
                                          <Star className="h-2.5 w-2.5 mr-1" />
                                          {amenity}
                                        </Badge>
                                      ))}
                                      {search.amenities.length > 4 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{search.amenities.length - 4} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg group/btn"
                                    onClick={() => {
                                      const range = priceRanges.find(
                                        r => r.min === search.min_price && r.max === search.max_price
                                      );
                                      if (range) {
                                        setSelectedPriceRange(range.value);
                                        setFilters({
                                          price_range: range.value,
                                          house_type: search.house_type || '',
                                          amenities: search.amenities || [],
                                          sort_by: 'distance',
                                        });
                                        setSubmittedFilters({
                                          price_range: range.value,
                                          house_type: search.house_type || '',
                                          amenities: search.amenities || [],
                                          sort_by: 'distance',
                                        });
                                      }
                                      setActiveTab('browse');
                                      toast.success('Search filters applied!');
                                    }}
                                  >
                                    <Search className="h-4 w-4 mr-2" />
                                    View Properties
                                    <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                            </motion.div>
                          );})}
                        </motion.div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg text-center py-16">
                    <CardContent>
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                        <Star className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        No Saved Searches Yet
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                        Save your property searches to quickly access them later. Start browsing properties and save your favorite search criteria.
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        onClick={() => setActiveTab('browse')}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Start Browsing Properties
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* Recommendations History Tab */}
            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recommendation History
                </h3>
                <Badge variant="secondary" className="text-sm">
                  {recommendationsHistory?.length || 0} recommendations
                </Badge>
              </div>

              {historyLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-10 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendationsHistory?.length > 0 ? (
                <motion.div 
                  className="grid gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {recommendationsHistory.map((rec: any, idx: number) => (
                    <motion.div key={idx} variants={itemVariants}>
                      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                  AI Recommendation #{rec.tenant_preference_id || idx + 1}
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(rec.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {rec.properties?.length || 0} properties
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" className="gap-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                              View Details
                              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                          
                          {/* Property preview if available */}
                          {rec.properties?.slice(0, 2).map((property: any, propertyIdx: number) => (
                            <div key={propertyIdx} className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                <Star className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {property.title || `Property ${propertyIdx + 1}`}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                  {property.location || 'Location not specified'}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {property.price ? `${property.price} ETB` : 'Price not set'}
                              </Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card className="border-0 shadow-lg text-center py-16">
                  <CardContent>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      No Recommendations Yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                      Start by creating your first property preference to get AI-powered recommendations tailored to your needs.
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Your First Recommendation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Service Status (Non-AI backend visibility) */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold">Service Status</h4>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const data = await propertyAPI.health();
                      toast.success(`Search service: ${data?.status || 'ok'}`);
                    } catch (e) {
                      toast.error('Search service unreachable');
                    }
                  }}
                >
                  Check Health
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>• GET <code>/api/v1/search</code> — Browse approved properties (Adama-only)</p>
                <p>• GET <code>/api/v1/property/{'{id}'}</code> — View a single property</p>
                <p>• POST <code>/api/v1/saved-searches</code> — Save your manual search</p>
                <p>• GET <code>/api/v1/map/preview</code> — Interactive map preview (no auth)</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;