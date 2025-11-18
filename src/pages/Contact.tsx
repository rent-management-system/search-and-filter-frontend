import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Contact() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Get in touch with our team. We're here to help!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">contact@rentai.et</p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-sm text-muted-foreground">+251 911 123 456</p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Office</h3>
                <p className="text-sm text-muted-foreground">Bole, Addis Ababa</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-premium">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Business Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
