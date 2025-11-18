import { useState } from 'react';
import { MapPin, Heart, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { recommendationAPI } from '@/lib/api';
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

  const handleFeedback = async (feedback: 'like' | 'dislike') => {
    try {
      if (onFeedback) {
        await onFeedback(feedback);
        setFeedbackGiven(feedback);
        toast.success('Feedback submitted!');
      } else {
        // Fallback: send minimal payload if parent didn't provide handler
        await recommendationAPI.sendFeedback({
          tenant_preference_id: 0,
          property_id: property.id,
          liked: feedback === 'like',
        });
        setFeedbackGiven(feedback);
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
            {property.image_url ? (
              <img
                src={property.image_url}
                alt={property.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-4xl text-muted-foreground/30">🏠</span>
              </div>
            )}
            <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur">
              {property.house_type || 'House'}
            </Badge>
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

              {showAIReason && property.ai_reason && (
                <div className="p-3 bg-accent/10 rounded-md border border-accent/20">
                  <p className="text-xs text-muted-foreground mb-1">AI Recommendation:</p>
                  <p className="text-sm">{property.ai_reason}</p>
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
                    onClick={() => window.open(property.preview_url, '_blank')}
                  >
                    {t('properties.viewOnMap')}
                  </Button>
                )}
              </div>

              {showAIReason && onFeedback && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant={feedbackGiven === 'like' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleFeedback('like')}
                    disabled={!!feedbackGiven}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Like
                  </Button>
                  <Button
                    variant={feedbackGiven === 'dislike' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleFeedback('dislike')}
                    disabled={!!feedbackGiven}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Dislike
                  </Button>
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
                  src={property.preview_url}
                  className="w-full h-96 rounded-lg border"
                  title="Property Location"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
