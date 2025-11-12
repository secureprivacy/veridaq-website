// Advanced SEO Analysis Utilities for Content Optimization and Ranking #1

export interface SEOAnalysis {
  wordCount: number;
  charCount: number;
  keywordDensity: number;
  metaTitleLength: number;
  metaDescLength: number;
  readabilityScore: number;
  internalLinks: number;
  externalLinks: number;
  imagesWithoutAlt: number;
  headingStructure: HeadingAnalysis[];
  // Advanced SEO metrics
  titleOptimization: TitleOptimization;
  contentStructure: ContentStructure;
  competitiveAnalysis: CompetitiveAnalysis;
  technicalSEO: TechnicalSEO;
  userExperienceScore: number;
  schemaMarkupSuggestions: string[];
  overallSEOScore: number;
  geoOptimization: GeoOptimization;
  performanceScore: number;
  accessibilityScore: number;
}

export interface GeoOptimization {
  hasLocalReferences: boolean;
  localReferencesFound: string[];
  hasLocalKeywords: boolean;
  geoKeywordsFound: string[];
  hasLocalStructuredData: boolean;
  recommendedGeoKeywords: string[];
}

export interface TitleOptimization {
  hasPowerWords: boolean;
  powerWordsUsed: string[];
  hasNumbers: boolean;
  hasEmotionalWords: boolean;
  emotionalWordsUsed: string[];
  clickThroughRatePotential: number;
  titleSentiment: 'positive' | 'neutral' | 'negative';
}

export interface ContentStructure {
  hasIntroduction: boolean;
  hasConclusion: boolean;
  paragraphCount: number;
  avgSentencesPerParagraph: number;
  avgWordsPerSentence: number;
  hasTableOfContents: boolean;
  hasBulletPoints: boolean;
  hasNumberedLists: boolean;
  contentDepthScore: number;
}

export interface CompetitiveAnalysis {
  recommendedWordCount: number;
  competitorAverageLength: number;
  contentGaps: string[];
  missingTopics: string[];
  semanticKeywords: string[];
}

export interface TechnicalSEO {
  slugOptimization: number;
  urlStructureScore: number;
  metaKeywordsRelevance: number;
  internalLinkingOpportunities: string[];
  imageOptimizationScore: number;
}

export interface HeadingAnalysis {
  level: number;
  text: string;
  hasKeyword: boolean;
  hasSemanticKeywords: boolean;
  wordCount: number;
  optimization: 'excellent' | 'good' | 'needs-improvement';
}

// Power words that increase click-through rates
const POWER_WORDS = [
  'ultimate', 'complete', 'essential', 'proven', 'guaranteed', 'exclusive', 
  'revolutionary', 'breakthrough', 'advanced', 'professional', 'expert',
  'secret', 'hidden', 'revealed', 'exposed', 'insider', 'confidential',
  'instant', 'immediately', 'quick', 'rapid', 'fast', 'accelerated',
  'amazing', 'incredible', 'outstanding', 'remarkable', 'extraordinary',
  'massive', 'huge', 'enormous', 'comprehensive', 'extensive',
  'free', 'bonus', 'extra', 'premium', 'exclusive', 'limited',
  'new', 'latest', 'cutting-edge', 'innovative', 'revolutionary'
];

// Emotional trigger words
const EMOTIONAL_WORDS = [
  'love', 'hate', 'fear', 'surprise', 'excited', 'thrilled', 'devastated',
  'shocked', 'amazed', 'incredible', 'unbelievable', 'stunning', 'gorgeous',
  'terrible', 'awful', 'horrible', 'wonderful', 'fantastic', 'brilliant',
  'devastating', 'heartbreaking', 'inspiring', 'motivating', 'empowering'
];

