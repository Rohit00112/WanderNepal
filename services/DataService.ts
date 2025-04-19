import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for our data models
export interface Destination {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  image: string;
  highlights: string[];
  bestTimeToVisit: string;
  duration: string;
  difficulty: string;
  type: 'destination' | 'trek' | 'experience' | 'cuisine';
  region?: string;
  elevation?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

// Initial sample data
const initialDestinations: Destination[] = [
  {
    id: 'dest-1',
    name: 'Upper Mustang',
    description: 'Ancient Buddhist kingdom with rich cultural heritage',
    fullDescription: 'Upper Mustang, a remote and mystical region of Nepal, was once the forbidden kingdom of Lo. This stark desert landscape holds centuries-old monasteries, cave dwellings, and traditional Tibetan Buddhist culture. The area remained isolated from the outside world until 1992.',
    image: 'https://images.unsplash.com/photo-1606466123170-d39e5346aa76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Visit the walled city of Lo Manthang',
      'Explore ancient Buddhist monasteries',
      'Experience traditional Tibetan culture',
      'Trek through dramatic desert landscapes'
    ],
    bestTimeToVisit: 'March to November',
    duration: '10-12 days',
    difficulty: 'Moderate to Challenging',
    type: 'destination',
    region: 'Western Nepal',
    reviews: [
      {
        id: '1',
        user: 'AdventureSeeker22',
        rating: 4.5,
        comment: 'An unforgettable cultural journey!',
        date: '2024-03-15'
      },
      {
        id: '2',
        user: 'TrekMaster',
        rating: 5,
        comment: 'Perfect mix of history and landscapes',
        date: '2024-02-28'
      }
    ]
  },
  {
    id: 'dest-2',
    name: 'Rara Lake',
    description: 'Pristine alpine lake in western Nepal',
    fullDescription: 'Rara Lake, the largest and deepest freshwater lake in Nepal, is a pristine alpine wonder surrounded by Rara National Park. The crystal-clear waters reflect the snow-capped peaks, while the surrounding forest hosts diverse wildlife.',
    image: 'https://images.unsplash.com/photo-1575450311950-5b4f69942332?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Boat on the crystal-clear waters',
      'Spot rare wildlife in Rara National Park',
      'Trek through pine and juniper forests',
      'Experience local Magar culture'
    ],
    bestTimeToVisit: 'September to November',
    duration: '7-8 days',
    difficulty: 'Moderate',
    type: 'destination',
    region: 'Western Nepal',
    reviews: [
      {
        id: '3',
        user: 'NatureLover',
        rating: 4.8,
        comment: 'Most pristine lake I\'ve ever seen',
        date: '2024-04-10'
      },
      {
        id: '4',
        user: 'HimalayanExplorer',
        rating: 4.2,
        comment: 'Peaceful and less crowded destination',
        date: '2024-05-01'
      }
    ]
  },
  {
    id: 'dest-3',
    name: 'Annapurna Base Camp',
    description: 'Iconic trek through diverse landscapes',
    fullDescription: 'The Annapurna Base Camp trek takes you through diverse landscapes, from lush bamboo forests to glacial basins. The trail passes through traditional villages, offering insights into local culture while leading to a natural amphitheater surrounded by towering peaks.',
    image: 'https://images.unsplash.com/photo-1585511582346-11428425708a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Reach the base camp at 4,130m',
      'Witness sunrise over the Annapurna range',
      'Experience local Gurung culture',
      'Trek through rhododendron forests'
    ],
    bestTimeToVisit: 'March to May, September to November',
    duration: '7-11 days',
    difficulty: 'Moderate to Challenging',
    type: 'trek',
    elevation: '4,130m',
    region: 'Central Nepal',
    reviews: [
      {
        id: '5',
        user: 'MountainClimber',
        rating: 4.7,
        comment: 'Breath-taking views of the Himalayas',
        date: '2024-04-22'
      },
      {
        id: '6',
        user: 'TrekEnthusiast',
        rating: 4.9,
        comment: 'Best trekking experience in Nepal',
        date: '2024-03-30'
      }
    ]
  },
  {
    id: 'trek-1',
    name: 'Everest Base Camp',
    description: 'World-famous trek to the foot of Mount Everest',
    fullDescription: 'The Everest Base Camp trek is a legendary journey that takes you through Sherpa villages, Buddhist monasteries, and stunning landscapes to the base of the world\'s highest mountain. Experience the rich Sherpa culture and breathtaking mountain vistas that have made this trek famous worldwide.',
    image: 'https://images.unsplash.com/photo-1544735716-ea9ef790f501?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Reach Everest Base Camp at 5,364m',
      'See spectacular views from Kala Patthar',
      'Visit Tengboche Monastery',
      'Experience traditional Sherpa culture'
    ],
    bestTimeToVisit: 'March to May, September to November',
    duration: '12-16 days',
    difficulty: 'Challenging',
    type: 'trek',
    elevation: '5,364m',
    region: 'Eastern Nepal',
    reviews: [
      {
        id: '7',
        user: 'SummitSeeker',
        rating: 5.0,
        comment: 'The ultimate trekking experience',
        date: '2024-03-05'
      },
      {
        id: '8',
        user: 'HikingPro',
        rating: 4.7,
        comment: 'Challenging but incredibly rewarding',
        date: '2024-05-10'
      }
    ]
  },
  {
    id: 'trek-2',
    name: 'Langtang Valley',
    description: 'Beautiful trek through rhododendron forests',
    fullDescription: 'The Langtang Valley trek offers incredible mountain scenery, diverse wildlife, and rich cultural experiences in Nepal\'s third most popular trekking area. The trail passes through forests filled with rhododendrons and bamboo, traditional Tamang villages, and ends with stunning views of snow-capped Himalayan peaks.',
    image: 'https://images.unsplash.com/photo-1606466123170-d39e5346aa76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Trek through beautiful rhododendron forests',
      'Experience Tamang culture',
      'Visit ancient Buddhist monasteries',
      'Views of Langtang Lirung (7,245m)'
    ],
    bestTimeToVisit: 'March to May, October to December',
    duration: '7-10 days',
    difficulty: 'Moderate',
    type: 'trek',
    elevation: '4,984m',
    region: 'Central Nepal',
    reviews: [
      {
        id: '9',
        user: 'NaturePhotographer',
        rating: 4.8,
        comment: 'The rhododendron forests in spring are magical',
        date: '2024-04-12'
      },
      {
        id: '10',
        user: 'SoloTrekker',
        rating: 4.6,
        comment: 'Less crowded than EBC but equally beautiful',
        date: '2024-03-22'
      }
    ]
  },
  {
    id: 'exp-1',
    name: 'Bhaktapur Durbar Square',
    description: 'Ancient Newari kingdom with rich architecture',
    fullDescription: 'Bhaktapur Durbar Square is a testament to the rich cultural and architectural heritage of Nepal. Known as the "City of Devotees," this ancient Newari town features intricate wood carvings, centuries-old temples, and traditional pottery squares that have preserved their medieval charm.',
    image: 'https://images.unsplash.com/photo-1625046437744-20892bb6841c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Explore the 55-Window Palace',
      'Visit the Nyatapola Temple, Nepal\'s tallest pagoda',
      'Witness traditional pottery making at Potter\'s Square',
      'Experience traditional Newari culture and cuisine'
    ],
    bestTimeToVisit: 'Year-round, with October to April being ideal',
    duration: '1 day',
    difficulty: 'Easy',
    type: 'experience',
    region: 'Kathmandu Valley',
    reviews: [
      {
        id: '11',
        user: 'HistoryBuff',
        rating: 4.9,
        comment: 'An architectural marvel that feels frozen in time',
        date: '2024-02-15'
      },
      {
        id: '12',
        user: 'CultureSeeker',
        rating: 4.7,
        comment: 'The wood carvings are incredibly detailed and beautiful',
        date: '2024-03-08'
      }
    ]
  },
  {
    id: 'exp-2',
    name: 'Pashupatinath Temple',
    description: 'Sacred Hindu temple complex',
    fullDescription: 'Pashupatinath Temple is one of the most sacred Hindu temples in the world, dedicated to Lord Shiva. This UNESCO World Heritage site along the banks of the Bagmati River is a complex of temples, ashrams, and cremation ghats, offering a profound glimpse into Hindu religious practices and rituals of life and death.',
    image: 'https://images.unsplash.com/photo-1582637558873-e72726f0998e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Witness Hindu cremation ceremonies',
      'See the sacred Shiva lingam inside the main temple',
      'Meet colorful sadhus (holy men)',
      'Explore the numerous smaller temples within the complex'
    ],
    bestTimeToVisit: 'Year-round, with Maha Shivaratri in February/March being particularly special',
    duration: '2-3 hours',
    difficulty: 'Easy',
    type: 'experience',
    region: 'Kathmandu',
    reviews: [
      {
        id: '13',
        user: 'SpiritualTraveler',
        rating: 4.5,
        comment: 'A deeply moving spiritual experience',
        date: '2024-04-20'
      },
      {
        id: '14',
        user: 'GlobalExplorer',
        rating: 4.3,
        comment: 'Fascinating but prepare yourself for the cremation rituals',
        date: '2024-01-15'
      }
    ]
  },
  {
    id: 'cuisine-1',
    name: 'Momos',
    description: 'Delicious Nepali dumplings served with spicy sauce',
    fullDescription: 'Momos are steamed dumplings filled with spiced meat or vegetables, often served with a spicy tomato-based dipping sauce called achar. These bite-sized delights are one of Nepal\'s most beloved street foods, found throughout the country from luxury restaurants to humble street vendors. Variations include steamed, fried, jhol (in soup), and kothey (pan-fried) styles.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    highlights: [
      'Try traditional buffalo momos in Kathmandu',
      'Visit Boudha for some of the best momos in the city',
      'Experience jhol momos (soup dumplings) in winter',
      'Join a cooking class to learn how to make momos'
    ],
    bestTimeToVisit: 'Year-round',
    duration: '1-2 hours',
    difficulty: 'Easy',
    type: 'cuisine',
    region: 'Nationwide',
    reviews: [
      {
        id: 'c1-1',
        user: 'FoodieExplorer',
        rating: 5.0,
        comment: 'Best momos I\'ve ever had! The buffalo filling was amazing and the spicy tomato sauce perfectly complemented them.',
        date: '2024-02-15'
      },
      {
        id: 'c1-2',
        user: 'TravelChef',
        rating: 4.7,
        comment: 'Delicious! I took a cooking class and learned how to make these. So much flavor in such a small package.',
        date: '2024-03-10'
      }
    ]
  },
  {
    id: 'cuisine-2',
    name: 'Dal Bhat',
    description: 'Traditional Nepali complete meal with rice and lentil soup',
    fullDescription: 'Dal Bhat is Nepal\'s staple dish, a complete meal consisting of steamed rice (bhat) and lentil soup (dal), accompanied by various side dishes like curried vegetables (tarkari), greens (saag), pickles (achar), and sometimes meat or fish. This nutritious meal is consumed daily by most Nepalis and is famous for providing sustainable energy, as referenced in the trekking motto "Dal Bhat Power, 24 Hour!"',
    image: 'https://images.unsplash.com/photo-1589308454676-21178e33c6d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Experience authentic Thakali Dal Bhat in Thamel',
      'Try Newari-style Dal Bhat in Bhaktapur',
      'Visit local homes for home-cooked variations',
      'Enjoy unlimited refills of dal and rice at traditional restaurants'
    ],
    bestTimeToVisit: 'Year-round',
    duration: '1-2 hours',
    difficulty: 'Easy',
    type: 'cuisine',
    region: 'Nationwide',
    reviews: [
      {
        id: 'c2-1',
        user: 'MountainTrekker',
        rating: 4.8,
        comment: 'Dal Bhat power, 24 hour! This meal kept me going during my Annapurna trek. Simple but incredibly satisfying.',
        date: '2024-01-22'
      },
      {
        id: 'c2-2',
        user: 'CulinaryAdventurer',
        rating: 4.5,
        comment: 'I loved how every house and restaurant had their own version of this dish. The variety of flavors was incredible!',
        date: '2024-03-05'
      }
    ]
  },
  {
    id: 'cuisine-3',
    name: 'Sel Roti',
    description: 'Traditional sweet ring-shaped rice bread',
    fullDescription: 'Sel Roti is a sweet, ring-shaped bread made from rice flour, often enjoyed during Nepali festivals like Tihar and Dashain. This crispy-on-the-outside, soft-on-the-inside delicacy is deep-fried to golden perfection and can be eaten alone or paired with yogurt or vegetables. Originally from Nepal, this unique bread is a must-try street food that showcases the country\'s culinary heritage.',
    image: 'https://images.unsplash.com/photo-1605195410040-0ae2e657f04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Try fresh Sel Roti at morning markets',
      'Enjoy during Tihar and Dashain festivals',
      'Pair with yogurt for a traditional combination',
      'Watch local vendors prepare this bread from scratch'
    ],
    bestTimeToVisit: 'October-November (festival season)',
    duration: '30 minutes',
    difficulty: 'Easy',
    type: 'cuisine',
    region: 'Nationwide',
    reviews: [
      {
        id: 'c3-1',
        user: 'StreetFoodFan',
        rating: 4.6,
        comment: 'Crispy, sweet, and unlike any bread I\'ve had before. Perfect with a cup of masala tea!',
        date: '2024-02-18'
      },
      {
        id: 'c3-2',
        user: 'FestivalTraveler',
        rating: 4.9,
        comment: 'Had this during Tihar celebrations and it was magical. The texture is incredible - crisp outside and soft inside.',
        date: '2023-11-15'
      }
    ]
  },
  {
    id: 'cuisine-4',
    name: 'Newari Khaja Set',
    description: 'Traditional feast with multiple small dishes',
    fullDescription: 'The Newari Khaja Set is a traditional meal from the Newar community of Nepal, particularly popular in Kathmandu Valley. This elaborate assortment features beaten rice (chiura) as the base, accompanied by various items like spicy potato salad, marinated meat, black soybeans, boiled eggs, and assorted spices and chutneys. Often enjoyed with aila (rice liquor), this feast offers a comprehensive taste of Newari culinary culture.',
    image: 'https://images.unsplash.com/photo-1635855952436-b47d393b2533?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    highlights: [
      'Visit Kirtipur for authentic Newari cuisine',
      'Try bara (lentil patties) and choila (spiced meat)',
      'Experience traditional seating and dining customs',
      'Pair with thomba or aila (traditional beverages)'
    ],
    bestTimeToVisit: 'Year-round',
    duration: '2-3 hours',
    difficulty: 'Easy',
    type: 'cuisine',
    region: 'Kathmandu Valley',
    reviews: [
      {
        id: 'c4-1',
        user: 'CulturalFoodie',
        rating: 5.0,
        comment: 'An absolute feast for the senses! The variety of flavors and textures in one meal is incredible.',
        date: '2024-03-20'
      },
      {
        id: 'c4-2',
        user: 'GlobalGastronomer',
        rating: 4.7,
        comment: 'This was my favorite meal in Nepal. The complexity of flavors and the cultural experience of eating this traditional way was unforgettable.',
        date: '2024-02-10'
      }
    ]
  }
];

