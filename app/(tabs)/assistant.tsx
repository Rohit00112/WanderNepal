import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, FlatList, Image, useWindowDimensions } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Send, Mic, Camera, Map, Calendar, Info, X, Lightbulb, Settings, Globe, UserCircle, Bus, RefreshCw } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  isLoading?: boolean;
  images?: string[];
  suggestedActions?: SuggestedAction[];
};

type SuggestedAction = {
  text: string;
  icon?: React.ElementType;
  action: () => void;
};

type SuggestedQuery = {
  id: string;
  text: string;
  icon: React.ElementType;
  color: string;
};

import { geminiService } from '../../services/GeminiService';

const generateResponse = async (userMessage: string): Promise<string> => {
  try {
    return await geminiService.getChatResponse(userMessage);
  } catch (error) {
    console.error('Error generating response:', error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again.";
  }
};

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  
  // Add voice input state
  const [isRecording, setIsRecording] = useState(false);
  
  // Add suggested queries
  const suggestedQueries: SuggestedQuery[] = [
    {
      id: '1',
      text: 'Tell me about Kathmandu',
      icon: Map,
      color: '#FF385C'
    },
    {
      id: '2',
      text: 'When is the best time to visit Nepal?',
      icon: Calendar,
      color: '#4361EE'
    },
    {
      id: '3',
      text: 'What festivals happen in April?',
      icon: Calendar,
      color: '#F59E0B'
    },
    {
      id: '4',
      text: 'How do I get from Kathmandu to Pokhara?',
      icon: Bus,
      color: '#8B5CF6'
    },
    {
      id: '5',
      text: 'Translate "Hello, how are you?" to Nepali',
      icon: Globe,
      color: '#059669'
    },
    {
      id: '6',
      text: 'Help me plan a 7-day itinerary',
      icon: Calendar,
      color: '#4E8A3D'
    },
  ];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Namaste! I'm your AI travel assistant for Nepal. I can help you with:\n\n• Destination recommendations\n• Travel planning & itineraries\n• Festival & event information\n• Transportation options\n• Language translation\n• Weather updates\n• Cultural insights\n\nHow can I assist with your Nepal adventure today?",
      isUser: false,
      timestamp: Date.now(),
      suggestedActions: [
        {
          text: 'Explore Destinations',
          icon: Map,
          action: () => router.push('/(tabs)')
        },
        {
          text: 'View Itinerary',
          icon: Calendar,
          action: () => router.push('/itinerary-planner')
        },
        {
          text: 'Weather Updates',
          icon: Globe,
          action: () => handleSendMessage('What is the current weather in Nepal?')
        }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  
  // Typing animation effect
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);
  
  // Function to scroll to the bottom of chat
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle sending message
  const handleSendMessage = async (messageText: string = inputText.trim()) => {
    if (messageText) {
      // Give haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // Add typing indicator
      const loadingId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev, 
        {
          id: loadingId,
          text: '',
          isUser: false,
          timestamp: Date.now() + 1,
          isLoading: true
        }
      ]);
      setIsTyping(true);
      
      // Generate response
      const response = await generateResponse(messageText);
      
      // Remove typing indicator and add response
      setMessages(prev => 
        prev.filter(msg => msg.id !== loadingId).concat([
          {
            id: (Date.now() + 2).toString(),
            text: response,
            isUser: false,
            timestamp: Date.now() + 2,
            suggestedActions: getRelevantActions(messageText, response)
          }
        ])
      );
      setIsTyping(false);
    }
  };
  
  // Generate relevant actions based on message content
  const getRelevantActions = (userMessage: string, aiResponse: string): SuggestedAction[] => {
    const actions: SuggestedAction[] = [];
    
    // Check for location mentions to add map action
    const locationKeywords = ['kathmandu', 'pokhara', 'nepal', 'chitwan', 'everest', 'annapurna', 'lumbini'];
    if (locationKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || 
      aiResponse.toLowerCase().includes(keyword))
    ) {
      actions.push({
        text: 'View on Map',
        icon: Map,
        action: () => router.push('/(tabs)/map')
      });
    }
    
    // Check for festival mentions
    const festivalKeywords = ['festival', 'dashain', 'tihar', 'holi', 'ceremony', 'celebration'];
    if (festivalKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || 
      aiResponse.toLowerCase().includes(keyword))
    ) {
      actions.push({
        text: 'Festival Calendar',
        icon: Calendar,
        action: () => router.push('/festivals')
      });
    }
    
    // Check for transportation mentions
    const transportKeywords = ['bus', 'travel', 'flight', 'airport', 'taxi', 'transport'];
    if (transportKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || 
      aiResponse.toLowerCase().includes(keyword))
    ) {
      actions.push({
        text: 'Transportation Guide',
        icon: Bus,
        action: () => router.push('/transportation')
      });
    }
    
    // Check for itinerary mentions
    const itineraryKeywords = ['plan', 'itinerary', 'schedule', 'day', 'trip', 'visit'];
    if (itineraryKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || 
      aiResponse.toLowerCase().includes(keyword))
    ) {
      actions.push({
        text: 'Plan Itinerary',
        icon: Calendar,
        action: () => router.push('/itinerary-planner')
      });
    }
    
    // Check for language mentions
    const languageKeywords = ['speak', 'language', 'translate', 'nepali', 'local', 'phrase'];
    if (languageKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || 
      aiResponse.toLowerCase().includes(keyword))
    ) {
      actions.push({
        text: 'Translator',
        icon: Globe,
        action: () => router.push('/language-translator')
      });
    }
    
    // Check for weather mentions
    const weatherKeywords = ['weather', 'rain', 'season', 'climate', 'temperature', 'monsoon'];
    if (weatherKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || 
      aiResponse.toLowerCase().includes(keyword))
    ) {
      actions.push({
        text: 'Weather Guide',
        icon: Globe,
        action: () => router.push('/weather-guide')
      });
    }
    
    // Limit actions to 3
    return actions.slice(0, 3);
  };
  
  // Handle clear chat
  const handleClearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMessages([
      {
        id: Date.now().toString(),
        text: "Namaste! I'm your AI travel assistant for Nepal. How can I assist with your Nepal adventure today?",
        isUser: false,
        timestamp: Date.now(),
        suggestedActions: [
          {
            text: 'Explore Destinations',
            icon: Map,
            action: () => router.push('/(tabs)')
          },
          {
            text: 'View Itinerary',
            icon: Calendar,
            action: () => router.push('/itinerary-planner')
          },
          {
            text: 'Weather Updates',
            icon: Globe,
            action: () => handleSendMessage('What is the current weather in Nepal?')
          }
        ]
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF385C', '#FF1C48']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <Text style={styles.title}>Nepal AI Travel Assistant</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearChat}
        >
          <RefreshCw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessageContainer : styles.assistantMessageContainer
              ]}
            >
              {!message.isUser && !message.isLoading && (
                <View style={styles.assistantAvatar}>
                  <LinearGradient
                    colors={['#FF385C', '#FF1C48']}
                    style={styles.avatarGradient}
                  >
                    <Lightbulb size={16} color="#FFFFFF" />
                  </LinearGradient>
                </View>
              )}
            
              {message.isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FF385C" size="small" />
                  <Animated.View style={{ opacity: typingAnimation }}>
                    <Text style={styles.loadingText}>Thinking...</Text>
                  </Animated.View>
                </View>
              ) : message.isUser ? (
                <Text style={styles.userMessage}>{message.text}</Text>
              ) : (
                <View style={styles.assistantContent}>
                  <Markdown
                    style={{
                      body: styles.assistantMessage,
                      heading1: styles.markdownH1,
                      heading2: styles.markdownH2,
                      heading3: styles.markdownH3,
                      paragraph: styles.markdownP,
                      list_item: styles.markdownListItem,
                      bullet_list: styles.markdownBulletList,
                      ordered_list: styles.markdownOrderedList,
                      code_block: styles.markdownCodeBlock,
                      fence: styles.markdownFence,
                      link: styles.markdownLink,
                      em: styles.markdownEm,
                      strong: styles.markdownStrong,
                      blockquote: styles.markdownBlockquote,
                    }}
                  >
                    {message.text}
                  </Markdown>
                  
                  {/* Display images if any */}
                  {message.images && message.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                      {message.images.map((img, index) => (
                        <Image 
                          key={index}
                          source={{ uri: img }}
                          style={styles.messageImage}
                        />
                      ))}
                    </ScrollView>
                  )}
                  
                  {/* Display suggested actions if any */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <View style={styles.actionButtonsContainer}>
                      {message.suggestedActions.map((action, index) => {
                        const ActionIcon = action.icon || Info;
                        return (
                          <TouchableOpacity 
                            key={index}
                            style={styles.actionButton}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              action.action();
                            }}
                          >
                            <ActionIcon size={16} color="#FF385C" />
                            <Text style={styles.actionButtonText}>{action.text}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      
        {/* Suggested queries */}
        {messages.length < 3 && (
          <View style={styles.suggestedQueriesContainer}>
            <Text style={styles.suggestedQueriesTitle}>Suggested Questions</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedQueriesScrollContent}
            >
              {suggestedQueries.map(query => (
                <TouchableOpacity
                  key={query.id}
                  style={styles.suggestedQueryButton}
                  onPress={() => handleSendMessage(query.text)}
                >
                  <View style={[styles.suggestedQueryIcon, { backgroundColor: query.color }]}>
                    <query.icon size={16} color="#FFFFFF" />
                  </View>
                  <Text 
                    style={styles.suggestedQueryText}
                    numberOfLines={2}
                  >
                    {query.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>

      <View style={[
        styles.inputContainer, 
        { 
          paddingBottom: Math.max(insets.bottom + (Platform.OS === 'ios' ? 80 : 60), 24),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0
        }
      ]}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about Nepal..."
          placeholderTextColor="#72777A"
          multiline
          numberOfLines={4}
          maxLength={500}
          value={inputText}
          onChangeText={setInputText}
        />
        
        {/* Voice input button */}
        <TouchableOpacity 
          style={[styles.voiceButton, isRecording ? styles.recordingButton : null]}
          onPress={() => {
            // Toggle recording state (this would actually start/stop recording)
            setIsRecording(!isRecording);
            Haptics.impactAsync(
              isRecording ? 
                Haptics.ImpactFeedbackStyle.Medium :
                Haptics.ImpactFeedbackStyle.Light
            );
          }}
        >
          <Mic size={20} color={isRecording ? "#FF1C48" : "#72777A"} />
        </TouchableOpacity>
        
        {/* Camera button */}
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Would open camera
          }}
        >
          <Camera size={20} color="#72777A" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            inputText.trim() ? styles.activeSendButton : null
          ]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim()}
        >
          <Send size={20} color={inputText.trim() ? "#FFFFFF" : "#72777A"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    
  },
  header: {
    padding: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
    position: 'relative',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: 40, // Space for the avatar
  },
  assistantAvatar: {
    position: 'absolute',
    top: 0,
    left: -40,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  assistantMessage: {
    color: '#1A1D1E',
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    lineHeight: 24,
  },
  userMessage: {
    backgroundColor: '#FF385C',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderTopRightRadius: 4,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    padding: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: '#1A1D1E',
    maxHeight: 120,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#DEE2E6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeSendButton: {
    backgroundColor: '#FF1C48',
  },
  voiceButton: {
    backgroundColor: '#F8F9FA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  recordingButton: {
    backgroundColor: '#FFE5E8',
    borderColor: '#FF385C',
  },
  cameraButton: {
    backgroundColor: '#F8F9FA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  suggestedQueriesContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
    paddingBottom: 130,
  },
  suggestedQueriesTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
    marginBottom: 12,
  },
  suggestedQueriesScrollContent: {
    paddingVertical: 8,
  },
  suggestedQueryButton: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 200,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  suggestedQueryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedQueryText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#1A1D1E',
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '60%',
    alignSelf: 'flex-start',
    marginLeft: 40,
    borderTopLeftRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loadingText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6C757D',
  },
  imagesContainer: {
    marginTop: 8,
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  actionButton: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#1A1D1E',
  },
  clearButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markdownH1: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 8,
    marginTop: 4,
  },
  markdownH2: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 8,
    marginTop: 4,
  },
  markdownH3: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 8,
    marginTop: 4,
  },
  markdownP: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    fontFamily: 'DMSans-Regular',
  },
  markdownListItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  markdownBulletList: {
    marginBottom: 8,
  },
  markdownOrderedList: {
    marginBottom: 8,
  },
  markdownCodeBlock: {
    backgroundColor: '#F1F3F5',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 8,
  },
  markdownFence: {
    backgroundColor: '#F1F3F5',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 8,
  },
  markdownLink: {
    color: '#FF385C',
    textDecorationLine: 'underline',
  },
  markdownEm: {
    fontStyle: 'italic',
  },
  markdownStrong: {
    fontFamily: 'DMSans-Bold',
  },
  markdownBlockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF385C',
    paddingLeft: 12,
    fontStyle: 'italic',
    marginVertical: 8,
  },
});