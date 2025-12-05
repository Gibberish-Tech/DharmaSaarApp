/**
 * Utility to convert API shloka data to KnowledgeItem format
 */
import { ShlokaWithExplanation } from '../services/api';
import { KnowledgeItem } from '../data/mockKnowledge';

export function convertShlokaToKnowledgeItem(
  shlokaData: ShlokaWithExplanation
): KnowledgeItem {
  const { shloka, explanation } = shlokaData;

  // Create title from shloka reference
  const title = `${shloka.book_name} - Chapter ${shloka.chapter_number}, Verse ${shloka.verse_number}`;

  // Use explanation text or summary as content, or fallback to transliteration/sanskrit
  const content =
    explanation?.explanation_text ||
    explanation?.summary ||
    shloka.transliteration ||
    shloka.sanskrit_text ||
    '';

  // For detailed content, use the explanation text or detailed explanation
  const detailedContent = explanation?.explanation_text || explanation?.detailed_explanation || content;

  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Handle date formatting - use current date if not available
  const dateString = shloka.created_at 
    ? new Date(shloka.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  // Word-by-word: prefer from shloka
  const wordByWord = 
    (shloka.word_by_word && Array.isArray(shloka.word_by_word) && shloka.word_by_word.length > 0) 
      ? shloka.word_by_word 
      : undefined;

  return {
    id: shloka.id,
    title,
    content,
    detailed_content: detailedContent,
    category: shloka.book_name,
    bodyText: detailedContent,
    readTime: `${readTime} min read`,
    // Store Sanskrit text and transliteration separately for better UI display
    author: shloka.transliteration || undefined,
    source: shloka.sanskrit_text,
    date: dateString,
    // Shloka-specific fields for better UI rendering
    sanskritText: shloka.sanskrit_text,
    transliteration: shloka.transliteration || undefined,
    bookName: shloka.book_name,
    chapterNumber: shloka.chapter_number,
    verseNumber: shloka.verse_number,
    // Store explanation text for backward compatibility
    summaryExplanation: explanation?.explanation_text || explanation?.summary || undefined,
    // Structured fields from explanation
    summary: explanation?.summary || undefined,
    detailedMeaning: explanation?.detailed_meaning || undefined,
    detailedExplanation: explanation?.detailed_explanation || undefined,
    whyThisMatters: explanation?.why_this_matters || undefined,
    context: explanation?.context || undefined,
    wordByWord: wordByWord,
    modernExamples: explanation?.modern_examples || undefined,
    themes: explanation?.themes || undefined,
    reflectionPrompt: explanation?.reflection_prompt || undefined,
  };
}

// Extended interface for better shloka-specific data handling
export interface ShlokaItem extends KnowledgeItem {
  sanskritText?: string;
  transliteration?: string;
  bookName?: string;
  chapterNumber?: number;
  verseNumber?: number;
}