// Class for managing destination data
class DataService {
  // Initialize the data in AsyncStorage if it doesn't exist
  async initialize(): Promise<void> {
    try {
      const destinations = await AsyncStorage.getItem('destinations');
      
      if (!destinations) {
        // Seed initial data if none exists
        await AsyncStorage.setItem('destinations', JSON.stringify(initialDestinations));
        console.log('Initial destination data seeded');
      } else {
        console.log('Destination data already exists');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      // Still seed the data even if there was an error reading
      await AsyncStorage.setItem('destinations', JSON.stringify(initialDestinations));
    }
  }

  // Force reinitialization of data (used for updating the data structure)
  async reinitializeData(): Promise<void> {
    try {
      // Force overwrite the existing data with the initial data
      await AsyncStorage.setItem('destinations', JSON.stringify(initialDestinations));
      console.log('Data reinitialized with latest structure');
    } catch (error) {
      console.error('Error reinitializing data:', error);
    }
  }

  // Get all destinations
  async getAllDestinations(): Promise<Destination[]> {
    try {
      const destinations = await AsyncStorage.getItem('destinations');
      
      if (destinations) {
        return JSON.parse(destinations);
      }
      
      // If no destinations found, initialize and return defaults
      await this.initialize();
      return initialDestinations;
    } catch (error) {
      console.error('Error getting all destinations:', error);
      return initialDestinations;
    }
  }

  // Get destinations by type
  async getDestinationsByType(type: string): Promise<Destination[]> {
    try {
      const allDestinations = await this.getAllDestinations();
      return allDestinations.filter(dest => dest.type === type);
    } catch (error) {
      console.error(`Error getting destinations of type ${type}:`, error);
      return [];
    }
  }

  // Get a specific destination by ID
  async getDestinationById(id: string): Promise<Destination | null> {
    try {
      const destinations = await this.getAllDestinations();
      return destinations.find(dest => dest.id === id) || null;
    } catch (error) {
      console.error('Error getting destination by ID:', error);
      return null;
    }
  }

  // Add a review to a destination
  async addReview(destinationId: string, review: Omit<Review, 'id'>): Promise<boolean> {
    try {
      const destinations = await this.getAllDestinations();
      const destinationIndex = destinations.findIndex(dest => dest.id === destinationId);
      
      if (destinationIndex === -1) {
        return false;
      }
      
      // Add the new review with a generated ID
      const newReview: Review = {
        ...review,
        id: `review-${Date.now()}`
      };
      
      // Make sure reviews array exists
      if (!destinations[destinationIndex].reviews) {
        destinations[destinationIndex].reviews = [];
      }
      
      destinations[destinationIndex].reviews!.push(newReview);
      
      // Save back to storage
      await AsyncStorage.setItem('destinations', JSON.stringify(destinations));
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  }

  // Get recommended destinations based on various criteria
  async getRecommendedDestinations(limit: number = 2): Promise<Destination[]> {
    try {
      const allDestinations = await this.getAllDestinations();
      
      // For now, we'll implement a simple recommendation algorithm
      // Sort by destinations with the highest average review ratings
      const destinationsWithRatings = allDestinations
        .filter(dest => dest.reviews && dest.reviews.length > 0)
        .map(dest => {
          const avgRating = dest.reviews!.reduce((sum, review) => sum + review.rating, 0) / dest.reviews!.length;
          return { dest, avgRating };
        })
        .sort((a, b) => b.avgRating - a.avgRating)
        .map(item => item.dest);
      
      // If we don't have enough rated destinations, add some without ratings
      let recommendations = [...destinationsWithRatings];
      
      if (recommendations.length < limit) {
        const unratedDestinations = allDestinations
          .filter(dest => !dest.reviews || dest.reviews.length === 0)
          .slice(0, limit - recommendations.length);
        
        recommendations = [...recommendations, ...unratedDestinations];
      }
      
      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommended destinations:', error);
      return [];
    }
  }

  // Search destinations by name, description, or region
  async searchDestinations(query: string): Promise<Destination[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }
      
      const allDestinations = await this.getAllDestinations();
      const lowerCaseQuery = query.toLowerCase().trim();
      
      return allDestinations.filter(dest => 
        dest.name.toLowerCase().includes(lowerCaseQuery) ||
        dest.description.toLowerCase().includes(lowerCaseQuery) ||
        (dest.region && dest.region.toLowerCase().includes(lowerCaseQuery)) ||
        (dest.type && dest.type.toLowerCase().includes(lowerCaseQuery))
      );
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }
}

export const dataService = new DataService();
export default dataService;