// Semantic keywords for compliance/KYC industry
const SEMANTIC_KEYWORDS = [
  'compliance management', 'regulatory requirements', 'risk assessment',
  'due diligence', 'customer verification', 'identity verification', 
  'transaction monitoring', 'sanctions screening', 'beneficial ownership',
  'politically exposed persons', 'suspicious activity reporting',
  'anti-money laundering', 'know your customer', 'financial crime',
  'regulatory reporting', 'compliance automation', 'risk mitigation',
  'EU AMLR 2027', 'GDPR compliance', 'financial services compliance',
  'KYC verification process', 'AML screening solutions', 'regulatory technology',
  'compliance platform', 'financial technology', 'regtech solutions',
  'European compliance', 'cross-border compliance', 'regulatory framework',
  'compliance software', 'automated compliance', 'compliance monitoring'
];

export function analyzeContent(
  title: string,
  content: string,
  excerpt: string,
  metaTitle: string,
  metaDescription: string,
  focusKeyword: string
): SEOAnalysis {
  const cleanContent = stripHtmlTags(content);
  const allText = `${title} ${cleanContent} ${excerpt}`.toLowerCase();
  
  // Basic metrics
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const charCount = cleanContent.length;
  
  // Keyword analysis
  const keywordOccurrences = focusKeyword ? 
    (allText.match(new RegExp(focusKeyword.toLowerCase(), 'g')) || []).length : 0;
  const keywordDensity = wordCount > 0 ? (keywordOccurrences / words.length) * 100 : 0;
  
  // Meta lengths
  const metaTitleLength = metaTitle.length || title.length;
  const metaDescLength = metaDescription.length || excerpt.length;
  
  // Advanced analysis
  const readabilityScore = calculateAdvancedReadabilityScore(cleanContent);
  const { internalLinks, externalLinks } = analyzeLinkStructure(content);
  const imagesWithoutAlt = analyzeImageOptimization(content);
  const headingStructure = analyzeAdvancedHeadings(content, focusKeyword);
  
  // Title optimization
  const titleOptimization = analyzeTitleOptimization(title || metaTitle);
  
  // Content structure
  const contentStructure = analyzeContentStructure(content, cleanContent);
  
  // Competitive analysis
  const competitiveAnalysis = analyzeCompetitiveFactors(focusKeyword, wordCount, content);
  
  // Technical SEO
  const technicalSEO = analyzeTechnicalSEO(title, content, metaTitle, metaDescription);
  
  // User experience score
  const userExperienceScore = calculateUserExperienceScore(contentStructure, readabilityScore, wordCount);
  
  // Schema markup suggestions
  const schemaMarkupSuggestions = generateSchemaMarkupSuggestions(content, title);
  
  // Geo optimization analysis
  const geoOptimization = analyzeGeoOptimization(allText, focusKeyword);
  
  // Performance score (based on content optimization)
  const performanceScore = calculatePerformanceScore(content, wordCount);
  
  // Accessibility score
  const accessibilityScore = calculateAccessibilityScore(content);
  
  // Overall SEO score
  const overallSEOScore = calculateOverallSEOScore({
    wordCount,
    keywordDensity,
    metaTitleLength,
    metaDescLength,
    readabilityScore,
    internalLinks,
    externalLinks,
    imagesWithoutAlt,
    headingStructure,
    titleOptimization,
    contentStructure,
    technicalSEO,
    userExperienceScore,
    geoOptimization,
    performanceScore,
    accessibilityScore
  });
  
  return {
    wordCount,
    charCount,
    keywordDensity,
    metaTitleLength,
    metaDescLength,
    readabilityScore,
    internalLinks,
    externalLinks,
    imagesWithoutAlt,
    headingStructure,
    titleOptimization,
    contentStructure,
    competitiveAnalysis,
    technicalSEO,
    userExperienceScore,
    schemaMarkupSuggestions,
    overallSEOScore,
    geoOptimization,
    performanceScore,
    accessibilityScore
  };
}

export function generateSlug(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60); // Limit slug length for SEO
}

