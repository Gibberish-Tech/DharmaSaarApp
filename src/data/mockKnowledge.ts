export interface WordByWordItem {
  sanskrit: string;
  transliteration: string;
  meaning: string;
}

export interface ModernExample {
  category: string;
  description: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category?: string;
  detailed_content?: string;
  imageUrl?: string;
  author?: string; // Used for transliteration
  source?: string; // Used for Sanskrit text
  date?: string;
  readTime?: string;
  bodyText?: string;
  // Shloka-specific fields
  sanskritText?: string;
  transliteration?: string;
  bookName?: string;
  chapterNumber?: number;
  verseNumber?: number;
  // Explanation fields for backward compatibility
  summaryExplanation?: string;
  detailedExplanation?: string;
  // Structured fields from explanation
  summary?: string;
  detailedMeaning?: string;
  detailedExplanation?: string;
  whyThisMatters?: string;
  context?: string;
  wordByWord?: WordByWordItem[];
  modernExamples?: ModernExample[];
  themes?: string[];
  reflectionPrompt?: string;
}

export const mockKnowledgeData: KnowledgeItem[] = [
  {
    id: '1',
    title: "Now Google's Bard AI Chatbot can talk & respond to visual prompts!",
    content: 'Google is adding some new features to its Bard AI chatbot, including the ability for Bard to speak its answers to you and for it to respond to prompts that also include images.',
    detailed_content: 'Google is adding some new features to its Bard AI chatbot, including the ability for Bard to speak its answers to you and for it to respond to prompts that also include images.',
    category: 'Technology',
    imageUrl: 'https://placehold.co/375x266',
    author: 'Kyle Barr',
    source: 'The Verge',
    date: 'Jul 13, 2023, 12:31 PM GMT+5:30',
    readTime: '2 min read',
    bodyText: 'Google is adding some new features to its Bard AI chatbot, including the ability for Bard to speak its answers to you and for it to respond to prompts that also include images. The chatbot is also now available in much of the world, including the EU.\n\nIn a blog post, Google is positioning Bard\'s spoken responses as a helpful way to "correct pronunciation of a word or listen to a poem or script." You\'ll be able to hear spoken responses by entering a prompt and selecting the sound icon. Spoken responses will be available in more than 40 languages and are live now, according to Google.\n\nThe feature that lets you add images to prompts is something that Google first showed off at its I/O conference in May. In one example, Google suggested you could use this to ask for help writing a funny caption about a picture of two dogs. Google says the feature is now available in English and is expanding to new languages "soon."\n\nGoogle is introducing a few other new features, too, including the ability to pin and rename conversations, share responses with your friends, and change the tone and style of the responses you get back from Bard.\n\nGoogle first opened up access to Bard in March, but at the time, it was available only in the US and the UK. The company has been rolling out the chatbot to many more countries since then, and that now includes "all countries in the EEA [European Economic Area] and Brazil," Google spokesperson Jennifer Rodstrom tells The Verge. That expansion in Europe is a notable milestone; the company\'s planned Bard launch in the EU was delayed due to privacy concerns.',
  },
  {
    id: '2',
    title: 'The Power of Compound Interest',
    content: 'Compound interest is when you earn interest on both your original investment and the interest you\'ve already earned. Over time, this creates exponential growth. Starting early gives your money more time to compound, making a huge difference in the long run.',
    detailed_content: 'Quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This property, called superposition, allows quantum computers to process vast amounts of information in parallel.Compound interest is when you earn interest on both your original investment and the interest you\'ve already earned. Over time, this creates exponential growth. Starting early gives your money more time to compound, making a huge difference in the long run.',
    category: 'Finance',
  },
  {
    id: '3',
    title: 'Why We Sleep',
    content: 'Sleep is essential for memory consolidation, where your brain transfers information from short-term to long-term storage. During deep sleep, your brain clears out toxins and repairs cells. Adults need 7-9 hours of quality sleep for optimal health and cognitive function.',
    detailed_content: 'Quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This property, called superposition, allows quantum computers to process vast amounts of information in parallel.Sleep is essential for memory consolidation, where your brain transfers information from short-term to long-term storage. During deep sleep, your brain clears out toxins and repairs cells. Adults need 7-9 hours of quality sleep for optimal health and cognitive function.',
    category: 'Health',
  },
  {
    id: '4',
    title: 'The 80/20 Principle',
    content: 'The Pareto Principle states that roughly 80% of effects come from 20% of causes. In business, this often means 80% of sales come from 20% of customers. Focus your efforts on the vital few rather than the trivial many to maximize results.',
    detailed_content: 'Quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This property, called superposition, allows quantum computers to process vast amounts of information in parallel.The Pareto Principle states that roughly 80% of effects come from 20% of causes. In business, this often means 80% of sales come from 20% of customers. Focus your efforts on the vital few rather than the trivial many to maximize results.',
    category: 'Business',
  },
  {
    id: '5',
    title: 'How Photosynthesis Works',
    content: 'Plants convert sunlight, water, and carbon dioxide into glucose (sugar) and oxygen through photosynthesis. This process occurs in chloroplasts, which contain chlorophyll - the green pigment that captures light energy. Without photosynthesis, life on Earth as we know it wouldn\'t exist.',
    detailed_content: 'Quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This property, called superposition, allows quantum computers to process vast amounts of information in parallel.Plants convert sunlight, water, and carbon dioxide into glucose (sugar) and oxygen through photosynthesis. This process occurs in chloroplasts, which contain chlorophyll - the green pigment that captures light energy. Without photosynthesis, life on Earth as we know it wouldn\'t exist.',
    category: 'Science',
  },
  {
    id: '6',
    title: 'The Science of Habits',
    content: 'Habits form through a three-step loop: cue, routine, and reward. Your brain creates neural pathways that make the behavior automatic. To change a habit, keep the same cue and reward but change the routine. Consistency is key - it takes about 66 days on average to form a new habit.',
    detailed_content: 'Quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This property, called superposition, allows quantum computers to process vast amounts of information in parallel. Habits form through a three-step loop: cue, routine, and reward. Your brain creates neural pathways that make the behavior automatic. To change a habit, keep the same cue and reward but change the routine. Consistency is key - it takes about 66 days on average to form a new habit.',
    category: 'Psychology',
  },
  {
    id: '7',
    title: 'Understanding Blockchain',
    content: 'Blockchain is a distributed ledger technology where transactions are recorded in blocks that are linked together in a chain. Each block contains a cryptographic hash of the previous block, making it nearly impossible to alter past records. This creates trust without needing a central authority.',
    detailed_content: 'Quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This property, called superposition, allows quantum computers to process vast amounts of information in parallel. Blockchain is a distributed ledger technology where transactions are recorded in blocks that are linked together in a chain. Each block contains a cryptographic hash of the previous block, making it nearly impossible to alter past records. This creates trust without needing a central authority.',
    category: 'Technology',
  },
  {
    id: '8',
    title: 'The Benefits of Meditation',
    content: 'Regular meditation can reduce stress, improve focus, and increase emotional well-being. Studies show it can physically change your brain structure, increasing gray matter in areas associated with memory and learning. Just 10 minutes a day can make a significant difference.',
    detailed_content: 'Quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This property, called superposition, allows quantum computers to process vast amounts of information in parallel. Regular meditation can reduce stress, improve focus, and increase emotional well-being. Studies show it can physically change your brain structure, increasing gray matter in areas associated with memory and learning. Just 10 minutes a day can make a significant difference.',
    category: 'Health',
  },
];

