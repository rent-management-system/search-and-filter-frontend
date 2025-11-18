import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertyAPI } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function PropertyDetail() {
  const { id } = useParams();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyAPI.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Property not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PropertyCard property={property} />
        </motion.div>
      </div>
    </div>
  );
}
