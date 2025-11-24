/**
 * FormattedText - Component to render text with basic markdown formatting
 * Supports: **bold**, *italic*, and line breaks
 */
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface FormattedTextProps {
  text: string;
  style?: TextStyle;
  baseStyle?: TextStyle;
  boldStyle?: TextStyle;
  italicStyle?: TextStyle;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  style,
  baseStyle,
  boldStyle,
  italicStyle,
}) => {
  // Parse markdown and create nested Text components
  const parseMarkdown = (input: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    // Regex to match **bold**, *italic*, and combinations
    // Order matters: bold+italic first, then bold, then italic
    const patterns = [
      { regex: /\*\*\*([^*]+?)\*\*\*/g, type: 'boldItalic' }, // ***bold italic***
      { regex: /\*\*([^*]+?)\*\*/g, type: 'bold' }, // **bold**
      { regex: /\*([^*]+?)\*/g, type: 'italic' }, // *italic*
    ];

    // Find all matches with their positions
    const matches: Array<{
      start: number;
      end: number;
      text: string;
      type: 'bold' | 'italic' | 'boldItalic';
    }> = [];

    patterns.forEach(({ regex, type }) => {
      let match;
      regex.lastIndex = 0; // Reset regex
      while ((match = regex.exec(input)) !== null) {
        // Check if this match overlaps with an existing match
        const overlaps = matches.some(
          (m) =>
            (match!.index >= m.start && match!.index < m.end) ||
            (match!.index + match![0].length > m.start &&
              match!.index + match![0].length <= m.end) ||
            (match!.index < m.start &&
              match!.index + match![0].length > m.end)
        );

        if (!overlaps) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[1],
            type: type as 'bold' | 'italic' | 'boldItalic',
          });
        }
      }
    });

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);

    // Build the text parts (nested Text components)
    matches.forEach((match) => {
      // Add text before the match
      if (match.start > currentIndex) {
        const beforeText = input.substring(currentIndex, match.start);
        if (beforeText) {
          parts.push(beforeText);
        }
      }

      // Add the formatted text as a nested Text component
      const textStyle: TextStyle[] = [baseStyle, style];
      if (match.type === 'bold' || match.type === 'boldItalic') {
        textStyle.push(styles.bold, boldStyle);
      }
      if (match.type === 'italic' || match.type === 'boldItalic') {
        textStyle.push(styles.italic, italicStyle);
      }

      parts.push(
        <Text key={key++} style={textStyle}>
          {match.text}
        </Text>
      );

      currentIndex = match.end;
    });

    // Add remaining text after the last match
    if (currentIndex < input.length) {
      const remainingText = input.substring(currentIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts;
  };

  // Handle line breaks - split by newlines and process each line
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const parsedLine = parseMarkdown(line);
    result.push(...parsedLine);
    if (lineIndex < lines.length - 1) {
      result.push('\n');
    }
  });

  // If no formatting found, return plain text
  if (result.length === 1 && typeof result[0] === 'string') {
    return <Text style={[baseStyle, style]}>{result[0]}</Text>;
  }

  // Return nested Text components
  return <Text style={[baseStyle, style]}>{result}</Text>;
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: '600',
  },
  italic: {
    fontStyle: 'italic',
  },
});

