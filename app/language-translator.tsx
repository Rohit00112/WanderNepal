import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Mic, Volume, Copy, RotateCcw, ArrowRightLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

interface PhraseCategory {
  id: string;
  name: string;
  phrases: Phrase[];
}

interface Phrase {
  id: string;
  english: string;
  nepali: string;
  pronunciation: string;
}

// Common Nepali phrases that tourists might need
const PHRASE_CATEGORIES: PhraseCategory[] = [
  {
    id: '1',
    name: 'Greetings',
    phrases: [
      {
        id: '1',
        english: 'Hello',
        nepali: 'नमस्ते',
        pronunciation: 'Namaste'
      },
      {
        id: '2',
        english: 'How are you?',
        nepali: 'तपाईंलाई कस्तो छ?',
        pronunciation: 'Tapai-lai kasto cha?'
      },
      {
        id: '3',
        english: 'Good morning',
        nepali: 'शुभ प्रभात',
        pronunciation: 'Shubha prabhat'
      },
      {
        id: '4',
        english: 'Good evening',
        nepali: 'शुभ सन्ध्या',
        pronunciation: 'Shubha sandhya'
      },
      {
        id: '5',
        english: 'Thank you',
        nepali: 'धन्यवाद',
        pronunciation: 'Dhanyavaad'
      },
      {
        id: '6',
        english: 'You\'re welcome',
        nepali: 'स्वागत छ',
        pronunciation: 'Swagat cha'
      }
    ]
  },
  {
    id: '2',
    name: 'Travel & Directions',
    phrases: [
      {
        id: '7',
        english: 'Where is the bathroom?',
        nepali: 'शौचालय कहाँ छ?',
        pronunciation: 'Shauchalaya kaha cha?'
      },
      {
        id: '8',
        english: 'How much does this cost?',
        nepali: 'यो कति पर्छ?',
        pronunciation: 'Yo kati parcha?'
      },
      {
        id: '9',
        english: 'Can you help me?',
        nepali: 'के तपाईं मलाई मद्दत गर्न सक्नुहुन्छ?',
        pronunciation: 'Ke tapai malai maddat garna saknu-huncha?'
      },
      {
        id: '10',
        english: 'I am lost',
        nepali: 'म हराएको छु',
        pronunciation: 'Ma harayeko chu'
      },
      {
        id: '11',
        english: 'Where is the hotel?',
        nepali: 'होटल कहाँ छ?',
        pronunciation: 'Hotel kaha cha?'
      },
      {
        id: '12',
        english: 'Take me to this address',
        nepali: 'मलाई यो ठेगानामा लैजानुहोस्',
        pronunciation: 'Malai yo thegana-ma laijanuhoss'
      }
    ]
  },
  {
    id: '3',
    name: 'Food & Dining',
    phrases: [
      {
        id: '13',
        english: 'I would like to order',
        nepali: 'म अर्डर गर्न चाहन्छु',
        pronunciation: 'Ma order garna chahanchhu'
      },
      {
        id: '14',
        english: 'The bill, please',
        nepali: 'बिल, कृपया',
        pronunciation: 'Bill, kripaya'
      },
      {
        id: '15',
        english: 'Is this vegetarian?',
        nepali: 'के यो शाकाहारी हो?',
        pronunciation: 'Ke yo shakahari ho?'
      },
      {
        id: '16',
        english: 'This is delicious',
        nepali: 'यो स्वादिष्ट छ',
        pronunciation: 'Yo swadishta chha'
      },
      {
        id: '17',
        english: 'I have allergies',
        nepali: 'मलाई एलर्जी छ',
        pronunciation: 'Malai allergy chha'
      },
      {
        id: '18',
        english: 'Water, please',
        nepali: 'पानी, कृपया',
        pronunciation: 'Pani, kripaya'
      }
    ]
  },
  {
    id: '4',
    name: 'Shopping',
    phrases: [
      {
        id: '19',
        english: 'How much?',
        nepali: 'कति?',
        pronunciation: 'Kati?'
      },
      {
        id: '20',
        english: 'Too expensive',
        nepali: 'धेरै महंगो',
        pronunciation: 'Dherai mahango'
      },
      {
        id: '21',
        english: 'Can I see that?',
        nepali: 'के म त्यो हेर्न सक्छु?',
        pronunciation: 'Ke ma tyo herna sakchhu?'
      },
      {
        id: '22',
        english: 'I would like to buy this',
        nepali: 'म यो किन्न चाहन्छु',
        pronunciation: 'Ma yo kinna chahanchhu'
      },
      {
        id: '23',
        english: 'Do you accept credit cards?',
        nepali: 'के तपाईं क्रेडिट कार्ड स्वीकार गर्नुहुन्छ?',
        pronunciation: 'Ke tapai credit card sweekar garnuhunchha?'
      },
      {
        id: '24',
        english: 'I am just looking',
        nepali: 'म हेर्दै मात्र छु',
        pronunciation: 'Ma herdai matra chhu'
      }
    ]
  },
  {
    id: '5',
    name: 'Emergency',
    phrases: [
      {
        id: '25',
        english: 'Help!',
        nepali: 'मद्दत!',
        pronunciation: 'Maddat!'
      },
      {
        id: '26',
        english: 'I need a doctor',
        nepali: 'मलाई डाक्टर चाहिन्छ',
        pronunciation: 'Malai doctor chahiinchha'
      },
      {
        id: '27',
        english: 'Call the police',
        nepali: 'प्रहरीलाई बोलाउनुहोस्',
        pronunciation: 'Police-lai bolaunuhoss'
      },
      {
        id: '28',
        english: 'I am sick',
        nepali: 'म बिरामी छु',
        pronunciation: 'Ma birami chhu'
      },
      {
        id: '29',
        english: 'I need medicine',
        nepali: 'मलाई औषधि चाहिन्छ',
        pronunciation: 'Malai aushadhi chahiinchha'
      },
      {
        id: '30',
        english: 'Where is the hospital?',
        nepali: 'अस्पताल कहाँ छ?',
        pronunciation: 'Aspatal kaha chha?'
      }
    ]
  }
];

