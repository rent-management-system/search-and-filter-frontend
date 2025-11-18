import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-4">About RentAI</h1>
            <p className="text-lg text-muted-foreground">
              Ethiopia's premier AI-powered rental management platform
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <p>
              RentAI is revolutionizing the rental property market in Ethiopia by combining
              cutting-edge artificial intelligence with deep local market knowledge. Our platform
              helps both tenants and landlords make smarter decisions faster.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
            <p>
              To make finding and managing rental properties effortless, transparent, and
              accessible to everyone in Ethiopia through the power of AI technology.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">What We Do</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>AI-powered property recommendations based on your unique needs</li>
              <li>Intelligent location analysis considering work commute and transport costs</li>
              <li>Budget optimization to help you find affordable options</li>
              <li>Comprehensive property database across Addis Ababa</li>
              <li>Multi-language support for all Ethiopians</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us?</h2>
            <p>
              Unlike traditional property search platforms, RentAI understands the Ethiopian
              context. We factor in local transportation, neighborhood characteristics, and
              cost-of-living considerations to provide truly personalized recommendations.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