function analyzeTitleOptimization(title: string): TitleOptimization {
  const titleLower = title.toLowerCase();
  
  // Check for power words
  const powerWordsUsed = POWER_WORDS.filter(word => 
    titleLower.includes(word.toLowerCase())
  );
  const hasPowerWords = powerWordsUsed.length > 0;
  
  // Check for numbers
  const hasNumbers = /\d/.test(title);
  
  // Check for emotional words
  const emotionalWordsUsed = EMOTIONAL_WORDS.filter(word =>
    titleLower.includes(word.toLowerCase())
  );
  const hasEmotionalWords = emotionalWordsUsed.length > 0;
  
  // Calculate click-through rate potential
  let ctrPotential = 50; // Base score
  if (hasPowerWords) ctrPotential += 15;
  if (hasNumbers) ctrPotential += 10;
  if (hasEmotionalWords) ctrPotential += 12;
  if (title.length >= 40 && title.length <= 60) ctrPotential += 8;
  if (title.includes('?') || title.includes('!')) ctrPotential += 5;
  
  // Determine sentiment
  const positiveWords = ['best', 'amazing', 'great', 'excellent', 'outstanding'];
  const negativeWords = ['worst', 'terrible', 'avoid', 'mistake', 'failure'];
  
  let titleSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveWords.some(word => titleLower.includes(word))) {
    titleSentiment = 'positive';
  } else if (negativeWords.some(word => titleLower.includes(word))) {
    titleSentiment = 'negative';
  }
  
  return {
    hasPowerWords,
    powerWordsUsed,
    hasNumbers,
    hasEmotionalWords,
    emotionalWordsUsed,
    clickThroughRatePotential: Math.min(100, ctrPotential),
    titleSentiment
  };
}

function analyzeContentStructure(htmlContent: string, cleanContent: string): ContentStructure {
  // Check for introduction (first paragraph should be substantial)
  const paragraphs = cleanContent.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  const hasIntroduction = paragraphs.length > 0 && paragraphs[0].length > 100;
  
  // Check for conclusion (look for conclusion keywords in last paragraphs)
  const conclusionKeywords = ['conclusion', 'summary', 'in summary', 'to conclude', 'finally', 'in closing'];
  const lastParagraphs = paragraphs.slice(-2).join(' ').toLowerCase();
  const hasConclusion = conclusionKeywords.some(keyword => lastParagraphs.includes(keyword)) || 
                       paragraphs[paragraphs.length - 1]?.length > 100;
  
  // Analyze paragraph structure
  const paragraphCount = paragraphs.length;
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const avgSentencesPerParagraph = paragraphCount > 0 ? sentences.length / paragraphCount : 0;
  
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  
  // Check for structured content
  const hasTableOfContents = htmlContent.includes('table of contents') || 
                            htmlContent.includes('toc') ||
                            /(<h[1-6][^>]*>.*?<\/h[1-6]>.*?){4,}/i.test(htmlContent);
  
  const hasBulletPoints = htmlContent.includes('<ul>') || htmlContent.includes('<li>');
  const hasNumberedLists = htmlContent.includes('<ol>');
  
  // Calculate content depth score
  let contentDepthScore = 0;
  if (hasIntroduction) contentDepthScore += 20;
  if (hasConclusion) contentDepthScore += 15;
  if (paragraphCount >= 5) contentDepthScore += 15;
  if (hasBulletPoints) contentDepthScore += 10;
  if (hasNumberedLists) contentDepthScore += 10;
  if (hasTableOfContents) contentDepthScore += 20;
  if (avgWordsPerSentence > 15 && avgWordsPerSentence < 25) contentDepthScore += 10;
  
  return {
    hasIntroduction,
    hasConclusion,
    paragraphCount,
    avgSentencesPerParagraph,
    avgWordsPerSentence,
    hasTableOfContents,
    hasBulletPoints,
    hasNumberedLists,
    contentDepthScore: Math.min(100, contentDepthScore)
  };
}

