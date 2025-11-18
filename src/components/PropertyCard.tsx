import { useMemo, useState } from 'react';
import { MapPin, Heart, ThumbsDown, Car, DollarSign, Home, Award, CheckCircle2 } from 'lucide-react';
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

export const PropertyCard = ({ property, showAIReason, onFeedback }: PropertyCardProps) => {
  const { t } = useTranslation();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);
  const [note, setNote] = useState('');
  const [likes, setLikes] = useState<number>(property.like_count ?? 0);
  const [dislikes, setDislikes] = useState<number>(property.dislike_count ?? 0);

  // Parse AI reason into structured points, if possible
  const aiPoints = useMemo(() => {
    const text: string = property.ai_reason || '';
    if (!text) return null;
    // Very light parsing to extract numbers/text segments commonly present
    // Example input: "1) Fit: Located 0.0 km from Bole; transport ~400.0 ETB/month; rent 1500.0 ETB. 2) Family/Home: Apartment type; amenities: wifi and parking. 3) Value: Remaining after rent+transport ≈ -667.0 ETB."
    const distanceMatch = text.match(/([0-9]+\.?[0-9]*)\s*km/i);
    const transportMatch = text.match(/transport\s*[~≈]?\s*([0-9]+\.?[0-9]*)\s*ETB/i);
    const rentMatch = text.match(/rent\s*([0-9]+\.?[0-9]*)\s*ETB/i);
    const typeMatch = text.match(/(Apartment|House|Villa|Studio)/i);
    const amenitiesMatch = text.match(/amenities?:\s*([^\.]+)/i);
    const remainingMatch = text.match(/remaining.*?([+\-]?[0-9]+\.?[0-9]*)\s*ETB/i);

    return {
      distanceKm: distanceMatch ? parseFloat(distanceMatch[1]) : undefined,
      transportETB: transportMatch ? parseFloat(transportMatch[1]) : undefined,
      rentETB: rentMatch ? parseFloat(rentMatch[1]) : undefined,
      houseType: typeMatch ? typeMatch[1] : undefined,
      amenitiesText: amenitiesMatch ? amenitiesMatch[1].trim() : undefined,
      remainingETB: remainingMatch ? parseFloat(remainingMatch[1]) : undefined,
    };
  }, [property.ai_reason]);

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
        // Update counters locally
        if (feedback === 'like') setLikes((v) => v + 1);
        else setDislikes((v) => v + 1);
        toast.success('Feedback submitted!');
      } else {
        // Fallback: send minimal payload if parent didn't provide handler
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
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden hover-lift group cursor-pointer">
          <div className="relative aspect-video bg-muted overflow-hidden">
            { (property.image_url || (property.images && property.images[0])) ? (
              <img
                src={property.image_url || property.images[0]}
                alt={property.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-4xl text-muted-foreground/30">🏠</span>
              </div>
            )}
            {/* House type */}
            <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur">
              {property.house_type || 'House'}
            </Badge>

            {/* Approved flag */}
            {(property.approved || property.status === 'APPROVED') && (
              <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-0 shadow-md flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approved
              </Badge>
            )}

            {/* Rank badge */}
            {property.rank && (
              <div className="absolute bottom-3 left-3">
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                  property.rank === 1
                    ? 'bg-yellow-500 text-white'
                    : property.rank === 2
                    ? 'bg-gray-400 text-white'
                    : property.rank === 3
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-700 text-white'
                }`}>
                  <Award className="h-3.5 w-3.5" />
                  {property.rank}{property.rank === 1 ? 'st' : property.rank === 2 ? 'nd' : property.rank === 3 ? 'rd' : 'th'}
                </div>
              </div>
            )}
          </div>
          
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{property.title || 'Property'}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.location || 'Addis Ababa'}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">{property.price || '15,000'} ETB</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>

              {property.distance && (
                <p className="text-sm text-muted-foreground">
                  {property.distance.toFixed(1)} km from location
                </p>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {property.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{property.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {showAIReason && (property.ai_reason || aiPoints) && (
                <div className="p-4 rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-700 border-slate-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">AI Recommendation</p>
                  {aiPoints ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-slate-200/60 dark:border-gray-700/60">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Fit</div>
                          <div className="text-xs text-muted-foreground">
                            {aiPoints.distanceKm !== undefined ? `${aiPoints.distanceKm} km` : '—'}; {aiPoints.transportETB !== undefined ? `~${aiPoints.transportETB} ETB transport` : '—'}; {aiPoints.rentETB !== undefined ? `${aiPoints.rentETB} ETB rent` : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-slate-200/60 dark:border-gray-700/60">
                        <Home className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Home</div>
                          <div className="text-xs text-muted-foreground">
                            {aiPoints.houseType || '—'}; {aiPoints.amenitiesText || 'amenities: —'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-slate-200/60 dark:border-gray-700/60">
                        <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Value</div>
                          <div className="text-xs text-muted-foreground">
                            Remaining ≈ {aiPoints.remainingETB !== undefined ? `${aiPoints.remainingETB} ETB` : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{property.ai_reason}</p>
                  )}
                </div>
              )}

              {property.transport_cost && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transport cost:</span>
                  <span className="font-medium">{property.transport_cost} ETB/month</span>
                </div>
              )}

              {property.affordability_score && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Affordability:</span>
                  <span className="font-medium">{property.affordability_score}%</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailsOpen(true)}
                >
                  {t('properties.viewDetails')}
                </Button>
                {property.preview_url && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = /^https?:/i.test(property.preview_url)
                        ? property.preview_url
                        : `${SEARCH_BASE}${property.preview_url}`;
                      window.open(url, '_blank');
                    }}
                  >
                    {t('properties.viewOnMap')}
                  </Button>
                )}
              </div>

              {showAIReason && (
                <div className="pt-3 border-t space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Heart className="h-3.5 w-3.5" /> {likes}
                      <ThumbsDown className="h-3.5 w-3.5" /> {dislikes}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={feedbackGiven === 'like' ? 'default' : 'outline'}
                        size="sm"
                        className="border-2"
                        onClick={() => handleFeedback('like')}
                        disabled={!!feedbackGiven}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {t('like') || 'Like'}
                      </Button>
                      <Button
                        variant={feedbackGiven === 'dislike' ? 'default' : 'outline'}
                        size="sm"
                        className="border-2"
                        onClick={() => handleFeedback('dislike')}
                        disabled={!!feedbackGiven}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {t('dislike') || 'Dislike'}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <textarea
                      placeholder={t('add_feedback_note') || 'Add an optional note about this recommendation...'}
                      className="w-full text-sm p-2 rounded-md border bg-background resize-y min-h-[70px]"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={!!feedbackGiven}
                    />
                    <div className="flex justify-end mt-2 gap-2">
                      {!onFeedback && (
                        <Button size="sm" variant="secondary" onClick={() => handleFeedback('like')} disabled={!!feedbackGiven}>
                          {t('submit_feedback') || 'Submit Feedback'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={handleSaveNote} disabled={!note || !!feedbackGiven}>
                        {t('save') || 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{property.title || 'Property Details'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {property.image_url && (
              <img
                src={property.image_url}
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold">{property.price || '15,000'} ETB/month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold">{property.house_type || 'House'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{property.location || 'Addis Ababa'}</p>
              </div>
              {property.distance && (
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-semibold">{property.distance.toFixed(1)} km</p>
                </div>
              )}
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {property.preview_url && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Location Map</p>
                <iframe
                  src={/^https?:/i.test(property.preview_url) ? property.preview_url : `${SEARCH_BASE}${property.preview_url}`}
                  className="w-full h-96 rounded-lg border"
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
