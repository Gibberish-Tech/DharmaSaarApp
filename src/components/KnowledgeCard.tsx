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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KnowledgeCardProps {
  item: KnowledgeItem;
}

// Simple Om symbol component
const OmSymbol: React.FC<{ size?: number; color?: string }> = ({ 
  size = 24, 
  color = '#8B2E3D' 
}) => (
  <View style={[styles.omContainer, { width: size, height: size }]}>
    <Text style={[styles.omSymbol, { fontSize: size, color }]}>ॐ</Text>
  </View>
);

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item }) => {
  const insets = useSafeAreaInsets();
  
  // Extract shloka-specific data
  const sanskritText = item.sanskritText || item.source || '';
  const transliteration = item.transliteration || item.author || '';
  const bookName = item.bookName || item.category || '';
  const chapterNumber = item.chapterNumber;
  const verseNumber = item.verseNumber;
  const explanation = item.bodyText || item.detailed_content || item.content || '';

  return (
    <View style={styles.card}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: Math.max(insets.top + 20, 40),
            paddingBottom: Math.max(insets.bottom + 20, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Book Reference - Subtle, top */}
        <View style={styles.referenceContainer}>
          <Text style={styles.referenceText}>
            {bookName}
            {chapterNumber && verseNumber && ` • Chapter ${chapterNumber}, Verse ${verseNumber}`}
          </Text>
        </View>

        {/* Sanskrit Text - Prominent, centered */}
        {sanskritText ? (
          <View style={styles.sanskritContainer}>
            <Text style={styles.sanskritText}>{sanskritText}</Text>
          </View>
        ) : null}

        {/* Transliteration - Below Sanskrit, italic */}
        {transliteration ? (
          <View style={styles.transliterationContainer}>
            <Text style={styles.transliterationText}>{transliteration}</Text>
          </View>
        ) : null}

        {/* Decorative Divider with Om */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <OmSymbol size={28} color="#FF8C42" />
          <View style={styles.dividerLine} />
        </View>

        {/* Translation/Explanation - Clear, readable */}
        {explanation ? (
          <View style={styles.explanationContainer}>
            <FormattedText
              text={explanation}
              style={styles.explanationText}
              boldStyle={styles.explanationBold}
              italicStyle={styles.explanationItalic}
            />
          </View>
        ) : null}

        {/* Spacer at bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 0, // Full screen cards
    shadowColor: '#000',
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
    color: '#9B8A7F',
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
    color: '#8B2E3D',
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
    color: '#6B5B4F',
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
    backgroundColor: '#E8E0D6',
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
    color: '#2A1F1A',
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'left',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  explanationBold: {
    fontWeight: '600',
    color: '#2A1F1A',
  },
  explanationItalic: {
    fontStyle: 'italic',
    color: '#2A1F1A',
  },
  bottomSpacer: {
    height: 40,
  },
});