function analyzeCompetitiveFactors(focusKeyword: string, currentWordCount: number, content: string): CompetitiveAnalysis {
  // Recommend word count based on keyword competitiveness
  let recommendedWordCount = 1500; // Default for competitive keywords
  
  if (focusKeyword) {
    const keywordLower = focusKeyword.toLowerCase();
    
    // High-competition keywords need longer content
    if (keywordLower.includes('kyc') || keywordLower.includes('compliance') || keywordLower.includes('aml')) {
      recommendedWordCount = 2000;
    }
    
    // Long-tail keywords can be shorter
    if (focusKeyword.split(' ').length >= 4) {
      recommendedWordCount = 1200;
    }
  }
  
  // Find semantic keywords present in content
  const contentLower = content.toLowerCase();
  const semanticKeywordsFound = SEMANTIC_KEYWORDS.filter(keyword => 
    contentLower.includes(keyword)
  );
  
  // Suggest content gaps based on missing semantic keywords
  const contentGaps = SEMANTIC_KEYWORDS.filter(keyword => 
    !contentLower.includes(keyword)
  ).slice(0, 5);
  
  // Suggest missing topics for comprehensive coverage
  const missingTopics = [
    'Implementation best practices',
    'Cost-benefit analysis', 
    'Common challenges and solutions',
    'Industry-specific considerations',
    'Regulatory updates and changes'
  ].filter(topic => !contentLower.includes(topic.toLowerCase()));
  
  return {
    recommendedWordCount,
    competitorAverageLength: recommendedWordCount,
    contentGaps,
    missingTopics: missingTopics.slice(0, 3),
    semanticKeywords: semanticKeywordsFound
  };
}

function analyzeTechnicalSEO(title: string, content: string, metaTitle: string, metaDescription: string): TechnicalSEO {
  // Slug optimization score
  const slug = generateSlug(title);
  let slugOptimization = 0;
  if (slug.length >= 10 && slug.length <= 60) slugOptimization += 30;
  if (!slug.includes('--')) slugOptimization += 20;
  if (slug.split('-').length >= 2 && slug.split('-').length <= 6) slugOptimization += 25;
  if (!/\d{4}/.test(slug)) slugOptimization += 25; // No years in slug
  
  // URL structure score (based on slug quality)
  const urlStructureScore = slugOptimization;
  
  // Meta keywords relevance
  const metaKeywords = metaDescription.toLowerCase().split(/[,\s]+/);
  const contentWords = content.toLowerCase().split(/\s+/);
  const relevantKeywords = metaKeywords.filter(keyword => 
    keyword.length > 2 && contentWords.some(word => word.includes(keyword))
  );
  const metaKeywordsRelevance = metaKeywords.length > 0 ? 
    (relevantKeywords.length / metaKeywords.length) * 100 : 0;
  
  // Internal linking opportunities
  const internalLinkingOpportunities = findInternalLinkingOpportunities(content);
  
  // Image optimization score
  const imageOptimizationScore = calculateImageOptimizationScore(content);
  
  return {
    slugOptimization,
    urlStructureScore,
    metaKeywordsRelevance,
    internalLinkingOpportunities,
    imageOptimizationScore
  };
}

function calculateUserExperienceScore(
  contentStructure: ContentStructure, 
  readabilityScore: number, 
  wordCount: number
): number {
  let uxScore = 0;
  
  // Content structure contributes to UX
  uxScore += contentStructure.contentDepthScore * 0.3;
  
  // Readability contributes significantly
  if (readabilityScore >= 60) uxScore += 25;
  else if (readabilityScore >= 50) uxScore += 15;
  else uxScore += 5;
  
  // Optimal word count for user engagement
  if (wordCount >= 800 && wordCount <= 2500) uxScore += 20;
  else if (wordCount >= 500) uxScore += 10;
  
  // Structured content improves UX
  if (contentStructure.hasBulletPoints) uxScore += 8;
  if (contentStructure.hasNumberedLists) uxScore += 8;
  if (contentStructure.paragraphCount >= 5) uxScore += 7;
  if (contentStructure.avgWordsPerSentence < 25) uxScore += 7;
  
  return Math.min(100, Math.round(uxScore));
}

