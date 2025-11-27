import { useMemo, useState } from 'react';
import { MapPin, Heart, ThumbsUp, ThumbsDown, Car, DollarSign, Home, Award, CheckCircle2, Star, Navigation, Bed, Bath, Ruler, Wifi, Car as CarIcon, Utensils, Phone, Mail, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { recommendationAPI, SEARCH_BASE } from '@/lib/api';
import { toast } from 'sonner';
import { MapView } from '@/components/MapView';
import { useAuthStore } from '@/lib/store';

interface PropertyCardProps {
  property: any;
  showAIReason?: boolean;
  onFeedback?: (feedback: 'like' | 'dislike') => void;
  showContactOwner?: boolean;
  tenantPreferenceId?: number | null;
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

export const PropertyCard = ({ property, showAIReason, onFeedback, showContactOwner, tenantPreferenceId }: PropertyCardProps) => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuthStore();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);
  const [note, setNote] = useState('');
  const [likes, setLikes] = useState<number>(property.like_count ?? 0);
  const [dislikes, setDislikes] = useState<number>(property.dislike_count ?? 0);

  // Check if property has valid coordinates for Gebeta Maps
  const hasValidCoordinates = useMemo(() => {
    return property.lat && property.lon && 
           typeof property.lat === 'number' && 
           typeof property.lon === 'number' &&
           !isNaN(property.lat) && 
           !isNaN(property.lon);
  }, [property.lat, property.lon]);

  // Compute full image URL from backend
  const imageUrl = useMemo(() => {
    // Check multiple possible field names for images
    const raw = property.image_url || 
                property.photo || 
                property.photos?.[0] || 
                (property.images && property.images.length > 0 ? property.images[0] : null);
    if (!raw) return null;
    // If it's already a full URL, return it
    if (/^https?:/i.test(raw)) return raw;
    // Otherwise, construct full URL from backend base
    return `${SEARCH_BASE}${raw.startsWith('/') ? raw : '/' + raw}`;
  }, [property.image_url, property.photo, property.photos, property.images]);

  // Get property ID with fallback options
  const propertyId = useMemo(() => {
    return property.id || property._id || property.property_id || property.propertyId;
  }, [property.id, property._id, property.property_id, property.propertyId]);

  // Extract owner contact information from nested object or direct properties
  const ownerContact = useMemo(() => {
    console.log('=== PropertyCard Owner Contact Debug ===');
    console.log('Property ID:', propertyId);
    console.log('Property Title:', property.title);
    console.log('Full property object:', property);
    console.log('Owner contact fields:', {
      owner_contact: property.owner_contact,
      owner: property.owner,
      contact: property.contact,
      owner_name: property.owner_name,
      owner_phone: property.owner_phone,
      owner_email: property.owner_email,
      phone: property.phone,
      contact_phone: property.contact_phone,
      landlord: property.landlord,
      landlord_phone: property.landlord_phone,
      landlord_email: property.landlord_email,
    });
    
    let extractedContact: { name?: string; email?: string; phone?: string } = {};
    
    // Priority 1: owner_contact object
    if (property.owner_contact && typeof property.owner_contact === 'object') {
      extractedContact = {
        name: property.owner_contact.name || property.owner_contact.full_name,
        email: property.owner_contact.email,
        phone: property.owner_contact.phone || property.owner_contact.phone_number || property.owner_contact.phoneNumber,
      };
    }
    // Priority 2: owner object
    else if (property.owner && typeof property.owner === 'object') {
      extractedContact = {
        name: property.owner.name || property.owner.full_name || property.owner.fullName,
        email: property.owner.email,
        phone: property.owner.phone || property.owner.phone_number || property.owner.phoneNumber,
      };
    }
    // Priority 3: contact object
    else if (property.contact && typeof property.contact === 'object') {
      extractedContact = {
        name: property.contact.name || property.contact.full_name,
        email: property.contact.email,
        phone: property.contact.phone || property.contact.phone_number,
      };
    }
    // Priority 4: landlord object
    else if (property.landlord && typeof property.landlord === 'object') {
      extractedContact = {
        name: property.landlord.name || property.landlord.full_name,
        email: property.landlord.email,
        phone: property.landlord.phone || property.landlord.phone_number,
      };
    }
    // Priority 5: Direct flat properties
    else {
      extractedContact = {
        name: property.owner_name || property.ownerName || property.landlord_name || property.landlordName || 'Property Owner',
        email: property.owner_email || property.ownerEmail || property.landlord_email || property.landlordEmail,
        phone: property.owner_phone || property.ownerPhone || property.phone || property.contact_phone || property.contactPhone || property.landlord_phone || property.landlordPhone,
      };
    }
    
    console.log('Extracted contact:', extractedContact);
    console.log('========================================');
    
    return extractedContact;
  }, [property, propertyId]);

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
    
    // Check authentication
    if (!isAuthenticated || !token) {
      toast.error('Please sign in to save feedback', {
        description: 'You need to be authenticated to provide feedback on properties.',
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/'
        }
      });
      return;
    }
    
    if (!tenantPreferenceId) {
      toast.error('Cannot save feedback: Missing preference ID');
      console.error('Missing tenant_preference_id for property:', property);
      return;
    }
    
    if (!propertyId) {
      toast.error('Cannot save feedback: Invalid property ID');
      console.error('Missing property ID. Checked fields: id, _id, property_id, propertyId. Property:', property);
      return;
    }
    
    try {
      console.log('Sending feedback:', {
        tenant_preference_id: tenantPreferenceId,
        property_id: propertyId,
        liked: false,
        note,
      });
      await recommendationAPI.sendFeedback({
        tenant_preference_id: tenantPreferenceId,
        property_id: propertyId,
        liked: false,
        note,
      });
      toast.success('Feedback saved!');
    } catch (e: any) {
      console.error('Save note error:', e);
      console.error('Error response:', e?.response?.data);
      toast.error('Failed to save feedback');
    }
  };

  const handleFeedback = async (feedback: 'like' | 'dislike') => {
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
    
    try {
      if (onFeedback) {
        await onFeedback(feedback);
        setFeedbackGiven(feedback);
        if (feedback === 'like') setLikes((v) => v + 1);
        else setDislikes((v) => v + 1);
        toast.success('Feedback submitted!');
      } else {
        if (!tenantPreferenceId) {
          toast.error('Cannot submit feedback: Missing preference ID');
          console.error('Missing tenant_preference_id for property:', property);
          return;
        }
        
        if (!propertyId) {
          toast.error('Cannot submit feedback: Invalid property ID');
          console.error('Missing property ID. Checked fields: id, _id, property_id, propertyId. Property:', property);
          return;
        }
        
        console.log('Sending feedback:', {
          tenant_preference_id: tenantPreferenceId,
          property_id: propertyId,
          liked: feedback === 'like',
          note: note || undefined,
        });
        
        await recommendationAPI.sendFeedback({
          tenant_preference_id: tenantPreferenceId,
          property_id: propertyId,
          liked: feedback === 'like',
          note: note || undefined,
        });
        setFeedbackGiven(feedback);
        if (feedback === 'like') setLikes((v) => v + 1);
        else setDislikes((v) => v + 1);
        toast.success('Feedback submitted!');
      }
    } catch (error: any) {
      console.error('Feedback error:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Property data:', property);
      
      // Handle 401 specifically
      if (error?.response?.status === 401) {
        toast.error('Authentication expired', {
          description: 'Please sign in again to continue.',
          action: {
            label: 'Sign In',
            onClick: () => window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/'
          }
        });
      } else {
        const errorMsg = error?.response?.data?.message || error?.message || 'Failed to submit feedback';
        toast.error(errorMsg);
      }
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
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border bg-card">
          {/* Image Section */}
          <div className="relative aspect-[4/3] bg-muted/40 dark:bg-muted/20 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={property.title || t('property_card.property')}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Home className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
              {/* House type badge */}
              <Badge className="bg-white/95 backdrop-blur-sm text-gray-800 border-0 font-semibold shadow-lg">
                {property.house_type || t('property_card.property')}
              </Badge>

              {/* Approved flag */}
              {(property.approved || property.status === 'APPROVED') && (
                <Badge className="bg-green-600 text-white border-0 shadow-lg flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('property_card.verified')}
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
              <div className="bg-background/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-2xl text-foreground">
                      {property.price ? formatCurrency(Number(property.price)) : '15,000'} ETB
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">{t('property_card.per_month')}</p>
                  </div>
                  {property.affordability_score && (
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(property.affordability_score)}`}>
                        {property.affordability_score}%
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{t('property_card.affordable')}</p>
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
                <h3 className="font-bold text-xl text-foreground leading-tight line-clamp-2">
                  {property.title || t('property_card.modern_luxury_apartment')}
                </h3>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                  <span className="text-sm font-medium">{property.location || t('property_card.addis_ababa_ethiopia')}</span>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-3 gap-3 py-2">
                {property.bedrooms && (
                  <div className="text-center p-2 rounded-lg bg-muted/40 border border-border">
                    <Bed className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="text-sm font-semibold text-foreground">{property.bedrooms}</div>
                    <div className="text-xs text-muted-foreground">{t('property_card.beds')}</div>
                  </div>
                )}
                
                {property.bathrooms && (
                  <div className="text-center p-2 rounded-lg bg-muted/40 border border-border">
                    <Bath className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="text-sm font-semibold text-foreground">{property.bathrooms}</div>
                    <div className="text-xs text-muted-foreground">{t('property_card.baths')}</div>
                  </div>
                )}

                {property.area && (
                  <div className="text-center p-2 rounded-lg bg-muted/40 border border-border">
                    <Ruler className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="text-sm font-semibold text-foreground">{property.area}m²</div>
                    <div className="text-xs text-muted-foreground">{t('property_card.area')}</div>
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                {property.distance && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Navigation className="h-4 w-4 text-primary" />
                      <span>{t('property_card.distance_to_center')}</span>
                    </div>
                    <span className="font-semibold text-foreground">{property.distance.toFixed(1)} km</span>
                  </div>
                )}

                {property.transport_cost && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Car className="h-4 w-4 text-primary" />
                      <span>{t('property_card.monthly_transport')}</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(property.transport_cost)} ETB</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{t('property_card.key_features')}</p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-muted text-foreground/80 border flex items-center gap-1">
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                        +{property.amenities.length - 3} {t('property_card.more')}
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
                  className="rounded-2xl border bg-muted/40 p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-foreground">
                        {t('property_card.ai_recommendation')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('property_card.why_this_property_matches')}
                      </p>
                    </div>
                    {aiPoints?.fitScore && (
                      <Badge className="bg-primary text-primary-foreground border-0 text-sm px-3 py-1">
                        {t('property_card.match_percentage', { percentage: aiPoints.fitScore })}
                      </Badge>
                    )}
                  </div>
                  
                  {aiPoints ? (
                    <div className="space-y-4">
                      {/* Match Reasons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiPoints.matchReasons?.slice(0, 4).map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            {reason}
                          </div>
                        ))}
                      </div>

                      {/* Score Breakdown */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('property_card.location_match')}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={aiPoints.fitScore || 85} className="w-20 h-2" />
                            <span className="font-semibold text-foreground">{aiPoints.fitScore || 85}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('property_card.value_score')}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={aiPoints.valueScore || 78} className="w-20 h-2" />
                            <span className="font-semibold text-foreground">{aiPoints.valueScore || 78}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        {aiPoints.distanceKm !== undefined && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">{t('property_card.distance')}</div>
                            <div className="font-bold text-foreground">{aiPoints.distanceKm}km</div>
                          </div>
                        )}
                        {aiPoints.transportETB !== undefined && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">{t('property_card.transport')}</div>
                            <div className="font-bold text-foreground">{formatCurrency(aiPoints.transportETB)}</div>
                          </div>
                        )}
                        {aiPoints.remainingETB !== undefined && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">{t('property_card.remaining')}</div>
                            <div className={`font-bold ${aiPoints.remainingETB >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {aiPoints.remainingETB >= 0 ? '+' : ''}{formatCurrency(aiPoints.remainingETB)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {property.ai_reason}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => setDetailsOpen(true)}
                  >
                    {t('properties.viewDetails')}
                  </Button>
                  {hasValidCoordinates && (
                    <Button
                      variant="outline"
                      className="font-semibold"
                      onClick={() => setDetailsOpen(true)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {t('properties.viewOnMap')}
                    </Button>
                  )}
                </div>
                {showContactOwner && (
                  <Button
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                    onClick={() => setContactOpen(true)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {t('property_card.contact_owner')}
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
                        {t('property_card.helpful')}
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
                        {t('property_card.not_helpful')}
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
                          placeholder={t('property_card.add_feedback_note')}
                          className="w-full text-sm p-3 rounded-xl border border-input bg-background text-foreground resize-none min-h-[80px] focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
                            {t('property_card.save_note')}
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

      {/* Contact Owner Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t('property_card.contact_owner_title')}</DialogTitle>
            <DialogDescription>
              {t('property_card.contact_owner_description', { propertyTitle: property.title || t('property_card.this_property') })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Owner Information */}
            <div className="space-y-4">
              {ownerContact.name && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('property_card.owner_name')}</p>
                    <p className="font-semibold text-foreground">{ownerContact.name}</p>
                  </div>
                </div>
              )}
              
              {ownerContact.phone && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t('property_card.phone_number')}</p>
                    <p className="font-semibold text-foreground">{ownerContact.phone}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${ownerContact.phone}`, '_self')}
                  >
                    {t('property_card.call')}
                  </Button>
                </div>
              )}
              
              {ownerContact.email && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t('property_card.email_address')}</p>
                    <p className="font-semibold text-foreground text-sm">{ownerContact.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${ownerContact.email}`, '_blank')}
                  >
                    {t('property_card.email')}
                  </Button>
                </div>
              )}
              
              {!ownerContact.phone && !ownerContact.email && !ownerContact.name && (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t('property_card.contact_info_not_available')}</p>
                  <p className="text-sm mt-2">{t('property_card.check_back_later')}</p>
                </div>
              )}
            </div>
            
            {/* Property Quick Info */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 text-foreground">{t('property_card.property_details')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('property_card.price')}</p>
                  <p className="font-semibold text-foreground">{property.price ? formatCurrency(Number(property.price)) : t('property_card.n_a')} ETB/mo</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('property_card.type')}</p>
                  <p className="font-semibold text-foreground">{property.house_type || t('property_card.n_a')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('property_card.location')}</p>
                  <p className="font-semibold text-foreground">{property.location || t('property_card.n_a')}</p>
                </div>
                {property.distance && (
                  <div>
                    <p className="text-muted-foreground">{t('property_card.distance')}</p>
                    <p className="font-semibold text-foreground">{property.distance.toFixed(1)} km</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          <div className="relative">
            {imageUrl && (
              <div className="relative h-[28rem] w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={property.title || t('property_card.property')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            )}
            
            <DialogHeader className="absolute bottom-8 left-8 right-8">
              <DialogTitle className="text-4xl font-bold text-white drop-shadow-2xl mb-2">
                {property.title || t('property_card.property_details')}
              </DialogTitle>
              <DialogDescription className="text-white/95 drop-shadow-lg text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {property.location || 'Addis Ababa'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-10 bg-gradient-to-b from-background to-muted/20">
            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-5"
            >
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {property.price ? formatCurrency(Number(property.price)) : '15,000'} ETB
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-400">{t('property_card.monthly_rent')}</div>
              </div>
              
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-2 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Home className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.house_type || t('property_card.house')}</div>
                <div className="text-sm font-medium text-green-700 dark:text-green-400">{t('property_card.property_type')}</div>
              </div>

              {property.bedrooms && (
                <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bed className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.bedrooms}</div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-400">{t('property_card.bedrooms')}</div>
                </div>
              )}

              {property.distance && (
                <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Navigation className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.distance.toFixed(1)} km</div>
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-400">{t('property_card.distance')}</div>
                </div>
              )}
            </motion.div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                  <h3 className="text-3xl font-bold text-foreground">{t('property_card.amenities_features')}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-card border-2 border-border rounded-xl hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="font-semibold text-foreground">{amenity}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                <h3 className="text-3xl font-bold text-foreground">{t('property_card.location')}</h3>
              </div>
              {hasValidCoordinates ? (
                <div className="rounded-2xl overflow-hidden border-2 border-border shadow-xl">
                  <MapView
                    latitude={property.lat}
                    longitude={property.lon}
                    title={property.title || 'Property Location'}
                    zoom={15}
                    markerColor="#3B82F6"
                    showFullscreenButton={true}
                    className="h-[28rem]"
                  />
                </div>
              ) : (
                <div className="w-full h-96 rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-muted/50 to-muted/20 flex flex-col items-center justify-center gap-6 p-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>
                  <div className="text-center space-y-4 max-w-md">
                    <p className="font-bold text-foreground text-xl">
                      {property.location || t('property_card.location_info_available')}
                    </p>

                    <div className="space-y-2">
                      <p className="text-base text-muted-foreground font-semibold">
                        📍 {t('property_card.maps_not_supported')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('property_card.upgrade_to_pro')}
                      </p>
                    </div>
                    {(property.lat && property.lon) ? (
                      <div className="space-y-3 pt-2">
                        <p className="text-sm text-muted-foreground font-mono">
                          {t('property_card.coordinates')}: {property.lat.toFixed(6)}, {property.lon.toFixed(6)}
                        </p>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={() => window.open(`https://www.google.com/maps?q=${property.lat},${property.lon}`, '_blank')}
                          className="gap-2 shadow-lg hover:shadow-xl"
                        >
                          <MapPin className="h-5 w-5" />
                          {t('property_card.open_in_google_maps')}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};