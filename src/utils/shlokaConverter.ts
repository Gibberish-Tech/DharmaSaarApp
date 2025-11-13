/**
 * Utility to convert API shloka data to KnowledgeItem format
 */
import { ShlokaWithExplanation } from '../services/api';
import { KnowledgeItem } from '../data/mockKnowledge';

export function convertShlokaToKnowledgeItem(
  shlokaData: ShlokaWithExplanation
): KnowledgeItem {
  const { shloka, summary, detailed } = shlokaData;

  // Create title from shloka reference
  const title = `${shloka.book_name} - Chapter ${shloka.chapter_number}, Verse ${shloka.verse_number}`;

  // Use summary explanation text as content, or fallback to transliteration/sanskrit
  const content =
    summary?.explanation_text ||
    shloka.transliteration ||
    shloka.sanskrit_text ||
    '';

  // For detailed content, use the detailed explanation, or fallback to summary
  const detailedContent = detailed?.explanation_text || summary?.explanation_text || content;

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

  return {
    id: shloka.id,
    title,
    content,
    detailed_content: detailedContent,
    category: shloka.book_name,
    bodyText: detailedContent,
    readTime: `${readTime} min read`,
    // Add Sanskrit text and transliteration as additional metadata
    author: shloka.transliteration ? 'Transliteration' : undefined,
    source: shloka.sanskrit_text,
    date: dateString,
  };
}

