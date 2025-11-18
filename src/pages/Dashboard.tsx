import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { recommendationAPI, propertyAPI, HAS_PROPERTY_SEARCH } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { Search, History, Sparkles, User, Mail, Phone, Shield, Globe2, Hash, Calendar, MapPin, TrendingUp, Home, Star, ChevronRight } from 'lucide-react';
import { decodeJwt } from '@/lib/jwt';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('browse');

  // Decode JWT for user panel
  const jwt = useMemo(() => decodeJwt(localStorage.getItem('authToken')), []);

  // Manual search filters (Adama-only service)
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    house_type: '',
    amenities: [] as string[],
    max_distance_km: 20,
    sort_by: 'distance',
  });

  // Browse properties (tenant view) with filters
  const { data: properties, isLoading: propertiesLoading, refetch: refetchProperties } = useQuery({
    queryKey: ['dashboard-properties', filters],
    queryFn: () => propertyAPI.search({
      min_price: filters.min_price ? Number(filters.min_price) : undefined,
      max_price: filters.max_price ? Number(filters.max_price) : undefined,
      house_type: filters.house_type || undefined,
      amenities: filters.amenities.length ? filters.amenities : undefined,
      max_distance_km: filters.max_distance_km,
      sort_by: filters.sort_by,
    }),
    enabled: HAS_PROPERTY_SEARCH,
  });

  // My recommendations
  const { data: recommendationsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['dashboard-my-recommendations'],
    queryFn: recommendationAPI.getMine,
  });

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

        {/* Main Content Tabs */
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className={`grid w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg ${
              HAS_PROPERTY_SEARCH ? 'grid-cols-2' : 'grid-cols-1'
            }`}>
              {HAS_PROPERTY_SEARCH && (
                <TabsTrigger 
                  value="browse" 
                  className="gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <Search className="h-4 w-4" />
                  {t('properties.browseAll') || 'Browse Properties'}
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="history" 
                className="gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <History className="h-4 w-4" />
                {t('dashboard.recommendationHistory') || 'My Recommendations'}
              </TabsTrigger>
            </TabsList>

            {/* Browse Properties Tab */}
            {HAS_PROPERTY_SEARCH && (
              <TabsContent value="browse" className="space-y-6">
                {/* Manual Search UI (distinct from AI) */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      {/* House Type */}
                      <div>
                        <label className="block text-sm font-medium mb-1">House Type</label>
                        <select
                          className="w-full h-10 rounded-md border bg-background"
                          value={filters.house_type}
                          onChange={(e) => setFilters({ ...filters, house_type: e.target.value })}
                        >
                          <option value="">Any</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="villa">Villa</option>
                          <option value="studio">Studio</option>
                        </select>
                      </div>
                      {/* Min Price */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Min Price (ETB)</label>
                        <input
                          type="number"
                          className="w-full h-10 rounded-md border bg-background px-3"
                          value={filters.min_price}
                          onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                          placeholder="e.g., 5000"
                        />
                      </div>
                      {/* Max Price */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Max Price (ETB)</label>
                        <input
                          type="number"
                          className="w-full h-10 rounded-md border bg-background px-3"
                          value={filters.max_price}
                          onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                          placeholder="e.g., 20000"
                        />
                      </div>
                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Sort By</label>
                        <select
                          className="w-full h-10 rounded-md border bg-background"
                          value={filters.sort_by}
                          onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                        >
                          <option value="distance">Distance</option>
                          <option value="price">Price</option>
                        </select>
                      </div>
                    </div>

                    {/* Amenities + Distance */}
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Amenities</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {['wifi','parking','security','water','balcony','garden'].map((a) => (
                            <label key={a} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={filters.amenities.includes(a)}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...filters.amenities, a]
                                    : filters.amenities.filter((x) => x !== a);
                                  setFilters({ ...filters, amenities: next });
                                }}
                              />
                              <span className="capitalize">{a}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Distance (km): {filters.max_distance_km}</label>
                        <input
                          type="range"
                          min={1}
                          max={30}
                          step={1}
                          value={filters.max_distance_km}
                          onChange={(e) => setFilters({ ...filters, max_distance_km: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <Button onClick={() => refetchProperties()} className="sm:w-auto">
                        Search
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await propertyAPI.saveSearch({
                              location: 'Adama',
                              min_price: filters.min_price ? Number(filters.min_price) : undefined,
                              max_price: filters.max_price ? Number(filters.max_price) : undefined,
                              house_type: filters.house_type || undefined,
                              amenities: filters.amenities,
                              max_distance_km: filters.max_distance_km,
                            });
                            toast.success('Search saved');
                          } catch (e) {
                            console.error('Save search failed', e);
                          }
                        }}
                        className="sm:w-auto"
                      >
                        Save Search
                      </Button>
                    </div>
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