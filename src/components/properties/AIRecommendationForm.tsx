import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AIFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const amenitiesOptions = [
  'WiFi',
  'Parking',
  'Security',
  'Water Supply',
  'Electricity Backup',
  'Garden',
  'Balcony',
  'Furnished',
];

const houseTypes = ['apartment', 'house', 'villa', 'studio'];

export const AIRecommendationForm = ({ onSubmit, isLoading }: AIFormProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    job_school_location: '',
    salary: '',
    house_type: '',
    family_size: '1',
    preferred_amenities: [] as string[],
    language: 'en',
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_amenities: prev.preferred_amenities.includes(amenity)
        ? prev.preferred_amenities.filter((a) => a !== amenity)
        : [...prev.preferred_amenities, amenity],
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      salary: parseFloat(formData.salary),
      family_size: parseInt(formData.family_size),
      preferred_amenities: formData.preferred_amenities.map((amenity) =>
        amenity.toLowerCase().replace(/ /g, '_')
      ),
    });
  };

  const canProceedStep1 = formData.job_school_location && formData.salary;
  const canProceedStep2 = formData.house_type && formData.family_size;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {t('aiForm.step_of_total', { step, total: totalSteps })}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('aiForm.step1')}</h2>
              <p className="text-muted-foreground">{t('aiForm.step1_description')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="job_school_location">{t('aiForm.jobLocation')}</Label>
                <Input
                  id="job_school_location"
                  placeholder="e.g., Bole, Piassa, Merkato"
                  value={formData.job_school_location}
                  onChange={(e) => setFormData({ ...formData, job_school_location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="salary">{t('aiForm.salary')} (ETB)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="e.g., 15000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('aiForm.step2')}</h2>
              <p className="text-muted-foreground">{t('aiForm.step2_description')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="house_type">{t('aiForm.houseType')}</Label>
                <Select
                  value={formData.house_type}
                  onValueChange={(value) => setFormData({ ...formData, house_type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('aiForm.placeholder_select_house_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {houseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`aiForm.houseType_options.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="family_size">{t('aiForm.familySize')}</Label>
                <Select
                  value={formData.family_size}
                  onValueChange={(value) => setFormData({ ...formData, family_size: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}{' '}
                        {num === 1
                          ? t('aiForm.family_size_options.person')
                          : t('aiForm.family_size_options.people')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('aiForm.step3')}</h2>
              <p className="text-muted-foreground">{t('aiForm.step3_description')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">{t('aiForm.amenities')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {amenitiesOptions.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={amenity}
                        checked={formData.preferred_amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <label
                        htmlFor={amenity}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {t(`aiForm.amenities_options.${amenity}`)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="language">{t('aiForm.language')}</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('aiForm.placeholder_select_language')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('english_option')}</SelectItem>
                    <SelectItem value="am">{t('amharic_option')}</SelectItem>
                    <SelectItem value="or">{t('afan_oromo_option')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack} disabled={isLoading} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('aiForm.back')}
          </Button>
        )}
        
        {step < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
            className="w-full sm:flex-1"
          >
            {t('aiForm.next')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:flex-1">
            <Sparkles className="mr-2 h-4 w-4" />
            {t('aiForm.generate')}
          </Button>
        )}
      </div>
    </div>
  );
};
