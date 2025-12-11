/**
 * Utility to parse shloka references from text and extract chapter/verse numbers
 */

export interface ShlokaReference {
  chapter: number;
  verse: number;
  fullText: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse shloka references from text
 * Matches patterns like:
 * - "Chapter 3, Verse 30"
 * - "Chapter 3, Verse 30"
 * - "Ch. 3, V. 30"
 * - "Chapter 2, Verse 47"
 * - "Chapter 3 Verse 30" (without comma)
 */
export function parseShlokaReferences(text: string): ShlokaReference[] {
  const references: ShlokaReference[] = [];
  
  // Pattern to match various formats:
  // - "Chapter X, Verse Y" or "Chapter X Verse Y"
  // - "Ch. X, V. Y" or "Ch. X V. Y"
  // - "Chapter X, Verse Y" (with different spacing)
  const patterns = [
    // "Chapter 3, Verse 30" or "Chapter 3 Verse 30"
    /Chapter\s+(\d+)[,\s]+Verse\s+(\d+)/gi,
    // "Ch. 3, V. 30" or "Ch. 3 V. 30"
    /Ch\.\s*(\d+)[,\s]+V\.\s*(\d+)/gi,
    // "Chapter 3, Verse 30" with optional "in" before
    /(?:in\s+)?Chapter\s+(\d+)[,\s]+Verse\s+(\d+)/gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const chapter = parseInt(match[1], 10);
      const verse = parseInt(match[2], 10);
      
      if (chapter > 0 && verse > 0) {
        references.push({
          chapter,
          verse,
          fullText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }
  
  // Remove duplicates (same chapter/verse at same position)
  const uniqueReferences = references.filter((ref, index, self) =>
    index === self.findIndex((r) =>
      r.chapter === ref.chapter &&
      r.verse === ref.verse &&
      r.startIndex === ref.startIndex
    )
  );
  
  return uniqueReferences.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Split text into segments with shloka references marked
 */
export interface TextSegment {
  text: string;
  isReference: boolean;
  chapter?: number;
  verse?: number;
}

export function splitTextWithReferences(text: string): TextSegment[] {
  const references = parseShlokaReferences(text);
  const segments: TextSegment[] = [];
  
  if (references.length === 0) {
    return [{ text, isReference: false }];
  }
  
  let lastIndex = 0;
  
  for (const ref of references) {
    // Add text before the reference
    if (ref.startIndex > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, ref.startIndex),
        isReference: false,
      });
    }
    
    // Add the reference
    segments.push({
      text: ref.fullText,
      isReference: true,
      chapter: ref.chapter,
      verse: ref.verse,
    });
    
    lastIndex = ref.endIndex;
  }
  
  // Add remaining text after the last reference
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isReference: false,
    });
  }
  
  return segments;
}

