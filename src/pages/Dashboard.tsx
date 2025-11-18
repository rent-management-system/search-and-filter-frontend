import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import { recommendationAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { History, BookmarkCheck } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['my-recommendations'],
    queryFn: recommendationAPI.getMine,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">{t('nav.dashboard')}</h1>
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
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : recommendations?.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec: any, idx: number) => (
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
    </div>
  );
}
