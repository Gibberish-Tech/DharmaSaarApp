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
import { ErrorDisplay } from '../components/ErrorDisplay';
import { CustomAlert } from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

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
  const { alertConfig, visible: alertVisible, showAlert, hideAlert } = useCustomAlert();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');
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

  const handleDeleteConversation = (conversation: Conversation, hardDelete: boolean = false) => {
    if (hardDelete) {
      showAlert({
        title: 'Permanent Delete Conversation',
        message: `Are you sure you want to permanently delete this conversation?\n\n⚠️ PERMANENT DELETION:\n• All messages in this conversation will be permanently removed from our servers\n• This action CANNOT be undone\n• You will NOT be able to recover this conversation\n• All data will be immediately and permanently erased\n\nThis is a final action. Please confirm you understand the consequences.`,
        buttons: [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Permanently Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiService.deleteConversation(conversation.id, true);
                // If deleting current conversation, clear it
                if (conversationId === conversation.id) {
                  startNewConversation();
                }
                // Reload conversations
                await loadConversations();
                showAlert({
                  title: 'Success',
                  message: 'Conversation permanently deleted successfully.',
                  buttons: [{ text: 'OK' }],
                });
              } catch (err: any) {
                showAlert({
                  title: 'Error',
                  message: err.message || 'Failed to delete conversation. Please try again.',
                  buttons: [{ text: 'OK' }],
                });
              }
            },
          },
        ],
      });
    } else {
      showAlert({
        title: 'Delete Conversation',
        message: `Are you sure you want to delete this conversation?\n\n🗑️ SOFT DELETION:\n• This conversation will be hidden from your chat list\n• Your data will be kept on our servers for 30 days\n• You can contact support to restore it within this period\n• After 30 days, it will be permanently deleted\n\nThis is a reversible action. You can restore it later if needed.`,
        buttons: [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiService.deleteConversation(conversation.id, false);
                // If deleting current conversation, clear it
                if (conversationId === conversation.id) {
                  startNewConversation();
                }
                // Reload conversations
                await loadConversations();
                showAlert({
                  title: 'Success',
                  message: 'Conversation deleted successfully. You can restore it within 30 days by contacting support.',
                  buttons: [{ text: 'OK' }],
                });
              } catch (err: any) {
                showAlert({
                  title: 'Error',
                  message: err.message || 'Failed to delete conversation. Please try again.',
                  buttons: [{ text: 'OK' }],
                });
              }
            },
          },
        ],
      });
    }
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
              <ErrorDisplay
                error={error}
                onRetry={sendMessage}
                compact={true}
              />
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
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityHint="Double tap to send your message to the chatbot"
            accessibilityState={{ disabled: !inputText.trim() || isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={dynamicStyles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Options Menu Modal */}
      <Modal
        visible={showMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowMenu(false);
          setIsRenaming(false);
          setRenameText('');
          setSelectedConversationId(null);
        }}
      >
        <View style={dynamicStyles.menuOverlay}>
          <TouchableOpacity
            style={dynamicStyles.menuOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              setShowMenu(false);
              setIsRenaming(false);
              setRenameText('');
              setSelectedConversationId(null);
            }}
          />
          <View style={dynamicStyles.menuContent}>
            {isRenaming ? (
              <View style={dynamicStyles.renameContainer}>
                <Text style={dynamicStyles.menuTitle}>Rename Conversation</Text>
                <TextInput
                  style={dynamicStyles.renameInput}
                  placeholder="Enter conversation title"
                  placeholderTextColor={theme.textTertiary}
                  value={renameText}
                  onChangeText={setRenameText}
                  autoFocus
                  maxLength={100}
                />
                <View style={dynamicStyles.renameActions}>
                  <TouchableOpacity
                    style={[dynamicStyles.menuButtonItem, dynamicStyles.menuButtonCancel]}
                    onPress={() => {
                      setIsRenaming(false);
                      setRenameText('');
                      setSelectedConversationId(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={dynamicStyles.menuButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[dynamicStyles.menuButtonItem, dynamicStyles.menuButtonPrimary]}
                    onPress={async () => {
                      if (selectedConversationId) {
                        try {
                          await apiService.updateConversation(selectedConversationId, renameText.trim() || null);
                          await loadConversations();
                          // Update current conversation title in state
                          setConversations(prev => prev.map(conv => 
                            conv.id === selectedConversationId 
                              ? { ...conv, title: renameText.trim() || null }
                              : conv
                          ));
                          // If this is the currently active conversation, update it
                          if (conversationId === selectedConversationId) {
                            // Reload the conversation to get updated title
                            const updatedConv = conversations.find(c => c.id === selectedConversationId);
                            if (updatedConv) {
                              loadConversation({ ...updatedConv, title: renameText.trim() || null });
                            }
                          }
                          setIsRenaming(false);
                          setRenameText('');
                          setShowMenu(false);
                          setSelectedConversationId(null);
                        } catch (err: any) {
                          showAlert({
                            title: 'Error',
                            message: err.message || 'Failed to rename conversation. Please try again.',
                            buttons: [{ text: 'OK' }],
                          });
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[dynamicStyles.menuButtonText, dynamicStyles.menuButtonTextPrimary]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={dynamicStyles.menuTitle}>Options</Text>
                <TouchableOpacity
                  style={dynamicStyles.menuItem}
                  onPress={() => {
                    const currentConv = conversations.find(c => c.id === selectedConversationId);
                    setRenameText(currentConv?.title || '');
                    setIsRenaming(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={dynamicStyles.menuItemIcon}>✏️</Text>
                  <Text style={dynamicStyles.menuItemText}>Rename</Text>
                </TouchableOpacity>
                <View style={dynamicStyles.menuDivider} />
                <TouchableOpacity
                  style={dynamicStyles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    const currentConv = conversations.find(c => c.id === selectedConversationId);
                    if (currentConv) {
                      showAlert({
                        title: 'Delete Conversation',
                        message: 'Choose how you want to delete this conversation:',
                        buttons: [
                          { 
                            text: 'Cancel', 
                            style: 'cancel',
                            onPress: () => {
                              setSelectedConversationId(null);
                            },
                          },
                          {
                            text: 'Soft Delete',
                            onPress: () => {
                              handleDeleteConversation(currentConv, false);
                              setSelectedConversationId(null);
                            },
                          },
                          {
                            text: 'Permanent Delete',
                            style: 'destructive',
                            onPress: () => {
                              handleDeleteConversation(currentConv, true);
                              setSelectedConversationId(null);
                            },
                          },
                        ],
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={dynamicStyles.menuItemIcon}>🗑️</Text>
                  <Text style={[dynamicStyles.menuItemText, dynamicStyles.menuItemTextDanger]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

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
                    <View
                      style={[
                        dynamicStyles.conversationItem,
                        conversationId === item.id && dynamicStyles.conversationItemActive
                      ]}
                    >
                      <TouchableOpacity
                        style={dynamicStyles.conversationItemContent}
                      onPress={() => loadConversation(item)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Conversation ${item.title || 'Untitled'}`}
                      accessibilityHint="Double tap to open this conversation"
                      accessibilityState={{ selected: conversationId === item.id }}
                    >
                      <Text style={dynamicStyles.conversationPreview} numberOfLines={2}>
                        {getConversationPreview(item)}
                      </Text>
                      <Text style={dynamicStyles.conversationDate}>
                        {formatDate(item.updated_at)}
                      </Text>
                    </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.conversationMenuButton}
                        onPress={() => {
                          setSelectedConversationId(item.id);
                          setRenameText(item.title || '');
                          setShowMenu(true);
                        }}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Conversation options"
                      >
                        <Text style={dynamicStyles.conversationMenuIcon}>⋯</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  style={dynamicStyles.conversationsList}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={hideAlert}
          showCloseButton={alertConfig.showCloseButton}
        />
      )}
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
    color: theme.heading,
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
    marginTop: 8,
    marginHorizontal: 16,
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
    minHeight: 44, // Minimum touch target size
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  conversationItemContent: {
    flex: 1,
    padding: 16,
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
  conversationMenuButton: {
    padding: 16,
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationMenuIcon: {
    fontSize: 20,
    color: theme.text,
    fontWeight: '600',
  },
  // Options Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContent: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: '#FF3B30',
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 8,
  },
  renameContainer: {
    gap: 16,
  },
  renameInput: {
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  renameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  menuButtonItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  menuButtonCancel: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  menuButtonPrimary: {
    backgroundColor: theme.primary,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  menuButtonTextPrimary: {
    color: '#FFFFFF',
  },
});
