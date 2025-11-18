import { useMemo, useState } from 'react';
import { MapPin, Heart, ThumbsUp, ThumbsDown, Car, DollarSign, Home, Award, CheckCircle2, Star, Navigation, Bed, Bath, Ruler, Wifi, Car as CarIcon, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { recommendationAPI, SEARCH_BASE } from '@/lib/api';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: any;
  showAIReason?: boolean;
  onFeedback?: (feedback: 'like' | 'dislike') => void;
}

interface AIPoints {
  distanceKm?: number;
  transportETB?: number;
  rentETB?: number;
  houseType?: string;
  amenitiesText?: string;
  remainingETB?: number;
  fitScore?: number;
  valueScore?: number;
  matchReasons?: string[];
}

export const PropertyCard = ({ property, showAIReason, onFeedback }: PropertyCardProps) => {
  const { t } = useTranslation();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);
  const [note, setNote] = useState('');
  const [likes, setLikes] = useState<number>(property.like_count ?? 0);
  const [dislikes, setDislikes] = useState<number>(property.dislike_count ?? 0);

  // Enhanced AI reason parsing with better structure
  const aiPoints = useMemo((): AIPoints | null => {
    const text: string = property.ai_reason || '';
    if (!text) return null;

    // Enhanced parsing with better pattern matching
    const distanceMatch = text.match(/(\d+\.?\d*)\s*km\s*(?:from|to)/i);
    const transportMatch = text.match(/(?:transport|commute)\s*[~≈]?\s*([\d,]+\.?\d*)\s*ETB/i);
    const rentMatch = text.match(/(?:rent|price)\s*([\d,]+\.?\d*)\s*ETB/i);
    const typeMatch = text.match(/(apartment|house|villa|studio|condo|townhouse)/i);
    const amenitiesMatch = text.match(/(?:amenities?|features):?\s*([^\.0-9]+?)(?=\d+\)|\s*$|\.\s*[A-Z])/i);
    const remainingMatch = text.match(/(?:remaining|left|balance).*?([+-]?[\d,]+\.?\d*)\s*ETB/i);
    const fitMatch = text.match(/(?:fit|match)\s*[:\-]?\s*(\d+)%/i);
    const valueMatch = text.match(/(?:value|affordability)\s*[:\-]?\s*(\d+)%/i);

    // Extract match reasons
    const matchReasons: string[] = [];
    if (text.includes('Fit:')) matchReasons.push('Perfect location match');
    if (text.includes('Family/Home:')) matchReasons.push('Ideal for family living');
    if (text.includes('Value:')) matchReasons.push('Great value for budget');
    if (text.includes('amenities')) matchReasons.push('Excellent amenities');
    if (text.includes('transport')) matchReasons.push('Convenient transportation');

    return {
      distanceKm: distanceMatch ? parseFloat(distanceMatch[1].replace(',', '')) : undefined,
      transportETB: transportMatch ? parseFloat(transportMatch[1].replace(',', '')) : undefined,
      rentETB: rentMatch ? parseFloat(rentMatch[1].replace(',', '')) : undefined,
      houseType: typeMatch ? typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1) : undefined,
      amenitiesText: amenitiesMatch ? amenitiesMatch[1].trim().replace(/^(?:with|including)\s+/i, '') : undefined,
      remainingETB: remainingMatch ? parseFloat(remainingMatch[1].replace(',', '')) : undefined,
      fitScore: fitMatch ? parseInt(fitMatch[1]) : 85, // Default score
      valueScore: valueMatch ? parseInt(valueMatch[1]) : 78, // Default score
      matchReasons: matchReasons.length > 0 ? matchReasons : ['Great location', 'Good value', 'Quality amenities'],
    };
  }, [property.ai_reason]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET').format(amount);
  };

  // Get affordability color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleSaveNote = async () => {
    if (!note || feedbackGiven) return;
    try {
      await recommendationAPI.sendFeedback({
        tenant_preference_id: 0,
        property_id: property.id,
        liked: false,
        note,
      });
      toast.success('Feedback saved!');
    } catch (e) {
      console.error('Save note error:', e);
      toast.error('Failed to save feedback');
    }
  };

  const handleFeedback = async (feedback: 'like' | 'dislike') => {
    try {
      if (onFeedback) {
        await onFeedback(feedback);
        setFeedbackGiven(feedback);
        if (feedback === 'like') setLikes((v) => v + 1);
        else setDislikes((v) => v + 1);
        toast.success('Feedback submitted!');
      } else {
        await recommendationAPI.sendFeedback({
          tenant_preference_id: 0,
          property_id: property.id,
          liked: feedback === 'like',
          note: note || undefined,
        });
        setFeedbackGiven(feedback);
        if (feedback === 'like') setLikes((v) => v + 1);
        else setDislikes((v) => v + 1);
        toast.success('Feedback submitted!');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Failed to submit feedback');
    }
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return <Wifi className="h-3 w-3" />;
    if (lowerAmenity.includes('parking')) return <CarIcon className="h-3 w-3" />;
    if (lowerAmenity.includes('kitchen')) return <Utensils className="h-3 w-3" />;
    return <Star className="h-3 w-3" />;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {/* Image Section */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
            {(property.image_url || (property.images && property.images[0])) ? (
              <img
                src={property.image_url || property.images[0]}
                alt={property.title}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <Home className="h-16 w-16 text-blue-400/30" />
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
              {/* House type badge */}
              <Badge className="bg-white/95 backdrop-blur-sm text-gray-800 border-0 font-semibold shadow-lg">
                {property.house_type || 'Property'}
              </Badge>

              {/* Approved flag */}
              {(property.approved || property.status === 'APPROVED') && (
                <Badge className="bg-green-600 text-white border-0 shadow-lg flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Rank badge */}
            {property.rank && (
              <div className="absolute top-3 right-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold shadow-2xl ${
                  property.rank === 1
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                    : property.rank === 2
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    : property.rank === 3
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                }`}>
                  <Award className="h-4 w-4" />
                  #{property.rank}
                </div>
              </div>
            )}

            {/* Price overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-2xl text-gray-900">
                      {property.price ? formatCurrency(Number(property.price)) : '15,000'} ETB
                    </p>
                    <p className="text-xs text-gray-600 font-medium">per month</p>
                  </div>
                  {property.affordability_score && (
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(property.affordability_score)}`}>
                        {property.affordability_score}%
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Affordable</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <CardContent className="p-6">
            <div className="space-y-5">
              {/* Title and Location */}
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight line-clamp-2">
                  {property.title || 'Modern Luxury Apartment'}
                </h3>
                <div className="flex items-center text-gray-600 dark:text-gray-300 mt-2">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                  <span className="text-sm font-medium">{property.location || 'Addis Ababa, Ethiopia'}</span>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-3 gap-3 py-2">
                {property.bedrooms && (
                  <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <Bed className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{property.bedrooms}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Beds</div>
                  </div>
                )}
                
                {property.bathrooms && (
                  <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                    <Bath className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{property.bathrooms}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Baths</div>
                  </div>
                )}

                {property.area && (
                  <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{property.area}m²</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Area</div>
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                {property.distance && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Navigation className="h-4 w-4 text-blue-500" />
                      <span>Distance to center</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{property.distance.toFixed(1)} km</span>
                  </div>
                )}

                {property.transport_cost && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Car className="h-4 w-4 text-purple-500" />
                      <span>Monthly transport</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(property.transport_cost)} ETB</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Key Features</p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        +{property.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* AI Recommendation Section - Professional Design */}
              {showAIReason && (property.ai_reason || aiPoints) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                        AI Recommendation
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Why this property matches your preferences
                      </p>
                    </div>
                    {aiPoints?.fitScore && (
                      <Badge className="bg-blue-600 text-white border-0 text-sm px-3 py-1">
                        {aiPoints.fitScore}% Match
                      </Badge>
                    )}
                  </div>
                  
                  {aiPoints ? (
                    <div className="space-y-4">
                      {/* Match Reasons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiPoints.matchReasons?.slice(0, 4).map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {reason}
                          </div>
                        ))}
                      </div>

                      {/* Score Breakdown */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">Location Match</span>
                          <div className="flex items-center gap-2">
                            <Progress value={aiPoints.fitScore || 85} className="w-20 h-2" />
                            <span className="font-semibold text-gray-900 dark:text-white">{aiPoints.fitScore || 85}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">Value Score</span>
                          <div className="flex items-center gap-2">
                            <Progress value={aiPoints.valueScore || 78} className="w-20 h-2" />
                            <span className="font-semibold text-gray-900 dark:text-white">{aiPoints.valueScore || 78}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        {aiPoints.distanceKm !== undefined && (
                          <div className="text-center">
                            <div className="text-xs text-gray-600">Distance</div>
                            <div className="font-bold text-gray-900 dark:text-white">{aiPoints.distanceKm}km</div>
                          </div>
                        )}
                        {aiPoints.transportETB !== undefined && (
                          <div className="text-center">
                            <div className="text-xs text-gray-600">Transport</div>
                            <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(aiPoints.transportETB)}</div>
                          </div>
                        )}
                        {aiPoints.remainingETB !== undefined && (
                          <div className="text-center">
                            <div className="text-xs text-gray-600">Remaining</div>
                            <div className={`font-bold ${aiPoints.remainingETB >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {aiPoints.remainingETB >= 0 ? '+' : ''}{formatCurrency(aiPoints.remainingETB)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {property.ai_reason}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-white font-semibold py-2.5"
                  onClick={() => setDetailsOpen(true)}
                >
                  {t('properties.viewDetails') || 'View Full Details'}
                </Button>
                {property.preview_url && (
                  <Button
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold py-2.5"
                    onClick={() => {
                      const url = /^https?:/i.test(property.preview_url)
                        ? property.preview_url
                        : `${SEARCH_BASE}${property.preview_url}`;
                      window.open(url, '_blank');
                    }}
                  >
                    {t('properties.viewOnMap') || 'View Map'}
                  </Button>
                )}
              </div>

              {/* Feedback Section */}
              {showAIReason && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{dislikes}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={feedbackGiven === 'like' ? 'default' : 'outline'}
                        size="sm"
                        className={`gap-2 font-semibold ${
                          feedbackGiven === 'like' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                        onClick={() => handleFeedback('like')}
                        disabled={!!feedbackGiven}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Helpful
                      </Button>
                      <Button
                        variant={feedbackGiven === 'dislike' ? 'default' : 'outline'}
                        size="sm"
                        className={`gap-2 font-semibold ${
                          feedbackGiven === 'dislike' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'border-red-300 text-red-700 hover:bg-red-50'
                        }`}
                        onClick={() => handleFeedback('dislike')}
                        disabled={!!feedbackGiven}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Not Helpful
                      </Button>
                    </div>
                  </div>

                  {/* Feedback Notes */}
                  <AnimatePresence>
                    {!feedbackGiven && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <textarea
                          placeholder={t('add_feedback_note') || 'Help us improve: share your thoughts about this recommendation...'}
                          className="w-full text-sm p-3 rounded-xl border-2 border-gray-200 bg-white resize-none min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleSaveNote} 
                            disabled={!note.trim()}
                            className="font-semibold"
                          >
                            {t('save') || 'Save Note'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
          <div className="relative">
            {property.image_url && (
              <div className="relative h-96 w-full">
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            
            <DialogHeader className="absolute top-6 left-6 right-6">
              <DialogTitle className="text-3xl font-bold text-white drop-shadow-lg">
                {property.title || 'Property Details'}
              </DialogTitle>
              <DialogDescription className="text-white/90 drop-shadow-lg text-lg">
                {property.location || 'Addis Ababa'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {property.price ? formatCurrency(Number(property.price)) : '15,000'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</div>
              </div>
              
              <div className="text-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <Home className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{property.house_type || 'House'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Property Type</div>
              </div>

              {property.bedrooms && (
                <div className="text-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                  <Bed className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
                </div>
              )}

              {property.distance && (
                <div className="text-center p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                  <Navigation className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{property.distance.toFixed(1)} km</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Distance</div>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.preview_url && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Location</h3>
                <iframe
                  src={/^https?:/i.test(property.preview_url) ? property.preview_url : `${SEARCH_BASE}${property.preview_url}`}
                  className="w-full h-96 rounded-2xl border-0 shadow-lg"
                  title="Property Location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};