function generateSchemaMarkupSuggestions(content: string, title: string): string[] {
  const suggestions: string[] = [];
  const contentLower = content.toLowerCase();
  
  // BlogPosting schema (always recommend for blog posts)
  suggestions.push('Article Schema - Recommended for all blog posts');
  
  // FAQ schema if content has questions
  if (contentLower.includes('?') || contentLower.includes('frequently asked')) {
    suggestions.push('FAQ Schema - Content contains questions/answers');
  }
  
  // How-to schema if content is instructional
  if (contentLower.includes('how to') || contentLower.includes('step') || content.includes('<ol>')) {
    suggestions.push('HowTo Schema - Step-by-step content detected');
  }
  
  // Organization schema for company-related content
  if (contentLower.includes('veridaq') || contentLower.includes('company') || contentLower.includes('about us')) {
    suggestions.push('Organization Schema - Company information detected');
  }
  
  // Service schema for service-related content
  if (contentLower.includes('service') || contentLower.includes('solution') || contentLower.includes('platform')) {
    suggestions.push('Service Schema - Service offerings detected');
  }
  
  // Organization schema for company content
  if (contentLower.includes('about') || contentLower.includes('company') || contentLower.includes('team')) {
    suggestions.push('Organization Schema - Company information detected');
  }
  
  return suggestions;
}

function analyzeGeoOptimization(text: string, focusKeyword: string): GeoOptimization {
  // EU-specific references
  const localReferences = [
    'european union', 'eu amlr', 'gdpr', 'denmark', 'sweden', 'norway', 'finland',
    'germany', 'france', 'spain', 'italy', 'portugal', 'netherlands', 'belgium',
    'copenhagen', 'stockholm', 'oslo', 'helsinki', 'berlin', 'paris', 'madrid',
    'rome', 'lisbon', 'amsterdam', 'brussels'
  ];
  
  const geoKeywords = [
    'eu compliance', 'european compliance', 'gdpr compliance', 'eu amlr 2027',
    'nordic compliance', 'scandinavian compliance', 'eu financial regulations',
    'european banking compliance', 'eu kyc requirements', 'european aml standards'
  ];
  
  const localReferencesFound = localReferences.filter(ref => 
    text.toLowerCase().includes(ref)
  );
  
  const geoKeywordsFound = geoKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  const recommendedGeoKeywords = [
    'EU AMLR 2027 compliance',
    'European KYC verification', 
    'GDPR compliant AML solutions',
    'Nordic financial compliance',
    'European banking regulations',
    'EU financial technology compliance'
  ].filter(keyword => !geoKeywordsFound.includes(keyword));
  
  return {
    hasLocalReferences: localReferencesFound.length > 0,
    localReferencesFound,
    hasLocalKeywords: geoKeywordsFound.length > 0,
    geoKeywordsFound,
    hasLocalStructuredData: text.includes('schema') || text.includes('structured data'),
    recommendedGeoKeywords: recommendedGeoKeywords.slice(0, 5)
  };
}

