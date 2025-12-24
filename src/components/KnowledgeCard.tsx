import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { KnowledgeItem } from '../data/mockKnowledge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormattedText } from './FormattedText';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { hasSeenCollapsibleHint, markCollapsibleHintAsSeen } from '../utils/onboardingStorage';
import { ttsService } from '../services/ttsService';

const FLOATING_TAB_BAR_HEIGHT = 20; // Height of the floating tab bar
const FLOATING_TAB_BAR_MARGIN = 16; // Bottom margin of the floating tab bar
const FLOATING_TAB_BAR_TOTAL = FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_MARGIN;

interface KnowledgeCardProps {
  item: KnowledgeItem;
}

// Simple Om symbol component
const OmSymbol: React.FC<{ size?: number; color?: string }> = ({ 
  size = 24, 
  color 
}) => {
  const { theme } = useTheme();
  const omColor = color || theme.primary;
  
  const omStyles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 16,
      width: size,
      height: size,
    },
    text: {
      fontWeight: '400',
      fontSize: size,
      color: omColor,
    },
  });

  return (
    <View style={omStyles.container}>
      <Text style={omStyles.text}>ॐ</Text>
    </View>
  );
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  theme: any;
  showHint?: boolean;
  onHintDismiss?: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
  theme,
  showHint = false,
  onHintDismiss,
}) => {
  const styles = createStyles(theme);
  
  const handleToggle = () => {
    if (showHint && !isExpanded && onHintDismiss) {
      onHintDismiss();
    }
    onToggle();
  };
  
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.collapsibleHeader}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title} section, ${isExpanded ? 'expanded' : 'collapsed'}`}
        accessibilityHint={isExpanded ? 'Double tap to collapse this section' : 'Double tap to expand this section'}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.collapsibleTitleContainer}>
          <Text style={styles.collapsibleTitle}>{title}</Text>
          {showHint && !isExpanded && (
            <Text style={styles.collapsibleHint}>Tap to expand</Text>
          )}
        </View>
        <Text style={styles.chevronIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.collapsibleContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const dynamicStyles = createStyles(theme);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showCollapsibleHint, setShowCollapsibleHint] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    summary: false,
    detailedMeaning: false,
    detailedExplanation: false,
    context: false,
    whyMatters: false,
    modernExamples: false,
    wordByWord: false,
    deeperStudy: false,
  });

  // Check if user has seen collapsible hint
  useEffect(() => {
    const checkHint = async () => {
      const hasSeen = await hasSeenCollapsibleHint();
      if (!hasSeen) {
        // Show hint after a short delay
        setTimeout(() => {
          setShowCollapsibleHint(true);
        }, 2000);
      }
    };
    checkHint();
  }, []);

  const handleCollapsibleHintDismiss = async () => {
    setShowCollapsibleHint(false);
    await markCollapsibleHintAsSeen();
  };
  
  // Extract shloka-specific data
  const sanskritText = item.sanskritText || item.source || '';
  const transliteration = item.transliteration || item.author || '';
  const bookName = item.bookName || item.category || '';
  const chapterNumber = item.chapterNumber;
  const verseNumber = item.verseNumber;
  
  // Get structured fields from explanation
  const summary = item.summary;
  const detailedMeaning = item.detailedMeaning;
  const detailedExplanation = item.detailedExplanation;
  const context = item.context;
  const whyThisMatters = item.whyThisMatters;
  const wordByWord = item.wordByWord || [];
  const modernExamples = item.modernExamples || [];
  const themes = item.themes || [];
  const reflectionPrompt = item.reflectionPrompt;
  
  const checkFavoriteStatus = useCallback(async () => {
    try {
      const favorites = await apiService.getFavorites();
      const isFav = favorites.some(fav => fav.shloka.id === item.id);
      setIsFavorite(isFav);
    } catch (err) {
      console.warn('Failed to check favorite status:', err);
      setIsFavorite(false);
    }
  }, [item.id]);
  
  // Check if shloka is favorited (only when item.id or auth status changes)
  useEffect(() => {
    if (isAuthenticated && item.id) {
      let isMounted = true;
      checkFavoriteStatus().then(() => {
        if (!isMounted) return;
      });
      return () => {
        isMounted = false;
      };
    } else {
      setIsFavorite(false);
    }
  }, [item.id, isAuthenticated, checkFavoriteStatus]);
  
  const toggleFavorite = async () => {
    if (!isAuthenticated || !item.id || isTogglingFavorite) return;
    
    try {
      setIsTogglingFavorite(true);
      if (isFavorite) {
        await apiService.removeFavorite(item.id);
        setIsFavorite(false);
      } else {
        await apiService.addFavorite(item.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsTogglingFavorite(false);
    }
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleShare = async () => {
    try {
      // Use summary or first available section
      const shareContent = summary || 
                          detailedMeaning || 
                          detailedExplanation || 
                          whyThisMatters || 
                          '';
      const shareText = `${bookName}${chapterNumber && verseNumber ? ` • Chapter ${chapterNumber}, Verse ${verseNumber}` : ''}\n\n${sanskritText}\n\n${shareContent}`;
      await Share.share({
        message: shareText,
        title: item.title || 'Shloka',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleTextToSpeech = async () => {
    try {
      if (isSpeaking) {
        if (isPaused) {
          await ttsService.resume();
          setIsPaused(ttsService.getIsPaused());
          setIsSpeaking(ttsService.getIsPlaying());
        } else {
          await ttsService.pause();
          setIsPaused(ttsService.getIsPaused());
          setIsSpeaking(ttsService.getIsPlaying());
        }
      } else {
        // Use transliteration for TTS (backend uses Google TTS which works great for transliteration)
        let textToSpeak = '';
        
        if (transliteration && transliteration.trim()) {
          // Prioritize transliteration as it's readable by TTS engines
          textToSpeak = transliteration.trim();
        } else if (sanskritText && sanskritText.trim()) {
          // Fallback to Sanskrit text if no transliteration (though it may not work well)
          textToSpeak = sanskritText.trim();
          console.warn('No transliteration available, using Sanskrit text (may not pronounce correctly)');
        }
        
        if (textToSpeak) {
          console.log('TTS: Attempting to speak:', textToSpeak.substring(0, 100));
          setIsSpeaking(true);
          setIsPaused(false);
          
          // Use backend TTS service with shloka_id for caching (faster, saves API costs)
          // Pass shloka_id if available, otherwise fallback to text
          await ttsService.speak(textToSpeak, { 
            language: 'hi-IN', 
            rate: 0.45,
            shloka_id: item.id // Use shloka ID for caching
          });
          console.log('TTS: Speak command completed');
          
          // Sync state with service
          setIsSpeaking(ttsService.getIsPlaying());
          setIsPaused(ttsService.getIsPaused());
          
          // Poll for playback completion (service will update its state)
          const checkInterval = setInterval(() => {
            const playing = ttsService.getIsPlaying();
            const paused = ttsService.getIsPaused();
            setIsSpeaking(playing);
            setIsPaused(paused);
            if (!playing && !paused) {
              clearInterval(checkInterval);
            }
          }, 500);
          
          // Clear interval after reasonable timeout (5 minutes max)
          setTimeout(() => clearInterval(checkInterval), 5 * 60 * 1000);
        } else {
          // Show alert if no text is available
          Alert.alert(
            'No Text Available',
            'This shloka does not have transliteration text available for pronunciation.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('TTS: Error with text-to-speech:', error);
      setIsSpeaking(false);
      setIsPaused(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Text-to-Speech Error',
        `Unable to read the shloka: ${errorMessage}\n\nPlease check your internet connection and try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Stop speech when component unmounts or item changes
  useEffect(() => {
    return () => {
      ttsService.stop();
      setIsSpeaking(false);
      setIsPaused(false);
    };
  }, [item.id]);

  return (
    <View style={dynamicStyles.card}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={[
          dynamicStyles.scrollContent,
          { 
            paddingTop: Math.max(insets.top + 20, 40),
            paddingBottom: Math.max(insets.bottom + 20, 40) + FLOATING_TAB_BAR_TOTAL,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Book Reference - Subtle, top */}
        <View style={dynamicStyles.referenceContainer}>
          <View style={dynamicStyles.headerRow}>
            <Text style={dynamicStyles.referenceText}>
              {bookName}
              {chapterNumber && verseNumber && ` • Chapter ${chapterNumber}, Verse ${verseNumber}`}
            </Text>
            {isAuthenticated && (
              <TouchableOpacity
                style={dynamicStyles.bookmarkButton}
                onPress={toggleFavorite}
                activeOpacity={0.7}
                disabled={isTogglingFavorite}
              >
                <Text style={dynamicStyles.bookmarkIcon}>
                  {isFavorite ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sanskrit Text - Prominent, centered */}
        {sanskritText ? (
          <View style={dynamicStyles.sanskritContainer}>
            <Text style={dynamicStyles.sanskritText}>{sanskritText}</Text>
            <TouchableOpacity
              style={dynamicStyles.ttsButton}
              onPress={handleTextToSpeech}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isSpeaking ? (isPaused ? 'Resume pronunciation' : 'Pause pronunciation') : 'Listen to pronunciation'}
              accessibilityHint="Double tap to hear the Shloka pronunciation"
            >
              <Text style={dynamicStyles.ttsIcon}>
                {isSpeaking ? (isPaused ? '▶️' : '⏸️') : '🔊'}
              </Text>
              <Text style={dynamicStyles.ttsButtonText}>
                {isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Transliteration - Below Sanskrit, italic */}
        {transliteration ? (
          <View style={dynamicStyles.transliterationContainer}>
            <Text style={dynamicStyles.transliterationText}>{transliteration}</Text>
          </View>
        ) : null}

        {/* Decorative Divider with Om */}
        <View style={dynamicStyles.dividerContainer}>
          <View style={dynamicStyles.dividerLine} />
          <OmSymbol size={28} />
          <View style={dynamicStyles.dividerLine} />
        </View>

        {/* All Sections - All Collapsible */}
        <View style={dynamicStyles.sectionsContainer}>
          {/* Summary Section */}
          {summary && (
            <CollapsibleSection
              title="Summary"
              isExpanded={expandedSections.summary}
              onToggle={() => toggleSection('summary')}
              theme={theme}
              showHint={showCollapsibleHint && !expandedSections.summary}
              onHintDismiss={handleCollapsibleHintDismiss}
            >
              <FormattedText
                text={summary}
                style={dynamicStyles.sectionText}
                boldStyle={dynamicStyles.sectionBold}
                italicStyle={dynamicStyles.sectionItalic}
              />
            </CollapsibleSection>
          )}

          {/* Detailed Meaning Section */}
          {detailedMeaning && (
            <CollapsibleSection
              title="Detailed Meaning"
              isExpanded={expandedSections.detailedMeaning}
              onToggle={() => toggleSection('detailedMeaning')}
              theme={theme}
            >
              <FormattedText
                text={detailedMeaning}
                style={dynamicStyles.sectionText}
                boldStyle={dynamicStyles.sectionBold}
                italicStyle={dynamicStyles.sectionItalic}
              />
            </CollapsibleSection>
          )}

          {/* Detailed Explanation Section */}
          {detailedExplanation && (
            <CollapsibleSection
              title="Detailed Explanation"
              isExpanded={expandedSections.detailedExplanation}
              onToggle={() => toggleSection('detailedExplanation')}
              theme={theme}
            >
              <FormattedText
                text={detailedExplanation}
                style={dynamicStyles.sectionText}
                boldStyle={dynamicStyles.sectionBold}
                italicStyle={dynamicStyles.sectionItalic}
              />
            </CollapsibleSection>
          )}

          {/* Context Section */}
          {context && (
            <CollapsibleSection
              title="Context"
              isExpanded={expandedSections.context}
              onToggle={() => toggleSection('context')}
              theme={theme}
            >
              <FormattedText
                text={context}
                style={dynamicStyles.sectionText}
                boldStyle={dynamicStyles.sectionBold}
                italicStyle={dynamicStyles.sectionItalic}
              />
            </CollapsibleSection>
          )}

          {/* Why This Matters Section */}
          {whyThisMatters && (
            <CollapsibleSection
              title="Why This Matters"
              isExpanded={expandedSections.whyMatters}
              onToggle={() => toggleSection('whyMatters')}
              theme={theme}
            >
              <FormattedText
                text={whyThisMatters}
                style={dynamicStyles.sectionText}
                boldStyle={dynamicStyles.sectionBold}
                italicStyle={dynamicStyles.sectionItalic}
              />
            </CollapsibleSection>
          )}

          {/* Modern Examples Section */}
          {modernExamples && modernExamples.length > 0 && (
            <CollapsibleSection
              title="Modern Examples"
              isExpanded={expandedSections.modernExamples}
              onToggle={() => toggleSection('modernExamples')}
              theme={theme}
            >
              <View style={dynamicStyles.examplesContainer}>
                {modernExamples.map((example, index) => (
                  <View key={index} style={dynamicStyles.exampleItem}>
                    <Text style={dynamicStyles.exampleTitle}>{example.category}:</Text>
                    <Text style={dynamicStyles.exampleText}>
                      {example.description}
                    </Text>
                  </View>
                ))}
              </View>
            </CollapsibleSection>
          )}

          {/* Word-by-Word Meaning */}
          {wordByWord && wordByWord.length > 0 && (
            <CollapsibleSection
              title="Word-by-Word Meaning"
              isExpanded={expandedSections.wordByWord}
              onToggle={() => toggleSection('wordByWord')}
              theme={theme}
            >
              <View style={dynamicStyles.wordByWordContainer}>
                {wordByWord.map((word, index) => {
                  const sanskritDisplay = word.sanskrit || word.transliteration || '';
                  const transliterationDisplay = word.transliteration && word.transliteration.trim() && word.transliteration !== word.sanskrit 
                    ? ` (${word.transliteration})` 
                    : '';
                  
                  return (
                    <View 
                      key={index} 
                      style={[
                        dynamicStyles.wordByWordItem,
                        index < wordByWord.length - 1 && dynamicStyles.wordByWordItemBorder
                      ]}
                    >
                      <View style={dynamicStyles.wordByWordRow}>
                        <View style={dynamicStyles.wordByWordLeft}>
                          <Text style={dynamicStyles.wordByWordSanskrit}>
                            {sanskritDisplay}
                          </Text>
                          {transliterationDisplay ? (
                            <Text style={dynamicStyles.wordByWordTransliteration}>
                              {transliterationDisplay}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={dynamicStyles.wordByWordArrow}>→</Text>
                        <Text style={dynamicStyles.wordByWordMeaning} numberOfLines={3}>
                          {word.meaning}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </CollapsibleSection>
          )}

          {/* For Deeper Study */}
          {((themes && themes.length > 0) || reflectionPrompt) && (
            <CollapsibleSection
              title="For Deeper Study"
              isExpanded={expandedSections.deeperStudy}
              onToggle={() => toggleSection('deeperStudy')}
              theme={theme}
            >
              <View style={dynamicStyles.deeperStudyContainer}>
                {themes && themes.length > 0 && (
                  <View style={dynamicStyles.deeperStudySection}>
                    <Text style={dynamicStyles.deeperStudyTitle}>Key Themes:</Text>
                    <View style={dynamicStyles.themesContainer}>
                      {themes.map((themeItem, index) => (
                        <View key={index} style={dynamicStyles.themeTag}>
                          <Text style={dynamicStyles.themeTagText}>{themeItem}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {reflectionPrompt && (
                  <View style={dynamicStyles.reflectionContainer}>
                    <Text style={dynamicStyles.reflectionTitle}>Reflection Prompt:</Text>
                    <Text style={dynamicStyles.reflectionText}>
                      "{reflectionPrompt}"
                    </Text>
                  </View>
                )}
              </View>
            </CollapsibleSection>
          )}
        </View>

        {/* Footer Actions */}
        <View style={dynamicStyles.footerContainer}>
          <TouchableOpacity
            style={dynamicStyles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Share shloka"
            accessibilityHint="Double tap to share this shloka"
          >
            <Text style={dynamicStyles.shareIcon}>📤 </Text>
            <Text style={dynamicStyles.shareText}>Share</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.swipeHint}>Swipe for next →</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.background,
    borderRadius: 0, // Full screen cards
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  referenceContainer: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  referenceText: {
    color: theme.textTertiary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
    borderRadius: 20,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  sanskritContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  sanskritText: {
    color: theme.sanskritText,
    fontSize: 26,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  ttsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: theme.primary + '15',
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: theme.primary + '40',
    gap: 8,
  },
  ttsIcon: {
    fontSize: 18,
  },
  ttsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  transliterationContainer: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  transliterationText: {
    color: theme.textSecondary,
    fontSize: 18,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 32,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.divider,
  },
  // Toggle container
  toggleContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: theme.primary + '20',
    borderColor: theme.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  toggleButtonTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  // Translation section - always visible
  meaningContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: theme.primary + '10', // Light amber/orange background
    borderBottomWidth: 2,
    borderBottomColor: theme.primary + '40',
  },
  meaningText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 28,
  },
  meaningBold: {
    fontWeight: '600',
    color: theme.text,
  },
  meaningItalic: {
    fontStyle: 'italic',
    color: theme.text,
  },
  // Why This Matters section - always visible
  whyMattersContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  whyMattersTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  whyMattersText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  whyMattersBold: {
    fontWeight: '600',
    color: theme.text,
  },
  whyMattersItalic: {
    fontStyle: 'italic',
    color: theme.text,
  },
  // Sections container
  sectionsContainer: {
    width: '100%',
    backgroundColor: theme.cardBackground,
  },
  // Collapsible sections
  collapsibleSection: {
    borderBottomWidth: 1,
    borderBottomColor: theme.primary + '20',
  },
  collapsibleHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    minHeight: 44, // Minimum touch target size
  },
  collapsibleTitleContainer: {
    flex: 1,
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  collapsibleHint: {
    fontSize: 11,
    color: theme.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  chevronIcon: {
    fontSize: 14,
    color: theme.primary,
    marginLeft: 8,
  },
  collapsibleContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Section text styles
  sectionText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
  },
  sectionBold: {
    fontWeight: '600',
    color: theme.text,
  },
  sectionItalic: {
    fontStyle: 'italic',
    color: theme.text,
  },
  // Word-by-word
  wordByWordContainer: {
    marginTop: 8,
  },
  wordByWordItem: {
    paddingVertical: 12,
  },
  wordByWordItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.divider + '30',
  },
  wordByWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  wordByWordLeft: {
    flex: 0,
    minWidth: 80,
    maxWidth: '40%',
  },
  wordByWordSanskrit: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.sanskritText || theme.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  wordByWordTransliteration: {
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.textSecondary,
    marginTop: 2,
  },
  wordByWordArrow: {
    fontSize: 14,
    color: theme.textSecondary,
    marginHorizontal: 8,
    flex: 0,
  },
  wordByWordMeaning: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    flex: 1,
    minWidth: 100,
    textAlign: 'right',
  },
  // Examples
  examplesContainer: {
    marginTop: 8,
  },
  exampleItem: {
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  // Deeper study
  deeperStudyContainer: {
    marginTop: 8,
  },
  deeperStudySection: {
    marginBottom: 16,
  },
  deeperStudyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 12,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  themeTag: {
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  themeTagText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
  },
  reflectionContainer: {
    backgroundColor: theme.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 6,
  },
  reflectionText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.textSecondary,
    lineHeight: 20,
  },
  // Footer
  footerContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.divider,
    marginTop: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 16,
  },
  shareText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  swipeHint: {
    fontSize: 11,
    color: theme.textTertiary,
  },
});

