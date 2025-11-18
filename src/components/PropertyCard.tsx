import { useMemo, useState } from 'react';
import { MapPin, Heart, ThumbsDown, Car, DollarSign, Home, Award, CheckCircle2, Star, Navigation, Bed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
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

    return {
      distanceKm: distanceMatch ? parseFloat(distanceMatch[1].replace(',', '')) : undefined,
      transportETB: transportMatch ? parseFloat(transportMatch[1].replace(',', '')) : undefined,
      rentETB: rentMatch ? parseFloat(rentMatch[1].replace(',', '')) : undefined,
      houseType: typeMatch ? typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1) : undefined,
      amenitiesText: amenitiesMatch ? amenitiesMatch[1].trim().replace(/^(?:with|including)\s+/i, '') : undefined,
      remainingETB: remainingMatch ? parseFloat(remainingMatch[1].replace(',', '')) : undefined,
      fitScore: fitMatch ? parseInt(fitMatch[1]) : undefined,
      valueScore: valueMatch ? parseInt(valueMatch[1]) : undefined,
    };
  }, [property.ai_reason]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET').format(amount);
  };

  // Get affordability color based on score
  const getAffordabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-0 shadow-md">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
            {(property.image_url || (property.images && property.images[0])) ? (
              <img
                src={property.image_url || property.images[0]}
                alt={property.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <Home className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* House type badge */}
            <Badge className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 border-0 font-semibold shadow-sm">
              {property.house_type || 'Property'}
            </Badge>

            {/* Approved flag */}
            {(property.approved || property.status === 'APPROVED') && (
              <Badge className="absolute top-3 left-3 bg-green-600 text-white border-0 shadow-md flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </Badge>
            )}

            {/* Rank badge */}
            {property.rank && (
              <div className="absolute bottom-3 left-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                  property.rank === 1
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                    : property.rank === 2
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    : property.rank === 3
                    ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                }`}>
                  <Award className="h-4 w-4" />
                  #{property.rank}
                </div>
              </div>
            )}

            {/* Price overlay */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <p className="font-bold text-lg text-gray-900">{property.price ? formatCurrency(Number(property.price)) : '15,000'} ETB</p>
              <p className="text-xs text-gray-600">per month</p>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Title and Location */}
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">
                  {property.title || 'Modern Property'}
                </h3>
                <div className="flex items-center text-gray-600 dark:text-gray-300 mt-2">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate">{property.location || 'Addis Ababa, Ethiopia'}</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 py-2">
                {property.distance && (
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-gray-500">Distance</div>
                      <div className="font-semibold">{property.distance.toFixed(1)} km</div>
                    </div>
                  </div>
                )}
                
                {property.bedrooms && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-gray-500">Bedrooms</div>
                      <div className="font-semibold">{property.bedrooms}</div>
                    </div>
                  </div>
                )}

                {property.transport_cost && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="text-gray-500">Transport</div>
                      <div className="font-semibold">{formatCurrency(property.transport_cost)} ETB</div>
                    </div>
                  </div>
                )}

                {property.affordability_score && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="text-gray-500">Affordability</div>
                      <div className={`font-semibold ${getAffordabilityColor(property.affordability_score)}`}>
                        {property.affordability_score}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Key Features</p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 4 && (
                      <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                        +{property.amenities.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* AI Recommendation Section - Much Improved */}
              {showAIReason && (property.ai_reason || aiPoints) && (
                <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      AI Recommendation
                    </p>
                    {aiPoints?.fitScore && (
                      <Badge className="ml-auto bg-blue-600 text-white border-0">
                        {aiPoints.fitScore}% Match
                      </Badge>
                    )}
                  </div>
                  
                  {aiPoints ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {/* Location & Fit */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/60">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Location Fit</div>
                          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            {aiPoints.distanceKm !== undefined && (
                              <div>📍 {aiPoints.distanceKm} km from target</div>
                            )}
                            {aiPoints.transportETB !== undefined && (
                              <div>🚌 ~{formatCurrency(aiPoints.transportETB)} ETB/month</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Property Features */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/60">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-green-900 dark:text-green-100 mb-1">Property</div>
                          <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                            {aiPoints.houseType && <div>🏠 {aiPoints.houseType}</div>}
                            {aiPoints.amenitiesText && (
                              <div className="truncate">✨ {aiPoints.amenitiesText}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Value & Budget */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/60">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Value</div>
                          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                            {aiPoints.rentETB !== undefined && (
                              <div>💰 {formatCurrency(aiPoints.rentETB)} ETB rent</div>
                            )}
                            {aiPoints.remainingETB !== undefined && (
                              <div className={aiPoints.remainingETB >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ⚖️ {aiPoints.remainingETB >= 0 ? '+' : ''}{formatCurrency(aiPoints.remainingETB)} ETB remaining
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {property.ai_reason}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                  onClick={() => setDetailsOpen(true)}
                >
                  {t('properties.viewDetails') || 'View Details'}
                </Button>
                {property.preview_url && (
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      const url = /^https?:/i.test(property.preview_url)
                        ? property.preview_url
                        : `${SEARCH_BASE}${property.preview_url}`;
                      window.open(url, '_blank');
                    }}
                  >
                    {t('properties.viewOnMap') || 'Map'}
                  </Button>
                )}
              </div>

              {/* Feedback Section */}
              {showAIReason && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsDown className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{dislikes}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={feedbackGiven === 'like' ? 'default' : 'outline'}
                        size="sm"
                        className={`border-2 transition-all ${
                          feedbackGiven === 'like' 
                            ? 'bg-green-600 border-green-600 hover:bg-green-700' 
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                        onClick={() => handleFeedback('like')}
                        disabled={!!feedbackGiven}
                      >
                        <Heart className="h-4 w-4 mr-1.5" />
                        {t('like') || 'Helpful'}
                      </Button>
                      <Button
                        variant={feedbackGiven === 'dislike' ? 'default' : 'outline'}
                        size="sm"
                        className={`border-2 transition-all ${
                          feedbackGiven === 'dislike' 
                            ? 'bg-red-600 border-red-600 hover:bg-red-700' 
                            : 'border-red-200 text-red-700 hover:bg-red-50'
                        }`}
                        onClick={() => handleFeedback('dislike')}
                        disabled={!!feedbackGiven}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1.5" />
                        {t('dislike') || 'Not Helpful'}
                      </Button>
                    </div>
                  </div>

                  {/* Feedback Notes */}
                  {!feedbackGiven && (
                    <div className="space-y-2">
                      <textarea
                        placeholder={t('add_feedback_note') || 'Help us improve: share your thoughts about this recommendation...'}
                        className="w-full text-sm p-3 rounded-lg border border-gray-300 bg-white resize-none min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleSaveNote} 
                          disabled={!note.trim()}
                        >
                          {t('save') || 'Save Note'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {property.title || 'Property Details'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {property.image_url && (
              <div className="relative h-80 rounded-xl overflow-hidden">
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="font-bold text-lg text-gray-900">{property.price ? formatCurrency(Number(property.price)) : '15,000'} ETB</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-semibold text-gray-900">{property.house_type || 'House'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-semibold text-gray-900">{property.location || 'Addis Ababa'}</p>
              </div>
              {property.distance && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Distance</p>
                  <p className="font-semibold text-gray-900">{property.distance.toFixed(1)} km</p>
                </div>
              )}
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-3">Amenities & Features</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.preview_url && (
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-3">Location</p>
                <iframe
                  src={/^https?:/i.test(property.preview_url) ? property.preview_url : `${SEARCH_BASE}${property.preview_url}`}
                  className="w-full h-96 rounded-xl border-0 shadow-sm"
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