function calculatePerformanceScore(content: string, wordCount: number): number {
  let score = 100;
  
  // Penalize very long content (affects loading time)
  if (wordCount > 3000) score -= 15;
  else if (wordCount > 2000) score -= 5;
  
  // Check for performance-heavy elements
  const images = (content.match(/<img/g) || []).length;
  if (images > 10) score -= 10;
  else if (images > 5) score -= 5;
  
  // Check for lazy loading implementation
  const lazyImages = (content.match(/loading="lazy"/g) || []).length;
  if (lazyImages > 0 && images > 0) {
    score += Math.min(10, (lazyImages / images) * 10);
  }
  
  // Check for optimized image formats
  const webpImages = (content.match(/\.webp/g) || []).length;
  if (webpImages > 0) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculateAccessibilityScore(content: string): number {
  let score = 100;
  
  // Check for images without alt text
  const images = (content.match(/<img[^>]*>/g) || []);
  const imagesWithoutAlt = images.filter(img => 
    !img.includes('alt=') || img.includes('alt=""') || img.includes("alt=''")
  ).length;
  
  if (imagesWithoutAlt > 0) {
    score -= (imagesWithoutAlt / images.length) * 30;
  }
  
  // Check for proper heading hierarchy
  const headings = [...content.matchAll(/<h([1-6])[^>]*>/g)];
  if (headings.length > 0) {
    const levels = headings.map(h => parseInt(h[1]));
    const hasProperHierarchy = levels.every((level, index) => {
      if (index === 0) return level <= 2; // First heading should be h1 or h2
      return level <= levels[index - 1] + 1; // Each heading should not skip levels
    });
    
    if (!hasProperHierarchy) score -= 15;
  }
  
  // Check for color contrast (simplified check for color-only information)
  if (content.includes('color:') && !content.includes('aria-label')) {
    score -= 10;
  }
  
  // Check for meaningful link text
  const links = (content.match(/<a[^>]*>(.*?)<\/a>/g) || []);
  const poorLinkText = links.filter(link => {
    const text = link.replace(/<[^>]*>/g, '').trim().toLowerCase();
    return ['click here', 'read more', 'here', 'link'].includes(text);
  }).length;
  
  if (poorLinkText > 0) {
    score -= (poorLinkText / links.length) * 20;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateOverallSEOScore(analysis: any): number {
  let score = 0;
  let maxScore = 0;
  
  // Content quality (25%)
  const contentWeight = 25;
  maxScore += contentWeight;
  if (analysis.wordCount >= 800) score += contentWeight * 0.4;
  if (analysis.readabilityScore >= 60) score += contentWeight * 0.3;
  if (analysis.contentStructure.contentDepthScore >= 70) score += contentWeight * 0.3;
  
  // Keyword optimization (20%)
  const keywordWeight = 20;
  maxScore += keywordWeight;
  if (analysis.keywordDensity >= 0.5 && analysis.keywordDensity <= 3) score += keywordWeight * 0.5;
  if (analysis.headingStructure.some((h: any) => h.hasKeyword)) score += keywordWeight * 0.3;
  if (analysis.titleOptimization.hasPowerWords) score += keywordWeight * 0.2;
  
  // Technical SEO (20%)
  const technicalWeight = 20;
  maxScore += technicalWeight;
  if (analysis.metaTitleLength >= 30 && analysis.metaTitleLength <= 60) score += technicalWeight * 0.3;
  if (analysis.metaDescLength >= 120 && analysis.metaDescLength <= 160) score += technicalWeight * 0.3;
  if (analysis.technicalSEO.slugOptimization >= 80) score += technicalWeight * 0.2;
  if (analysis.imagesWithoutAlt === 0 && analysis.internalLinks > 0) score += technicalWeight * 0.2;
  
  // User experience (15%)
  const uxWeight = 15;
  maxScore += uxWeight;
  score += (analysis.userExperienceScore / 100) * uxWeight;
  
  // Geo optimization (10%)
  const geoWeight = 10;
  maxScore += geoWeight;
  if (analysis.geoOptimization?.hasLocalReferences) score += geoWeight * 0.4;
  if (analysis.geoOptimization?.hasLocalKeywords) score += geoWeight * 0.4;
  if (analysis.geoOptimization?.hasLocalStructuredData) score += geoWeight * 0.2;
  
  // Performance (5%)
  const performanceWeight = 5;
  maxScore += performanceWeight;
  score += (analysis.performanceScore / 100) * performanceWeight;
  
  // Accessibility (5%)
  const accessibilityWeight = 5;
  maxScore += accessibilityWeight;
  score += (analysis.accessibilityScore / 100) * accessibilityWeight;
  
  return Math.round((score / maxScore) * 100);
}

function analyzeAdvancedHeadings(content: string, focusKeyword: string): HeadingAnalysis[] {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  const headings = [...content.matchAll(headingRegex)];
  
  return headings.map(heading => {
    const level = parseInt(heading[1]);
    const text = stripHtmlTags(heading[2]);
    const textLower = text.toLowerCase();
    
    // Check for focus keyword
    const hasKeyword = focusKeyword ? textLower.includes(focusKeyword.toLowerCase()) : false;
    
    // Check for semantic keywords
    const hasSemanticKeywords = SEMANTIC_KEYWORDS.some(keyword => 
      textLower.includes(keyword)
    );
    
    const wordCount = text.split(/\s+/).length;
    
    // Determine optimization level
    let optimization: 'excellent' | 'good' | 'needs-improvement' = 'needs-improvement';
    if (hasKeyword && wordCount >= 3 && wordCount <= 10) {
      optimization = 'excellent';
    } else if (hasKeyword || hasSemanticKeywords || (wordCount >= 3 && wordCount <= 15)) {
      optimization = 'good';
    }
    
    return {
      level,
      text,
      hasKeyword,
      hasSemanticKeywords,
      wordCount,
      optimization
    };
  });
}

function calculateAdvancedReadabilityScore(text: string): number {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (words.length === 0 || sentences.length === 0) return 0;
  
  // Calculate syllables
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  
  // Flesch Reading Ease with modifications for business content
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  let score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  // Adjust for business/technical content (slightly more lenient)
  if (text.toLowerCase().includes('compliance') || text.toLowerCase().includes('regulation')) {
    score += 5; // Technical content gets slight boost
  }
  
  return Math.max(0, Math.min(100, score));
}

function analyzeLinkStructure(content: string): { internalLinks: number; externalLinks: number } {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  const links = [...content.matchAll(linkRegex)];
  
  let internalLinks = 0;
  let externalLinks = 0;
  
  links.forEach(link => {
    const url = link[1];
    if (url.startsWith('#') || url.startsWith('/') || url.includes('veridaq.com')) {
      internalLinks++;
    } else if (url.startsWith('http')) {
      externalLinks++;
    }
  });
  
  return { internalLinks, externalLinks };
}

function analyzeImageOptimization(content: string): number {
  const imgRegex = /<img[^>]*>/gi;
  const images = [...content.matchAll(imgRegex)];
  
  if (images.length === 0) return 0;
  
  return images.filter(img => !img[0].includes('alt=') || img[0].includes('alt=""')).length;
}

function findInternalLinkingOpportunities(content: string): string[] {
  const contentLower = content.toLowerCase();
  const opportunities: string[] = [];
  
  // Look for mentions of services/features that could be linked
  const linkableTerms = [
    'kyc verification',
    'aml screening', 
    'compliance platform',
    'risk assessment',
    'transaction monitoring',
    'due diligence'
  ];
  
  linkableTerms.forEach(term => {
    if (contentLower.includes(term) && !contentLower.includes(`<a[^>]*>${term}`)) {
      opportunities.push(`Link "${term}" to relevant service page`);
    }
  });
  
  return opportunities.slice(0, 3);
}

function calculateImageOptimizationScore(content: string): number {
  const imgRegex = /<img[^>]*>/gi;
  const images = [...content.matchAll(imgRegex)];
  
  if (images.length === 0) return 100; // Perfect score if no images
  
  let optimizedImages = 0;
  
  images.forEach(img => {
    const imgTag = img[0];
    let score = 0;
    
    // Has alt text
    if (imgTag.includes('alt=') && !imgTag.includes('alt=""')) score += 40;
    
    // Has width/height attributes
    if (imgTag.includes('width=') && imgTag.includes('height=')) score += 30;
    
    // Has loading attribute
    if (imgTag.includes('loading=')) score += 15;
    
    // Has descriptive filename (not random)
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1] && !/\d{10,}/.test(srcMatch[1])) score += 15;
    
    if (score >= 70) optimizedImages++;
  });
  
  return Math.round((optimizedImages / images.length) * 100);
}

// Enhanced feedback functions
export function getMetaTitleFeedback(length: number): { 
  status: 'short' | 'good' | 'long'; 
  message: string;
  color: string;
} {
  if (length < 30) {
    return { 
      status: 'short', 
      message: 'Too short - add more descriptive words (aim for 50-60)', 
      color: 'text-warning-600' 
    };
  } else if (length <= 60) {
    return { 
      status: 'good', 
      message: 'Perfect length for search results', 
      color: 'text-success-600' 
    };
  } else {
    return { 
      status: 'long', 
      message: 'Too long - will be truncated in search results', 
      color: 'text-error-600' 
    };
  }
}

export function getMetaDescFeedback(length: number): { 
  status: 'short' | 'good' | 'long'; 
  message: string;
  color: string;
} {
  if (length < 120) {
    return { 
      status: 'short', 
      message: 'Too short - add compelling details (aim for 150-160)', 
      color: 'text-warning-600' 
    };
  } else if (length <= 160) {
    return { 
      status: 'good', 
      message: 'Excellent length for maximum visibility', 
      color: 'text-success-600' 
    };
  } else {
    return { 
      status: 'long', 
      message: 'Too long - content will be cut off', 
      color: 'text-error-600' 
    };
  }
}

export function getKeywordDensityFeedback(density: number): {
  status: 'low' | 'good' | 'high';
  message: string;
  color: string;
} {
  if (density < 0.5) {
    return {
      status: 'low',
      message: 'Use your focus keyword more naturally throughout content',
      color: 'text-warning-600'
    };
  } else if (density <= 2.5) {
    return {
      status: 'good', 
      message: 'Optimal keyword density for ranking',
      color: 'text-success-600'
    };
  } else {
    return {
      status: 'high',
      message: 'Keyword stuffing detected - reduce usage for better ranking',
      color: 'text-error-600'
    };
  }
}

export function getReadabilityFeedback(score: number): {
  level: string;
  message: string;
  color: string;
} {
  if (score >= 90) {
    return { level: 'Very Easy', message: 'Excellent for user engagement', color: 'text-success-600' };
  } else if (score >= 80) {
    return { level: 'Easy', message: 'Great for broad audience appeal', color: 'text-success-600' };
  } else if (score >= 70) {
    return { level: 'Fairly Easy', message: 'Good balance for business content', color: 'text-accent-600' };
  } else if (score >= 60) {
    return { level: 'Standard', message: 'Acceptable for professional audience', color: 'text-primary-600' };
  } else if (score >= 50) {
    return { level: 'Fairly Difficult', message: 'Consider simplifying sentences', color: 'text-warning-600' };
  } else {
    return { level: 'Difficult', message: 'Too complex - will hurt rankings', color: 'text-error-600' };
  }
}

export function getContentLengthRecommendation(currentLength: number, recommendedLength: number): {
  status: 'short' | 'good' | 'long';
  message: string;
  color: string;
} {
  const ratio = currentLength / recommendedLength;
  
  if (ratio < 0.7) {
    return {
      status: 'short',
      message: `Add ${recommendedLength - currentLength} words for competitive depth`,
      color: 'text-warning-600'
    };
  } else if (ratio <= 1.2) {
    return {
      status: 'good',
      message: 'Perfect length for target keyword competitiveness',
      color: 'text-success-600'
    };
  } else {
    return {
      status: 'long',
      message: 'Consider breaking into multiple focused articles',
      color: 'text-neutral-600'
    };
  }
}

// Helper functions
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let count = 0;
  let prevWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !prevWasVowel) count++;
    prevWasVowel = isVowel;
  }
  
  // Handle silent e
  if (word.endsWith('e')) count--;
  
  // Handle special cases
  if (word.endsWith('le') && word.length > 2) count++;
  
  return Math.max(1, count);
}