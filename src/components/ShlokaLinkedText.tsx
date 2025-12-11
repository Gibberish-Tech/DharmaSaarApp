/**
 * Component to render text with clickable shloka references
 */
import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { splitTextWithReferences } from '../utils/shlokaReferenceParser';
import { apiService } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type ShlokaLinkedTextNavigationProp = StackNavigationProp<RootStackParamList>;

interface ShlokaLinkedTextProps {
  text: string;
  textStyle?: any;
  linkStyle?: any;
  bookName?: string; // Default: 'Bhagavad Gita'
}

export const ShlokaLinkedText: React.FC<ShlokaLinkedTextProps> = ({
  text,
  textStyle,
  linkStyle,
  bookName = 'Bhagavad Gita',
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<ShlokaLinkedTextNavigationProp>();
  const [loadingRef, setLoadingRef] = useState<{ chapter: number; verse: number } | null>(null);
  
  const segments = splitTextWithReferences(text);
  const dynamicStyles = createStyles(theme);
  
  const handleShlokaPress = async (chapter: number, verse: number) => {
    try {
      setLoadingRef({ chapter, verse });
      
      // Fetch the shloka by chapter/verse to get its ID
      const shlokaData = await apiService.getShlokaByChapterVerse(
        bookName,
        chapter,
        verse
      );
      
      // Navigate directly to shloka detail screen
      navigation.navigate('ShlokaDetail', {
        shlokaId: shlokaData.shloka.id,
      });
    } catch (error) {
      console.error('Error fetching shloka:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load shloka';
      Alert.alert(
        'Shloka Not Found',
        `Could not find ${bookName} Chapter ${chapter}, Verse ${verse}. ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingRef(null);
    }
  };
  
  return (
    <Text style={[dynamicStyles.baseText, textStyle]}>
      {segments.map((segment, index) => {
        if (segment.isReference && segment.chapter && segment.verse) {
          const isLoading = loadingRef?.chapter === segment.chapter && 
                           loadingRef?.verse === segment.verse;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleShlokaPress(segment.chapter!, segment.verse!)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={[dynamicStyles.linkText, linkStyle]}>
                {isLoading ? (
                  <>
                    {segment.text}
                    <ActivityIndicator size="small" color={theme.primary} style={dynamicStyles.loader} />
                  </>
                ) : (
                  segment.text
                )}
              </Text>
            </TouchableOpacity>
          );
        }
        
        return <Text key={index}>{segment.text}</Text>;
      })}
    </Text>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  baseText: {
    fontSize: 15,
    lineHeight: 20,
    color: theme.text,
  },
  linkText: {
    color: theme.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  loader: {
    marginLeft: 4,
  },
});