export default function LanguageTranslator() {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<'english' | 'nepali'>('english');
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | null>(null);
  const [recentTranslations, setRecentTranslations] = useState<{
    english: string;
    nepali: string;
    timestamp: number;
  }[]>([]);

  useEffect(() => {
    loadRecentTranslations();
  }, []);

  const loadRecentTranslations = async () => {
    try {
      const savedTranslations = await AsyncStorage.getItem('recentTranslations');
      if (savedTranslations) {
        setRecentTranslations(JSON.parse(savedTranslations));
      }
    } catch (error) {
      console.error('Failed to load recent translations:', error);
    }
  };

  const saveRecentTranslation = async (english: string, nepali: string) => {
    try {
      const newTranslation = {
        english,
        nepali,
        timestamp: Date.now()
      };
      
      const updatedTranslations = [
        newTranslation,
        ...recentTranslations.filter(t => 
          // Prevent duplicates
          !(t.english === english && t.nepali === nepali)
        )
      ].slice(0, 10); // Keep only the 10 most recent translations
      
      setRecentTranslations(updatedTranslations);
      await AsyncStorage.setItem('recentTranslations', JSON.stringify(updatedTranslations));
    } catch (error) {
      console.error('Failed to save recent translation:', error);
    }
  };

  const translateText = async () => {
    // This is a simple demonstration of translation
    // In a real app, you would call a translation API or service
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let result = '';
      
      if (sourceLanguage === 'english') {
        // Find if the text matches any of our predefined phrases
        const matchingPhrase = PHRASE_CATEGORIES.flatMap(cat => cat.phrases)
          .find(phrase => phrase.english.toLowerCase() === text.toLowerCase());
        
        if (matchingPhrase) {
          result = matchingPhrase.nepali;
        } else {
          // Fallback message for demonstration purposes
          result = "Translation not available offline. Please use simple phrases or connect to the internet.";
        }
        
        if (matchingPhrase) {
          saveRecentTranslation(text, result);
        }
      } else {
        // Nepali to English
        const matchingPhrase = PHRASE_CATEGORIES.flatMap(cat => cat.phrases)
          .find(phrase => phrase.nepali === text);
        
        if (matchingPhrase) {
          result = matchingPhrase.english;
        } else {
          // Fallback message for demonstration purposes
          result = "Translation not available offline. Please use simple phrases or connect to the internet.";
        }
        
        if (matchingPhrase) {
          saveRecentTranslation(matchingPhrase.english, text);
        }
      }
      
      setTranslatedText(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to translate text. Please try again later.');
    } finally {
      setIsTranslating(false);
    }
  };

  const switchLanguages = () => {
    setSourceLanguage(prev => prev === 'english' ? 'nepali' : 'english');
    setText('');
    setTranslatedText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const copyToClipboard = async () => {
    if (!translatedText) return;
    
    try {
      await Clipboard.setStringAsync(translatedText);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied', 'Translation copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert('Error', 'Could not copy to clipboard');
    }
  };

  const clearText = () => {
    setText('');
    setTranslatedText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const speakText = () => {
    // In a real implementation, this would use Text-to-Speech
    Alert.alert('Feature Coming Soon', 'Text-to-speech will be available in the next update.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const selectPhrase = (phrase: Phrase) => {
    if (sourceLanguage === 'english') {
      setText(phrase.english);
      setTranslatedText(phrase.nepali);
    } else {
      setText(phrase.nepali);
      setTranslatedText(phrase.english);
    }
    
    saveRecentTranslation(phrase.english, phrase.nepali);
    setSelectedCategory(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Nepali Translator</Text>
      </View>

      <View style={styles.languageSelector}>
        <TouchableOpacity 
          style={[
            styles.languageButton, 
            sourceLanguage === 'english' && styles.activeLanguage
          ]}
          onPress={() => setSourceLanguage('english')}
        >
          <Text style={[
            styles.languageButtonText,
            sourceLanguage === 'english' && styles.activeLanguageText
          ]}>English</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.switchButton} onPress={switchLanguages}>
          <ArrowRightLeft size={20} color="#FF385C" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageButton, 
            sourceLanguage === 'nepali' && styles.activeLanguage
          ]}
          onPress={() => setSourceLanguage('nepali')}
        >
          <Text style={[
            styles.languageButtonText,
            sourceLanguage === 'nepali' && styles.activeLanguageText
          ]}>नेपाली</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.translationContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder={sourceLanguage === 'english' ? "Enter English text" : "नेपाली टेक्स्ट लेख्नुहोस्"}
            multiline
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.iconButton} onPress={clearText}>
              <RotateCcw size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Mic size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.translateButton, !text.trim() && styles.disabledButton]}
          onPress={translateText}
          disabled={!text.trim() || isTranslating}
        >
          <Text style={styles.translateButtonText}>
            {isTranslating ? "Translating..." : "Translate"}
          </Text>
        </TouchableOpacity>

        {translatedText ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{translatedText}</Text>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.iconButton} onPress={speakText}>
                <Volume size={20} color="#FF385C" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={copyToClipboard}>
                <Copy size={20} color="#FF385C" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.phrasebookSection}>
        <Text style={styles.sectionTitle}>Common Phrases</Text>
        
        {selectedCategory ? (
          <>
            <TouchableOpacity 
              style={styles.categoryBackButton}
              onPress={() => setSelectedCategory(null)}
            >
              <ChevronLeft size={16} color="#000" />
              <Text style={styles.categoryBackText}>Back to categories</Text>
            </TouchableOpacity>
            
            <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>
            
            <ScrollView style={styles.phrasesList}>
              {selectedCategory.phrases.map(phrase => (
                <TouchableOpacity 
                  key={phrase.id} 
                  style={styles.phraseItem}
                  onPress={() => selectPhrase(phrase)}
                >
                  <View style={styles.phraseContent}>
                    <Text style={styles.phraseEnglish}>{phrase.english}</Text>
                    <Text style={styles.phraseNepali}>{phrase.nepali}</Text>
                    <Text style={styles.pronunciation}>{phrase.pronunciation}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {PHRASE_CATEGORIES.map(category => (
              <TouchableOpacity 
                key={category.id}
                style={styles.categoryButton}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryButtonText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {!selectedCategory && recentTranslations.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Translations</Text>
          <ScrollView style={styles.recentList}>
            {recentTranslations.map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.recentItem}
                onPress={() => {
                  if (sourceLanguage === 'english') {
                    setText(item.english);
                    setTranslatedText(item.nepali);
                  } else {
                    setText(item.nepali);
                    setTranslatedText(item.english);
                  }
                }}
              >
                <View>
                  <Text style={styles.recentEnglish}>{item.english}</Text>
                  <Text style={styles.recentNepali}>{item.nepali}</Text>
                </View>
                <Text style={styles.recentTimestamp}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#1A1D1E',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 24,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    width: 120,
    alignItems: 'center',
  },
  activeLanguage: {
    backgroundColor: '#FF385C',
  },
  languageButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#4B5563',
  },
  activeLanguageText: {
    color: '#FFFFFF',
  },
  switchButton: {
    padding: 10,
    marginHorizontal: 10,
  },
  translationContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  textInput: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  translateButton: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  translateButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  resultContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  resultText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#1A1D1E',
    lineHeight: 24,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  phrasebookSection: {
    marginHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBackText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 4,
  },
  categoryTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
    marginBottom: 12,
  },
  phrasesList: {
    maxHeight: 200,
  },
  phraseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  phraseContent: {
    flex: 1,
  },
  phraseEnglish: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#1A1D1E',
  },
  phraseNepali: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#FF385C',
    marginTop: 4,
  },
  pronunciation: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  recentSection: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 100,
  },
  recentList: {
    maxHeight: 150,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentEnglish: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#1A1D1E',
  },
  recentNepali: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  recentTimestamp: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
});
