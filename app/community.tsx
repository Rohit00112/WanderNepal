import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Heart, MessageCircle, Share, Camera, Send, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// Sample post data - in a real app, this would come from a database
const INITIAL_POSTS = [
  {
    id: '1',
    user: {
      id: '101',
      name: 'Aishwarya Rai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1234&q=80',
    },
    location: 'Annapurna Base Camp',
    images: [
      'https://images.unsplash.com/photo-1585511582346-11428425708a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    ],
    caption: 'Finally made it to Annapurna Base Camp! The views are absolutely stunning. Worth every step of the trek! #nepal #trekking #annapurna',
    likes: 145,
    likedByMe: false,
    comments: 23,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    user: {
      id: '102',
      name: 'Rajendra Kumar',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1234&q=80',
    },
    location: 'Pokhara',
    images: [
      'https://images.unsplash.com/photo-1549893072-4bc678117f45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    ],
    caption: 'Paragliding in Pokhara - what an adrenaline rush! The views of Phewa Lake and the Himalayas are unmatched. Would definitely recommend this to anyone visiting Nepal! #pokhara #paragliding #adventure',
    likes: 78,
    likedByMe: true,
    comments: 12,
    timestamp: '1 day ago',
  },
  {
    id: '3',
    user: {
      id: '103',
      name: 'Manisha Singh',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1234&q=80',
    },
    location: 'Bhaktapur Durbar Square',
    images: [
      'https://images.unsplash.com/photo-1625046437744-20892bb6841c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    ],
    caption: 'Exploring the ancient city of Bhaktapur. The architecture here dates back several centuries and tells the story of Nepal\'s rich cultural heritage. #bhaktapur #culture #nepal #history',
    likes: 203,
    likedByMe: false,
    comments: 31,
    timestamp: '3 days ago',
  },
];

// Categories for filtering posts
const CATEGORIES = [
  { id: 'all', name: 'All Posts' },
  { id: 'trekking', name: 'Trekking' },
  { id: 'culture', name: 'Culture' },
  { id: 'food', name: 'Food' },
  { id: 'wildlife', name: 'Wildlife' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'photography', name: 'Photography' },
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikedState = !post.likedByMe;
        return {
          ...post,
          likedByMe: newLikedState,
          likes: newLikedState ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleComment = (postId: string) => {
    if (showComments === postId) {
      setShowComments(null);
    } else {
      setShowComments(postId);
      setCommentText('');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const submitComment = (postId: string) => {
    if (!commentText.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1
        };
      }
      return post;
    }));
    
    setCommentText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Comment Posted', 'Your comment has been added successfully!');
  };

  const handleShare = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Share', 'Sharing functionality will be implemented in the next update.');
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewPostImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewPostImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const createPost = () => {
    if (!newPostCaption.trim() || !newPostImage) {
      Alert.alert('Missing Information', 'Please add both a photo and caption to create a post.');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'unknown',
        name: user?.fullName || 'Unknown User',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      },
      location: newPostLocation || 'Nepal',
      images: [newPostImage],
      caption: newPostCaption,
      likes: 0,
      likedByMe: false,
      comments: 0,
      timestamp: 'Just now',
    };

    setPosts([newPost, ...posts]);
    setNewPostCaption('');
    setNewPostLocation('');
    setNewPostImage(null);
    setShowNewPost(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Your post has been shared with the community!');
  };

  const renderPost = ({ item }: { item: typeof posts[0] }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
        <View style={styles.postHeaderInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageContainer}
      >
        {item.images.map((image, index) => (
          <Image 
            key={index}
            source={{ uri: image }}
            style={styles.postImage}
          />
        ))}
      </ScrollView>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Heart 
            size={24} 
            color={item.likedByMe ? '#FF385C' : '#72777A'} 
            fill={item.likedByMe ? '#FF385C' : 'transparent'} 
          />
          <Text style={styles.actionCount}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
        >
          <MessageCircle size={24} color="#72777A" />
          <Text style={styles.actionCount}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item.id)}
        >
          <Share size={24} color="#72777A" />
        </TouchableOpacity>
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.userNameInCaption}>{item.user.name}</Text>
          {' '}{item.caption}
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      {showComments === item.id && (
        <View style={styles.commentsSection}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => submitComment(item.id)}
              disabled={!commentText.trim()}
            >
              <Send size={20} color={commentText.trim() ? '#FF385C' : '#D1D5DB'} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Traveler Community</Text>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!showNewPost ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.postList}
          ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
        />
      ) : (
        <ScrollView style={styles.newPostContainer}>
          <Text style={styles.newPostTitle}>Create New Post</Text>
          
          <TouchableOpacity 
            style={styles.imagePickerContainer}
            onPress={pickImage}
          >
            {newPostImage ? (
              <Image source={{ uri: newPostImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Camera size={40} color="#72777A" />
                <Text style={styles.imagePickerText}>Tap to add a photo</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.imagePickerButtons}>
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={pickImage}
            >
              <Text style={styles.imageButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={takePhoto}
            >
              <Text style={styles.imageButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.locationInput}
            placeholder="Add location (optional)"
            value={newPostLocation}
            onChangeText={setNewPostLocation}
          />
          
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={newPostCaption}
            onChangeText={setNewPostCaption}
            multiline
            numberOfLines={5}
            maxLength={500}
          />
          <Text style={styles.charCount}>{newPostCaption.length}/500</Text>
          
          <View style={styles.postButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowNewPost(false);
                setNewPostImage(null);
                setNewPostCaption('');
                setNewPostLocation('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.postButton,
                (!newPostCaption.trim() || !newPostImage) && styles.disabledButton
              ]}
              onPress={createPost}
              disabled={!newPostCaption.trim() || !newPostImage}
            >
              <Text style={styles.postButtonText}>Share Post</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {!showNewPost && (
        <TouchableOpacity 
          style={styles.createPostButton}
          onPress={() => setShowNewPost(true)}
        >
          <Camera size={24} color="#FFFFFF" />
          <Text style={styles.createPostButtonText}>Create Post</Text>
        </TouchableOpacity>
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
  categoriesContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  selectedCategory: {
    backgroundColor: '#FF385C',
  },
  categoryText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  postList: {
    paddingBottom: 80,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderInfo: {
    marginLeft: 12,
  },
  userName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
  },
  location: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  imageContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#72777A',
    marginLeft: 6,
  },
  captionContainer: {
    paddingVertical: 12,
  },
  caption: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#1A1D1E',
    lineHeight: 20,
  },
  userNameInCaption: {
    fontFamily: 'DMSans-Bold',
  },
  timestamp: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  commentsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  postSeparator: {
    height: 8,
    backgroundColor: '#F3F4F6',
  },
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF385C',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createPostButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  newPostContainer: {
    padding: 24,
  },
  newPostTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginBottom: 20,
  },
  imagePickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
    marginBottom: 16,
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePickerButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  imageButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    marginBottom: 16,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  postButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  cancelButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
  postButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  postButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
});
