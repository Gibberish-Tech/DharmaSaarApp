/**
 * Chatbot Screen - AI assistant for DharmaSaar questions
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { TAB_BAR_TOTAL_HEIGHT } from '../constants/layout';
import { ShlokaLinkedText } from '../components/ShlokaLinkedText';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export const ChatbotScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const loadConversations = async () => {
    if (!isAuthenticated) return;
    
    setLoadingConversations(true);
    try {
      const convos = await apiService.getConversations();
      setConversations(convos);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    loadConversations();
  };

  const loadConversation = (conversation: Conversation) => {
    setConversationId(conversation.id);
    setMessages(conversation.messages);
    setShowHistory(false);
  };

  const startNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    setShowHistory(false);
  };

  const getConversationPreview = (conversation: Conversation): string => {
    if (conversation.title) {
      return conversation.title;
    }
    const firstUserMessage = conversation.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.length > 50 
        ? firstUserMessage.content.substring(0, 50) + '...'
        : firstUserMessage.content;
    }
    return 'New conversation';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !isAuthenticated) return;

    const userMessage = inputText.trim();
    setInputText('');
    setError(null);

    // Add user message immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    setIsLoading(true);

    try {
      const response = await apiService.sendChatMessage(userMessage, conversationId);
      
      // Update conversation ID if it's a new conversation
      if (!conversationId && response.conversation.id) {
        setConversationId(response.conversation.id);
      }

      // Replace temp message and add assistant response
      setMessages(response.conversation.messages);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <View style={dynamicStyles.centeredContent}>
          <Text style={dynamicStyles.icon}>💬</Text>
          <Text style={dynamicStyles.title}>Chatbot</Text>
          <Text style={dynamicStyles.subtitle}>
            Please log in to use the chatbot
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={dynamicStyles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerContent}>
            <View style={dynamicStyles.headerTextContainer}>
              <Text style={dynamicStyles.headerTitle}>🕉️ Lord Krishna</Text>
              <Text style={dynamicStyles.headerSubtitle}>Your friend, guide, and mentor</Text>
            </View>
            <TouchableOpacity
              style={dynamicStyles.menuButton}
              onPress={openHistory}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.menuIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={dynamicStyles.messagesContainer}
          contentContainerStyle={dynamicStyles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Text style={dynamicStyles.emptyIcon}>🕉️</Text>
              <Text style={dynamicStyles.emptyTitle}>Namaste, dear friend</Text>
              <Text style={dynamicStyles.emptyText}>
                I am here as your friend, guide, and mentor. Ask me anything about life, dharma, or the wisdom of the Bhagavad Gita. I will help you with the same love and guidance I gave to Arjuna.
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  dynamicStyles.messageContainer,
                  message.role === 'user' ? dynamicStyles.userMessage : dynamicStyles.assistantMessage,
                ]}
              >
                {message.role === 'assistant' ? (
                  <ShlokaLinkedText
                    text={message.content}
                    textStyle={[
                      dynamicStyles.messageText,
                      dynamicStyles.assistantMessageText,
                    ]}
                    linkStyle={dynamicStyles.shlokaLink}
                  />
                ) : (
                <Text
                  style={[
                    dynamicStyles.messageText,
                      dynamicStyles.userMessageText,
                  ]}
                >
                  {message.content}
                </Text>
                )}
              </View>
            ))
          )}
          
          {isLoading && (
            <View style={[dynamicStyles.messageContainer, dynamicStyles.assistantMessage]}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}

          {error && (
            <View style={dynamicStyles.errorContainer}>
              <Text style={dynamicStyles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Ask Krishna anything..."
            placeholderTextColor={theme.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
            editable={!isLoading}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[dynamicStyles.sendButton, (!inputText.trim() || isLoading) && dynamicStyles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={dynamicStyles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Conversation History Drawer - Left Side */}
      <Modal
        visible={showHistory}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={dynamicStyles.drawerOverlay}>
          <TouchableOpacity
            style={dynamicStyles.drawerOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowHistory(false)}
          />
          <View style={dynamicStyles.drawerContent}>
            <View style={dynamicStyles.drawerHeader}>
              <Text style={dynamicStyles.drawerTitle}>Conversations</Text>
              <TouchableOpacity
                onPress={() => setShowHistory(false)}
                style={dynamicStyles.closeButton}
              >
                <Text style={dynamicStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* New Conversation Button - Always Visible */}
            <TouchableOpacity
              style={dynamicStyles.newConversationButton}
              onPress={startNewConversation}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.newConversationText}>+ New Conversation</Text>
            </TouchableOpacity>

            {/* Conversation History List */}
            {loadingConversations ? (
              <View style={dynamicStyles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : conversations.length === 0 ? (
              <View style={dynamicStyles.emptyHistoryContainer}>
                <Text style={dynamicStyles.emptyHistoryText}>No past conversations</Text>
                <Text style={dynamicStyles.emptyHistorySubtext}>
                  Your conversation history will appear here
                </Text>
              </View>
            ) : (
              <View style={dynamicStyles.historySection}>
                <Text style={dynamicStyles.historySectionTitle}>Past Conversations</Text>
                <FlatList
                  data={conversations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        dynamicStyles.conversationItem,
                        conversationId === item.id && dynamicStyles.conversationItemActive
                      ]}
                      onPress={() => loadConversation(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={dynamicStyles.conversationPreview} numberOfLines={2}>
                        {getConversationPreview(item)}
                      </Text>
                      <Text style={dynamicStyles.conversationDate}>
                        {formatDate(item.updated_at)}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={dynamicStyles.conversationsList}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const createStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.cardBackground,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  menuButton: {
    padding: 8,
    marginLeft: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: theme.text,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.primary,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.cardBackground,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: theme.text,
  },
  shlokaLink: {
    color: theme.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: theme.error || '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Math.max(insets.bottom, 16) + TAB_BAR_TOTAL_HEIGHT + 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.cardBackground,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sendButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  // Drawer styles - Left Side Navbar
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerOverlayTouchable: {
    flex: 0.4, // Takes 40% of the screen (remaining space)
  },
  drawerContent: {
    width: '80%',
    backgroundColor: theme.cardBackground,
    flex: 0.8, // Takes 80% of the screen
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Math.max(insets.top, 16),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },
  closeButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.text,
    fontWeight: '300',
  },
  newConversationButton: {
    margin: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: theme.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  newConversationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    flex: 1,
  },
  historySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyHistoryContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  conversationItemActive: {
    backgroundColor: theme.primary + '15',
  },
  conversationPreview: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  conversationDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});
