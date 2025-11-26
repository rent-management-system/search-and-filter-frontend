import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        properties: 'Properties',
        about: 'About',
        contact: 'Contact',
        dashboard: 'Dashboard',
        logout: 'Logout',
      },
      hero: {
        title: 'Your AI Rent Management System',
        beta: 'βeta',
        subtitle: 'Find your perfect home with intelligent recommendations powered by AI',
        addProperties: 'search Properties',
        viewProperties: 'View Properties',
      },
      // Language selector
      select_language: 'Select language',
      amharic_option: 'Amharic',
      english_option: 'English',
      afan_oromo_option: 'Afan Oromo',
      // Footer and common labels
      footer_title: 'RentAI',
      footer_description: 'Smart rental recommendations for Ethiopia.',
      quickLinks: 'Quick Links',
      resources: 'Resources',
      contactUs: 'Contact Us',
      testimonials: 'Testimonials',
      faq: 'FAQ',
      termsOfService: 'Terms of Service',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved',
      for_landlords_link: 'For Landlords',
      properties: {
        aiRecommendations: 'AI Recommendations',
        browseAll: 'Browse All',
        filters: 'Filters',
        sortBy: 'Sort By',
        distance: 'Distance',
        price: 'Price',
        viewDetails: 'View Details',
        viewOnMap: 'View on Map',
        noResults: 'No properties found',
      },
      aiForm: {
        step1: 'Location & Job',
        step2: 'Budget & Family',
        step3: 'Preferences',
        jobLocation: 'Job/School Location',
        salary: 'Monthly Salary',
        houseType: 'House Type',
        familySize: 'Family Size',
        amenities: 'Amenities',
        language: 'Language',
        generate: 'Generate Recommendations',
        back: 'Back',
        next: 'Next',
      },
      dashboard: {
        savedSearches: 'My Saved Searches',
        recommendationHistory: 'Recommendation History',
        noData: 'No data yet',
      },
    },
  },
  am: {
    translation: {
      nav: {
        home: 'መነሻ',
        properties: 'ንብረቶች',
        about: 'ስለ እኛ',
        contact: 'አድራሻ',
        dashboard: 'ዳሽቦርድ',
        logout: 'ውጣ',
      },
      hero: {
        title: 'የእርስዎ AI ኪራይ አስተዳደር ስርዓት',
        beta: 'βeta',
        subtitle: 'በ AI የተጎላበተ ጥበበኛ ምክሮች ጋር ምርጥ ቤትዎን ያግኙ',
        addProperties: 'ንብረቶችን ያክሉ',
        viewProperties: 'ንብረቶችን ይመልከቱ',
      },
      // Language selector
      select_language: 'ቋንቋ ይምረጡ',
      amharic_option: 'አማርኛ',
      english_option: 'እንግሊዝኛ',
      afan_oromo_option: 'አፋን ኦሮሞ',
      // Footer and common labels
      footer_title: 'RentAI',
      footer_description: 'ለኢትዮጵያ ጥበበኛ የኪራይ ምክሮች።',
      quickLinks: 'ፈጣን አገናኞች',
      resources: 'ሀብት',
      contactUs: 'ያግኙን',
      testimonials: 'ምስክሮች',
      faq: 'ተደጋጋሚ ጥያቄዎች',
      termsOfService: 'የአገልግሎት ውሎች',
      followUs: 'ተከተሉን',
      allRightsReserved: 'ሁሉም መብቶች የተጠበቁ ናቸው',
      for_landlords_link: 'ለባለቤቶች',
      properties: {
        aiRecommendations: 'AI ምክሮች',
        browseAll: 'ሁሉንም አሰስ',
        filters: 'ማጣሪያዎች',
        sortBy: 'አደራጅ በ',
        distance: 'ርቀት',
        price: 'ዋጋ',
        viewDetails: 'ዝርዝሮችን ይመልከቱ',
        viewOnMap: 'በካርታ ላይ ይመልከቱ',
        noResults: 'ምንም ንብረት አልተገኘም',
      },
      aiForm: {
        step1: 'አድራሻ እና ስራ',
        step2: 'በጀት እና ቤተሰብ',
        step3: 'ምርጫዎች',
        jobLocation: 'የስራ/ትምህርት ቤት አድራሻ',
        salary: 'ወርሃዊ ደሞዝ',
        houseType: 'የቤት አይነት',
        familySize: 'የቤተሰብ መጠን',
        amenities: 'አገልግሎቶች',
        language: 'ቋንቋ',
        generate: 'ምክሮችን ፍጠር',
        back: 'ተመለስ',
        next: 'ቀጣይ',
      },
      dashboard: {
        savedSearches: 'የተቀመጡ ፍለጋዎች',
        recommendationHistory: 'የምክር ታሪክ',
        noData: 'እስካሁን መረጃ የለም',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
