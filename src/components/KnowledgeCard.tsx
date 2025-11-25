import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { KnowledgeItem } from '../data/mockKnowledge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormattedText } from './FormattedText';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, width: size, height: size }}>
      <Text style={{ fontWeight: '400', fontSize: size, color: omColor }}>ॐ</Text>
    </View>
  );
};

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  
  // Extract shloka-specific data
  const sanskritText = item.sanskritText || item.source || '';
  const transliteration = item.transliteration || item.author || '';
  const bookName = item.bookName || item.category || '';
  const chapterNumber = item.chapterNumber;
  const verseNumber = item.verseNumber;
  const explanation = item.bodyText || item.detailed_content || item.content || '';

  return (
    <View style={dynamicStyles.card}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={[
          dynamicStyles.scrollContent,
          { 
            paddingTop: Math.max(insets.top + 20, 40),
            paddingBottom: Math.max(insets.bottom + 20, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Book Reference - Subtle, top */}
        <View style={dynamicStyles.referenceContainer}>
          <Text style={dynamicStyles.referenceText}>
            {bookName}
            {chapterNumber && verseNumber && ` • Chapter ${chapterNumber}, Verse ${verseNumber}`}
          </Text>
        </View>

        {/* Sanskrit Text - Prominent, centered */}
        {sanskritText ? (
          <View style={dynamicStyles.sanskritContainer}>
            <Text style={dynamicStyles.sanskritText}>{sanskritText}</Text>
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

        {/* Translation/Explanation - Clear, readable */}
        {explanation ? (
          <View style={dynamicStyles.explanationContainer}>
            <FormattedText
              text={explanation}
              style={dynamicStyles.explanationText}
              boldStyle={dynamicStyles.explanationBold}
              italicStyle={dynamicStyles.explanationItalic}
            />
          </View>
        ) : null}

        {/* Spacer at bottom */}
        <View style={dynamicStyles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.cardBackground,
    borderRadius: 0, // Full screen cards
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  referenceContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  referenceText: {
    color: theme.textTertiary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sanskritContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sanskritText: {
    color: theme.sanskritText,
    fontSize: 26,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  transliterationContainer: {
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 8,
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
  omContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  omSymbol: {
    fontWeight: '400',
  },
  explanationContainer: {
    width: '100%',
    marginTop: 8,
  },
  explanationText: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'left',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  explanationBold: {
    fontWeight: '600',
    color: theme.text,
  },
  explanationItalic: {
    fontStyle: 'italic',
    color: theme.text,
  },
  bottomSpacer: {
    height: 40,
  },
});
