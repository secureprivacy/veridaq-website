/*
  Enhanced Supabase Edge Function for AI Post Translation
  
  This function handles automatic translation of blog posts using Claude or ChatGPT APIs
  with advanced cultural localization and quality assurance.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ALLOWED_MODELS = [
  'claude-3-haiku-20240307',
  'claude-3-5-haiku-20241022',
  'claude-haiku-4-5-20251001'
];

interface TranslationRequest {
  postId: string;
  targetLanguages: string[];
  translationProvider: 'claude' | 'openai';
  model?: string;
  localizationNotes?: string;
}

Deno.serve(async (req: Request) => {
  console.log('🚀 translate-post function called, method:', req.method);

  if (req.method === "OPTIONS") {
    console.log('OPTIONS request received, returning CORS headers');
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('📥 Processing translation request...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('✅ Supabase client created');

    const requestBody = await req.json();
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));

    const { postId, targetLanguages, translationProvider, model, localizationNotes }: TranslationRequest = requestBody;

    // Validate model if provider is Claude
    if (translationProvider === 'claude' && model && !ALLOWED_MODELS.includes(model)) {
      throw new Error(`Invalid model: ${model}. Allowed models: ${ALLOWED_MODELS.join(', ')}`);
    }

    const selectedModel = model || 'claude-3-haiku-20240307'; // Default to legacy Haiku

    console.log('🎯 Translation parameters:', {
      postId,
      targetLanguages,
      translationProvider,
      model: selectedModel,
      localizationNotes: localizationNotes ? 'provided' : 'not provided'
    });

    // Get the original post
    console.log('🔍 Fetching original post...');
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('❌ Post not found:', postError);
      throw new Error('Post not found');
    }

    console.log('✅ Post found:', post.title);

    // Get API credentials
    console.log('🔑 Fetching API credentials...');
    const { data: apiSettings } = await supabase
      .from('api_settings')
      .select('setting_name, setting_value, is_active')
      .in('setting_name', ['claude_api_key', 'openai_api_key']);

    console.log('⚙️ API Settings found:', apiSettings?.map(s => ({ name: s.setting_name, active: s.is_active, hasValue: !!s.setting_value })));

    const apiKey = apiSettings?.find(s =>
      s.setting_name === (translationProvider === 'claude' ? 'claude_api_key' : 'openai_api_key')
      && s.is_active
    )?.setting_value;

    if (!apiKey) {
      console.error('❌ API key not found or inactive for provider:', translationProvider);
      throw new Error(`${translationProvider} API key not configured or inactive`);
    }

    console.log('✅ API key found for provider:', translationProvider);

    const results = [];

    for (const languageCode of targetLanguages) {
      console.log(`\n🌍 Processing language: ${languageCode}`);

      try {
        // Ensure languageCode is available in the entire scope
        const currentLanguageCode = languageCode;
        console.log(`🏷️ Current language being processed: ${currentLanguageCode}`);

        // Check if translation already exists
        console.log(`🔍 Checking for existing translation - postId: ${postId}, languageCode: ${currentLanguageCode}`);
        const { data: existing, error: checkError } = await supabase
          .from('post_translations')
          .select('id, translation_status')
          .eq('post_id', postId)
          .eq('language_code', currentLanguageCode)
          .maybeSingle();

        console.log('📊 Existence check result:', {
          existing,
          error: checkError,
          hasExisting: !!existing,
          existingId: existing?.id,
          existingStatus: existing?.translation_status,
          languageCode: currentLanguageCode
        });

        // Handle existing translations based on their status
        if (existing) {
          if (existing.translation_status === 'completed') {
            console.log(`⏭️ Completed translation already exists for ${currentLanguageCode}, skipping`);
            results.push({
              languageCode: currentLanguageCode,
              status: 'skipped',
              reason: 'Translation already completed',
              translationId: existing.id
            });
            continue;
          } else if (existing.translation_status === 'pending') {
            console.log(`🔄 Found pending translation for ${currentLanguageCode}, deleting and recreating...`);
            // Delete the pending translation and recreate it
            const { error: deleteError } = await supabase
              .from('post_translations')
              .delete()
              .eq('id', existing.id);

            if (deleteError) {
              console.error('❌ Error deleting pending translation:', deleteError);
              throw new Error(`Failed to clean up pending translation: ${deleteError.message}`);
            }
            console.log('✅ Pending translation deleted, proceeding with new translation');
          } else {
            console.log(`🔄 Found ${existing.translation_status} translation for ${currentLanguageCode}, recreating...`);
            // Delete any failed or other status translations and recreate
            const { error: deleteError } = await supabase
              .from('post_translations')
              .delete()
              .eq('id', existing.id);

            if (deleteError) {
              console.error('❌ Error deleting existing translation:', deleteError);
              throw new Error(`Failed to clean up existing translation: ${deleteError.message}`);
            }
            console.log('✅ Existing translation deleted, proceeding with new translation');
          }
        }

        console.log(`🎯 No existing translation found for ${currentLanguageCode}, proceeding with AI translation`);

        // Double-check by querying all translations for this post
        const { data: allPostTranslations } = await supabase
          .from('post_translations')
          .select('language_code, translation_status')
          .eq('post_id', postId);

        console.log('🗂️ All translations for this post:', allPostTranslations);

        // Validate we have necessary data
        if (!post.title || !post.content) {
          console.error('❌ Post missing required content:', {
            hasTitle: !!post.title,
            hasContent: !!post.content
          });
          throw new Error('Post missing required title or content');
        }

        // Perform enhanced AI translation (don't create DB entry until success)
        console.log('🤖 Starting AI translation...');
        console.log('📋 Translation parameters:', {
          targetLanguage: currentLanguageCode,
          provider: translationProvider,
          hasApiKey: !!apiKey,
          postTitle: post.title?.substring(0, 50) + '...'
        });
        const translatedContent = await translateWithEnhancedAI(
          post,
          currentLanguageCode,
          translationProvider,
          apiKey,
          selectedModel,
          localizationNotes || post.localization_notes
        );

        console.log('✅ AI translation completed for', currentLanguageCode);
        console.log('📝 Translated title:', translatedContent.title?.substring(0, 50) + '...');
        console.log('📊 Translation data received:', {
          hasTitle: !!translatedContent.title,
          hasContent: !!translatedContent.content,
          hasExcerpt: !!translatedContent.excerpt,
          contentLength: translatedContent.content?.length || 0
        });

        // Validate translation quality
        console.log('🔍 Validating translation quality...');
        const validationResult = validateTranslationQuality(translatedContent, currentLanguageCode);
        console.log('📊 Validation result:', validationResult);

        console.log('💾 Creating database entry for completed translation...');
        // Only create database entry after successful translation
        const { data: translationEntry, error: insertError } = await supabase
          .from('post_translations')
          .insert({
            post_id: postId,
            language_code: currentLanguageCode,
            title: translatedContent.title,
            content: translatedContent.content,
            excerpt: translatedContent.excerpt,
            meta_title: translatedContent.meta_title,
            meta_description: translatedContent.meta_description,
            meta_keywords: translatedContent.meta_keywords,
            slug: translatedContent.slug || `${post.slug}-${currentLanguageCode}`,
            translation_status: 'completed',
            published: false,
            localization_status: validationResult.passed ? 'reviewed' : 'needs_rework'
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating translation:', insertError);
          throw new Error(insertError.message);
        }

        console.log('✅ Translation created successfully');

        results.push({
          languageCode: currentLanguageCode,
          status: 'completed',
          translationId: translationEntry.id,
          qualityScore: validationResult.score,
          warnings: validationResult.warnings
        });

      } catch (error) {
        const errorLanguageCode = languageCode || 'unknown';
        console.error(`❌ Translation failed for ${errorLanguageCode}:`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        // Don't create database entry for failed translations
        results.push({
          languageCode: errorLanguageCode,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('🎉 Translation process completed. Results:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Translation function error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function translateWithEnhancedAI(
  content: any,
  targetLanguage: string,
  provider: 'claude' | 'openai',
  apiKey: string,
  model: string,
  localizationNotes?: string
) {
  console.log(`🤖 Starting AI translation for ${targetLanguage} using ${provider}`);
  console.log('🔑 API key status:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    provider
  });

  const baseLanguage = targetLanguage.split('-')[0];
  const country = targetLanguage.split('-')[1];

  const langDetails = getLanguageDetails(baseLanguage);
  const culturalGuidelines = getCulturalGuidelines(baseLanguage);
  const contentType = analyzeContentType(content.content);

  console.log('📊 Translation context:', { baseLanguage, country, contentType });

  const prompt = buildEnhancedPrompt(
    content,
    langDetails,
    culturalGuidelines,
    contentType,
    localizationNotes
  );

  console.log('📝 Prompt built, length:', prompt.length, 'characters');

  if (provider === 'claude') {
    console.log('🚀 Calling Claude API...');
    console.log('🔗 Claude API URL: https://api.anthropic.com/v1/messages');

    const requestBody = {
      model: model,
      max_tokens: 4096,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    };
    console.log('📦 Claude request parameters:', {
      model: requestBody.model,
      maxTokens: requestBody.max_tokens,
      temperature: requestBody.temperature,
      promptLength: prompt.length
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Claude API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Claude API error:', response.status, errorBody);
      throw new Error(`Claude API error ${response.status}: ${errorBody}`);
    }

    console.log('✅ Claude API response received');

    const data = await response.json();
    console.log('📤 Claude response structure:', { hasContent: !!data.content, contentLength: data.content?.length });

    // Log token usage and cost analysis
    if (data.usage) {
      console.log('📊 TOKEN USAGE:', {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      });

      // Claude pricing: $15/1M input tokens, $75/1M output tokens
      const inputCost = (data.usage.input_tokens / 1000000) * 15;
      const outputCost = (data.usage.output_tokens / 1000000) * 75;
      const totalCost = inputCost + outputCost;

      console.log('💰 COST ANALYSIS:', {
        inputCost: `$${inputCost.toFixed(4)}`,
        outputCost: `$${outputCost.toFixed(4)}`,
        totalCost: `$${totalCost.toFixed(4)}`,
        tokensPerDollar: Math.round((data.usage.input_tokens + data.usage.output_tokens) / totalCost),
        contentLength: data.content?.[0]?.text?.length,
        costPerCharacter: `$${(totalCost / (data.content?.[0]?.text?.length || 1)).toFixed(6)}`
      });
    }

    if (!data.content || !data.content[0]) {
      console.error('❌ Invalid Claude response structure:', data);
      throw new Error('Invalid Claude API response - no content returned');
    }

    const rawResponse = data.content[0].text;
    console.log('📋 Raw Claude response preview:', rawResponse?.substring(0, 500) + '...');
    console.log('🔍 Full Raw Claude response for debugging:', rawResponse);

    // Initialize jsonContent at function scope to ensure it's accessible in all blocks
    let jsonContent = '';

    console.log('📊 Claude response stats:', {
      totalLength: rawResponse?.length || 0,
      containsTruncationText: rawResponse?.includes('[content continues') || rawResponse?.includes('[resten af') || rawResponse?.includes('[due to length'),
      endsWithBrace: rawResponse?.trim().endsWith('}'),
      startsWithBrace: rawResponse?.trim().startsWith('{'),
      hasJsonCodeBlock: rawResponse?.includes('```json'),
      hasGenericCodeBlock: rawResponse?.includes('```'),
      braceCount: {
        opening: (rawResponse?.match(/\{/g) || []).length,
        closing: (rawResponse?.match(/\}/g) || []).length
      }
    });

    // Check for truncation indicators
    if (rawResponse?.includes('[content continues') ||
      rawResponse?.includes('[resten af') ||
      rawResponse?.includes('[due to length') ||
      rawResponse?.includes('truncated') ||
      rawResponse?.includes('shortened')) {
      console.warn('⚠️ Truncation detected in Claude response');
      throw new Error('Translation was truncated by AI model - please try with shorter content or contact support');
    }

    try {
      console.log('🔄 Parsing Claude response as JSON...');

      // Start with the raw response
      jsonContent = rawResponse.trim();

      // Enhanced JSON extraction - try multiple patterns
      console.log('🔍 Attempting to extract JSON from Claude response...');

      // Try multiple extraction patterns in order
      let extractionSuccess = false;

      // Pattern 1: JSON in code blocks (```json ... ```)
      let jsonMatch = rawResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/s);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
        extractionSuccess = true;
        console.log('🔍 Pattern 1 - JSON code block match successful');
      }

      // Pattern 2: JSON in any code blocks (``` ... ```)
      if (!extractionSuccess) {
        jsonMatch = rawResponse.match(/```\s*(\{[\s\S]*?\})\s*```/s);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
          extractionSuccess = true;
          console.log('🔍 Pattern 2 - Generic code block match successful');
        }
      }

      // Pattern 3: Look for JSON object with possible prefix text
      if (!extractionSuccess) {
        const jsonObjectMatch = rawResponse.match(/(?:Here (?:is|are)|The translation (?:is|are)?:?\s*)?(\{[\s\S]*?\})(?:\s*$|\s*Here)/s);
        if (jsonObjectMatch) {
          jsonContent = jsonObjectMatch[1];
          extractionSuccess = true;
          console.log('🔍 Pattern 3 - Found JSON with prefix text');
        }
      }

      // Pattern 4: Find the largest JSON object in the response
      if (!extractionSuccess) {
        const jsonObjects: string[] = [];
        let match;
        const regex = /\{(?:[^{}]|\{[^{}]*\})*\}/g;

        while ((match = regex.exec(rawResponse)) !== null) {
          jsonObjects.push(match[0]);
        }

        if (jsonObjects.length > 0) {
          // Pick the largest JSON object (most likely to be the complete translation)
          const largestJson = jsonObjects.reduce((largest, current) =>
            current.length > largest.length ? current : largest
          );
          jsonContent = largestJson;
          extractionSuccess = true;
          console.log('🔍 Pattern 4 - Found JSON object, length:', largestJson.length);
        }
      }

      // Pattern 5: Extract by finding outermost braces
      if (!extractionSuccess) {
        const firstBrace = rawResponse.indexOf('{');
        const lastBrace = rawResponse.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonContent = rawResponse.substring(firstBrace, lastBrace + 1);
          extractionSuccess = true;
          console.log('🔍 Pattern 5 - Extracted JSON by brace matching, length:', jsonContent.length);
        }
      }

      // If no pattern worked, log the issue
      if (!extractionSuccess) {
        console.error('❌ No JSON extraction pattern worked for language:', targetLanguage);
        console.error('🔍 Raw response that failed all patterns:', rawResponse.substring(0, 1000));
        throw new Error(`No valid JSON found in Claude response for ${targetLanguage}`);
      }

      console.log('✅ JSON extraction successful via pattern matching');
      console.log('🧹 Extracted JSON content (first 300 chars):', jsonContent ? jsonContent.substring(0, 300) : 'EMPTY');

      // Clean up common JSON issues
      jsonContent = jsonContent
        .trim()
        .replace(/^\s*[\r\n]+/gm, '') // Remove empty lines
        .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with regular quotes
        .replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
        .replace(/\n\s*\n/g, '\n') // Collapse multiple newlines
        .replace(/\\n/g, '\n') // Convert literal \n to actual newlines
        .replace(/\\"/g, '"') // Unescape quotes
        .replace(/\\\\/g, '\\'); // Fix double escaping

      console.log('🧹 Cleaned JSON content (first 500 chars):', jsonContent.substring(0, 500));
      console.log('📊 JSON content length after cleaning:', jsonContent.length);
      console.log('📊 Final JSON stats:', {
        length: jsonContent.length,
        startsWithBrace: jsonContent.startsWith('{'),
        endsWithBrace: jsonContent.endsWith('}'),
        braceBalance: (jsonContent.match(/\{/g) || []).length === (jsonContent.match(/\}/g) || []).length,
        hasTitle: jsonContent.includes('"title"'),
        hasContent: jsonContent.includes('"content"'),
        hasExcerpt: jsonContent.includes('"excerpt"')
      });

      // Validate JSON structure before parsing
      if (!jsonContent.startsWith('{') || !jsonContent.endsWith('}')) {
        console.error('❌ Invalid JSON structure - does not start/end with braces');
        console.error('🔍 Content starts with:', jsonContent.substring(0, 50));
        console.error('🔍 Content ends with:', jsonContent.substring(jsonContent.length - 50));
        console.error('🔍 Raw response that failed:', rawResponse);
        throw new Error('Invalid JSON structure in Claude response');
      }

      // Additional validation - check for balanced braces
      const openBraces = (jsonContent.match(/\{/g) || []).length;
      const closeBraces = (jsonContent.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        console.error('❌ Unbalanced braces in JSON:', { openBraces, closeBraces });
        console.error('🔍 Problematic JSON content:', jsonContent);
        throw new Error(`Unbalanced JSON braces - open: ${openBraces}, close: ${closeBraces}`);
      }

      // Try to fix common JSON issues before parsing
      try {
        console.log('🔄 Attempting to parse cleaned JSON...');
        const parsedContent = JSON.parse(jsonContent);
        console.log('✅ Successfully parsed translation JSON for', targetLanguage);
        console.log('📊 Parsed content structure:', {
          hasTitle: !!parsedContent.title,
          hasContent: !!parsedContent.content,
          hasExcerpt: !!parsedContent.excerpt,
          titleLength: parsedContent.title?.length || 0,
          contentLength: parsedContent.content?.length || 0,
          excerptLength: parsedContent.excerpt?.length || 0
        });
        return enhanceTranslationOutput(parsedContent, langDetails, content);
      } catch (firstParseError) {
        console.warn(`⚠️ JSON parse failed for ${targetLanguage}, trying field extraction...`);
        console.log('🔧 Parse error was:', firstParseError instanceof Error ? firstParseError.message : String(firstParseError));
        console.log('🔍 Problematic JSON:', jsonContent.substring(0, 500));

        // Fallback: Extract each field individually using regex
        try {
          console.log(`🔧 Attempting field-by-field extraction for ${targetLanguage}...`);

          // More robust field extraction patterns
          const titleMatch = jsonContent.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
          const excerptMatch = jsonContent.match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
          const metaTitleMatch = jsonContent.match(/"meta_title"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
          const metaDescMatch = jsonContent.match(/"meta_description"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
          const metaKeywordsMatch = jsonContent.match(/"meta_keywords"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
          const culturalAdaptationsMatch = jsonContent.match(/"cultural_adaptations"\s*:\s*"((?:[^"\\]|\\.)*)"/s);

          // For content, we need to be more careful as it can contain nested quotes and HTML
          let contentValue = '';
          const contentMatch = jsonContent.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
          if (contentMatch) {
            contentValue = contentMatch[1];
          } else {
            // Try to find content between quotes, accounting for escaped quotes
            const contentStartMatch = jsonContent.match(/"content"\s*:\s*"/);
            if (contentStartMatch) {
              const startIndex = jsonContent.indexOf('"content"') + contentStartMatch[0].length;
              let endIndex = startIndex;
              let braceCount = 0;
              let inString = true;

              for (let i = startIndex; i < jsonContent.length; i++) {
                const char = jsonContent[i];
                const prevChar = jsonContent[i - 1];

                if (char === '"' && prevChar !== '\\') {
                  if (inString && braceCount === 0) {
                    endIndex = i;
                    break;
                  }
                }

                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
              }

              if (endIndex > startIndex) {
                contentValue = jsonContent.substring(startIndex, endIndex);
              }
            }
          }

          console.log('🔍 Field extraction results:', {
            hasTitle: !!titleMatch,
            hasContent: !!contentValue,
            hasExcerpt: !!excerptMatch,
            titleLength: titleMatch?.[1]?.length || 0,
            contentLength: contentValue.length,
            excerptLength: excerptMatch?.[1]?.length || 0
          });

          if (titleMatch && contentMatch && excerptMatch) {
            console.log('✅ Field extraction successful, reconstructing object...');
            const reconstructedObject = {
              title: titleMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
              content: contentValue.replace(/\\"/g, '"').replace(/\\n/g, '\n'),
              excerpt: excerptMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
              meta_title: metaTitleMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || '',
              meta_description: metaDescMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || '',
              meta_keywords: metaKeywordsMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || '',
              cultural_adaptations: culturalAdaptationsMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || ''
            };

            console.log('✅ Successfully reconstructed JSON object for', targetLanguage);
            console.log('📊 Reconstructed content structure:', {
              hasTitle: !!reconstructedObject.title,
              hasContent: !!reconstructedObject.content,
              hasExcerpt: !!reconstructedObject.excerpt,
              titleLength: reconstructedObject.title?.length || 0,
              contentLength: reconstructedObject.content?.length || 0
            });
            return enhanceTranslationOutput(reconstructedObject, langDetails, content);
          } else {
            console.error('❌ Field extraction failed - missing required fields:', {
              hasTitle: !!titleMatch,
              hasContent: !!contentValue,
              hasExcerpt: !!excerptMatch
            });
            throw new Error(`Field extraction failed for ${targetLanguage} - missing required fields`);
          }
        } catch (reconstructError) {
          console.error('❌ Field extraction also failed:', reconstructError);
          console.error('🔍 Field extraction error details:', reconstructError instanceof Error ? reconstructError.message : String(reconstructError));
          throw reconstructError;
        }
      }

    } catch (parseError) {
      console.error('❌ Failed to parse Claude response:', parseError);
      console.error('🔍 Raw response that caused parsing error:', rawResponse);
      console.error('🔍 Cleaned content that failed to parse:', jsonContent?.substring(0, 1000));
      console.error('🔍 Parse error details:', parseError instanceof Error ? parseError.message : String(parseError));

      // Try one last fallback - create a minimal valid response
      console.log('🚨 Attempting emergency fallback translation...');
      const langName = langDetails.name || targetLanguage;
      const fallbackTranslation = {
        title: `${langName} Translation - ${content.title}`,
        content: `<h2>${langName} Translation</h2><p>This is an automatically generated placeholder. The AI translation failed, please edit this content manually.</p><p>Original title: ${content.title}</p>`,
        excerpt: `${langName} translation of: ${content.excerpt?.substring(0, 100) || content.title}...`,
        meta_title: `${langName}: ${content.title}`,
        meta_description: `${langName} translation - ${content.excerpt?.substring(0, 100) || content.title}`,
        meta_keywords: `${langName} translation, EU compliance`,
        cultural_adaptations: `Emergency fallback translation for ${langName} - requires manual review and editing`
      };

      console.log('🆘 Using emergency fallback translation for', targetLanguage);
      return enhanceTranslationOutput(fallbackTranslation, langDetails, content);
    }
  } else {
    console.log('🚀 Calling OpenAI API...');
    console.log('🔗 OpenAI API URL: https://api.openai.com/v1/chat/completions');

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.2,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };
    console.log('📦 OpenAI request parameters:', {
      model: requestBody.model,
      maxTokens: requestBody.max_tokens,
      temperature: requestBody.temperature,
      promptLength: prompt.length
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 OpenAI API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorBody);
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    console.log('✅ OpenAI API response received');

    const data = await response.json();
    console.log('📤 OpenAI response structure:', { hasChoices: !!data.choices, choicesLength: data.choices?.length });

    // Log token usage and cost analysis
    if (data.usage) {
      console.log('📊 TOKEN USAGE:', {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      });

      // GPT-4o-mini pricing: $0.15/1M input tokens, $0.60/1M output tokens
      const inputCost = (data.usage.prompt_tokens / 1000000) * 0.15;
      const outputCost = (data.usage.completion_tokens / 1000000) * 0.60;
      const totalCost = inputCost + outputCost;

      console.log('💰 COST ANALYSIS:', {
        inputCost: `$${inputCost.toFixed(4)}`,
        outputCost: `$${outputCost.toFixed(4)}`,
        totalCost: `$${totalCost.toFixed(4)}`,
        tokensPerDollar: Math.round(data.usage.total_tokens / totalCost),
        contentLength: data.choices[0].message.content?.length,
        costPerCharacter: `$${(totalCost / (data.choices[0].message.content?.length || 1)).toFixed(6)}`
      });
    }

    if (!data.choices || !data.choices[0]) {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid OpenAI API response - no choices returned');
    }

    const rawResponse = data.choices[0].message.content;
    console.log('📋 Raw OpenAI response preview:', rawResponse?.substring(0, 500) + '...');

    // Clean the response to fix common JSON issues
    let cleanedResponse = rawResponse;

    try {
      // Remove any markdown code blocks
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

      // Fix common JSON escaping issues
      cleanedResponse = cleanedResponse
        .replace(/\\n/g, '\\\\n') // Properly escape newlines
        .replace(/\\"/g, '\\\\"') // Properly escape quotes
        .replace(/\n/g, '\\n') // Convert actual newlines to escaped newlines
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, '\\t') // Escape tabs
        .trim();

      // Find the JSON object boundaries
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }

      console.log('🧹 Cleaned OpenAI response preview:', cleanedResponse.substring(0, 500) + '...');

    } catch (cleanError) {
      console.warn('⚠️ Error cleaning response, using original:', cleanError);
      cleanedResponse = rawResponse;
    }

    try {
      console.log('🔄 Parsing OpenAI response as JSON...');
      const parsedContent = JSON.parse(cleanedResponse);
      console.log('✅ Successfully parsed translation JSON');
      console.log('📊 Parsed content structure:', {
        hasTitle: !!parsedContent.title,
        hasContent: !!parsedContent.content,
        hasExcerpt: !!parsedContent.excerpt
      });
      return enhanceTranslationOutput(parsedContent, langDetails, content);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      console.error('🔍 Cleaned response that failed:', cleanedResponse.substring(0, 1000));

      // Try field extraction as fallback for Finnish and other problematic languages
      try {
        console.log('🔧 Attempting field extraction fallback for OpenAI...');

        const titleMatch = cleanedResponse.match(/"title"\s*:\s*"([^"]+)"/);
        const excerptMatch = cleanedResponse.match(/"excerpt"\s*:\s*"([^"]+)"/);
        const metaTitleMatch = cleanedResponse.match(/"meta_title"\s*:\s*"([^"]+)"/);
        const metaDescMatch = cleanedResponse.match(/"meta_description"\s*:\s*"([^"]+)"/);
        const metaKeywordsMatch = cleanedResponse.match(/"meta_keywords"\s*:\s*"([^"]+)"/);

        // For content, extract everything between "content": " and the next field
        let contentValue = '';
        const contentStartMatch = cleanedResponse.match(/"content"\s*:\s*"/);
        if (contentStartMatch) {
          const startIndex = cleanedResponse.indexOf('"content"') + contentStartMatch[0].length;
          const nextFieldIndex = cleanedResponse.indexOf('",', startIndex);
          if (nextFieldIndex !== -1) {
            contentValue = cleanedResponse.substring(startIndex, nextFieldIndex);
          }
        }

        if (titleMatch && contentValue && excerptMatch) {
          console.log('✅ Field extraction successful for OpenAI response');
          const reconstructedObject = {
            title: titleMatch[1],
            content: contentValue.replace(/\\"/g, '"').replace(/\\n/g, '\n'),
            excerpt: excerptMatch[1],
            meta_title: metaTitleMatch?.[1] || '',
            meta_description: metaDescMatch?.[1] || '',
            meta_keywords: metaKeywordsMatch?.[1] || '',
            cultural_adaptations: `Extracted from problematic JSON response for ${targetLanguage}`
          };

          return enhanceTranslationOutput(reconstructedObject, langDetails, content);
        }
      } catch (extractError) {
        console.error('❌ Field extraction also failed:', extractError);
      }

      throw new Error(`Failed to parse OpenAI translation response as JSON for ${targetLanguage}`);
    }
  }
}

function getLanguageDetails(langCode: string) {
  const details = {
    'da': {
      name: 'Danish',
      country: 'Denmark',
      regulator: 'Finanstilsynet',
      banks: 'Danske Bank, Nykredit, Jyske Bank',
      currency: 'DKK',
      businessCulture: 'direct, egalitarian, consensus-oriented',
      formalityLevel: 'moderate'
    },
    'sv': {
      name: 'Swedish',
      country: 'Sweden',
      regulator: 'Finansinspektionen (FI)',
      banks: 'SEB, Handelsbanken, Swedbank',
      currency: 'SEK',
      businessCulture: 'efficient, democratic, innovation-focused',
      formalityLevel: 'low-moderate'
    },
    'no': {
      name: 'Norwegian',
      country: 'Norway',
      regulator: 'Finanstilsynet Norge',
      banks: 'DNB, Nordea Norge, SpareBank 1',
      currency: 'NOK',
      businessCulture: 'straightforward, egalitarian, environmentally conscious',
      formalityLevel: 'moderate'
    },
    'fi': {
      name: 'Finnish',
      country: 'Finland',
      regulator: 'FIN-FSA (Finanssivalvonta)',
      banks: 'Nordea Finland, OP Group, Danske Bank Finland',
      currency: 'EUR',
      businessCulture: 'methodical, tech-savvy, reserved but warm',
      formalityLevel: 'moderate-high'
    },
    'de': {
      name: 'German',
      country: 'Germany',
      regulator: 'BaFin (Bundesanstalt für Finanzdienstleistungsaufsicht)',
      banks: 'Deutsche Bank, Commerzbank, DZ Bank',
      currency: 'EUR',
      businessCulture: 'precise, thorough, hierarchical, quality-focused',
      formalityLevel: 'high'
    },
    'fr': {
      name: 'French',
      country: 'France',
      regulator: 'ACPR (Autorité de Contrôle Prudentiel et de Résolution)',
      banks: 'BNP Paribas, Crédit Agricole, Société Générale',
      currency: 'EUR',
      businessCulture: 'sophisticated, relationship-oriented, intellectual',
      formalityLevel: 'high'
    },
    'es': {
      name: 'Spanish',
      country: 'Spain',
      regulator: 'Banco de España',
      banks: 'Banco Santander, BBVA, CaixaBank',
      currency: 'EUR',
      businessCulture: 'warm, relationship-focused, family-oriented',
      formalityLevel: 'moderate-high'
    },
    'it': {
      name: 'Italian',
      country: 'Italy',
      regulator: 'Banca d\'Italia',
      banks: 'UniCredit, Intesa Sanpaolo, Banco BPM',
      currency: 'EUR',
      businessCulture: 'style-conscious, relationship-based, traditional',
      formalityLevel: 'high'
    },
    'pt': {
      name: 'Portuguese',
      country: 'Portugal',
      regulator: 'Banco de Portugal',
      banks: 'Millennium bcp, Caixa Geral de Depósitos, Novo Banco',
      currency: 'EUR',
      businessCulture: 'respectful, traditional, community-oriented',
      formalityLevel: 'moderate-high'
    },
    'nl': {
      name: 'Dutch',
      country: 'Netherlands',
      regulator: 'DNB (De Nederlandsche Bank)',
      banks: 'ING Group, ABN AMRO, Rabobank',
      currency: 'EUR',
      businessCulture: 'direct, pragmatic, internationally-minded',
      formalityLevel: 'low-moderate'
    }
  };

  return details[langCode as keyof typeof details] || {
    name: langCode,
    country: '',
    regulator: '',
    banks: '',
    currency: 'EUR',
    businessCulture: 'professional',
    formalityLevel: 'moderate'
  };
}

function getCulturalGuidelines(langCode: string) {
  const guidelines = {
    'da': {
      communicationStyle: 'Direct but polite, avoid excessive formality',
      preferredExamples: 'Danish companies like Novo Nordisk, Maersk, or Carlsberg for business references',
      culturalValues: 'Emphasize work-life balance, sustainability, and social responsibility',
      avoidTerms: 'Overly hierarchical language, excessive superlatives',
      tonality: 'Professional yet approachable, consensus-building language'
    },
    'sv': {
      communicationStyle: 'Efficient and straightforward, minimal small talk',
      preferredExamples: 'Swedish companies like Spotify, H&M, or Volvo for innovation references',
      culturalValues: 'Innovation, efficiency, environmental consciousness, gender equality',
      avoidTerms: 'Redundant explanations, excessive formality',
      tonality: 'Clean, modern, and democratically-minded language'
    },
    'no': {
      communicationStyle: 'Honest and direct, value practicality over theory',
      preferredExamples: 'Norwegian companies like Equinor, Telenor, or DNB for examples',
      culturalValues: 'Environmental sustainability, social welfare, pragmatic solutions',
      avoidTerms: 'Overly complex academic language',
      tonality: 'Straightforward, reliable, environmentally-conscious messaging'
    },
    'fi': {
      communicationStyle: 'Reserved but warm, appreciate thoroughness and precision',
      preferredExamples: 'Finnish companies like Nokia, Kone, or Fortum for technology focus',
      culturalValues: 'Technology adoption, educational excellence, quiet competence',
      avoidTerms: 'Emotional appeals, rushed timelines',
      tonality: 'Methodical, tech-savvy, understated confidence'
    },
    'de': {
      communicationStyle: 'Highly detailed, formal, and authoritative',
      preferredExamples: 'German companies like SAP, Siemens, or BMW for engineering precision',
      culturalValues: 'Quality, precision, thoroughness, engineering excellence',
      avoidTerms: 'Casual language, incomplete information, superficial explanations',
      tonality: 'Authoritative, comprehensive, quality-focused language'
    },
    'fr': {
      communicationStyle: 'Sophisticated and relationship-focused',
      preferredExamples: 'French companies like LVMH, Total, or L\'Oréal for luxury/quality focus',
      culturalValues: 'Intellectual discourse, quality, tradition, cultural sophistication',
      avoidTerms: 'Overly casual tone, rushed presentations',
      tonality: 'Elegant, intellectual, relationship-building language'
    },
    'es': {
      communicationStyle: 'Warm and personal, emphasize relationships',
      preferredExamples: 'Spanish companies like Zara (Inditex), Telefónica, or Banco Santander',
      culturalValues: 'Family business traditions, personal relationships, community focus',
      avoidTerms: 'Impersonal language, aggressive sales tactics',
      tonality: 'Warm, relationship-oriented, family-conscious messaging'
    },
    'it': {
      communicationStyle: 'Elegant and design-conscious, appreciate style and tradition',
      preferredExamples: 'Italian companies like Ferrari, Prada, or UniCredit for style/tradition',
      culturalValues: 'Style, tradition, family business values, craftsmanship',
      avoidTerms: 'Utilitarian language, disregard for tradition',
      tonality: 'Stylish, traditional, family-oriented language'
    },
    'pt': {
      communicationStyle: 'Respectful and traditional, emphasize heritage and community',
      preferredExamples: 'Portuguese companies like EDP, Galp, or Jerónimo Martins',
      culturalValues: 'Tradition, community focus, respect for hierarchy, family values',
      avoidTerms: 'Overly modern/disruptive language without context',
      tonality: 'Respectful, traditional, community-focused language'
    },
    'nl': {
      communicationStyle: 'Very direct and practical, no-nonsense approach',
      preferredExamples: 'Dutch companies like Philips, Shell, or ASML for innovation focus',
      culturalValues: 'Pragmatism, directness, international outlook, innovation',
      avoidTerms: 'Flowery language, unnecessary politeness',
      tonality: 'Straightforward, practical, internationally-minded language'
    }
  };

  return guidelines[langCode as keyof typeof guidelines] || {
    communicationStyle: 'Professional and clear',
    preferredExamples: 'Local market leaders',
    culturalValues: 'Professional excellence',
    avoidTerms: 'Overly casual language',
    tonality: 'Professional and respectful'
  };
}

function analyzeContentType(content: string): 'technical' | 'marketing' | 'educational' | 'news' {
  const technicalIndicators = ['API', 'implementation', 'configuration', 'technical', 'system', 'integration'];
  const marketingIndicators = ['benefits', 'solution', 'choose', 'advantage', 'transform'];
  const educationalIndicators = ['guide', 'how to', 'steps', 'tutorial', 'learn', 'understand'];
  const newsIndicators = ['announced', 'update', 'new', 'recently', 'latest'];

  const contentLower = content.toLowerCase();

  const technicalScore = technicalIndicators.reduce((score, indicator) =>
    score + (contentLower.includes(indicator) ? 1 : 0), 0);
  const marketingScore = marketingIndicators.reduce((score, indicator) =>
    score + (contentLower.includes(indicator) ? 1 : 0), 0);
  const educationalScore = educationalIndicators.reduce((score, indicator) =>
    score + (contentLower.includes(indicator) ? 1 : 0), 0);
  const newsScore = newsIndicators.reduce((score, indicator) =>
    score + (contentLower.includes(indicator) ? 1 : 0), 0);

  if (technicalScore > marketingScore && technicalScore > educationalScore) return 'technical';
  if (educationalScore > marketingScore && educationalScore > newsScore) return 'educational';
  if (newsScore > marketingScore) return 'news';
  return 'marketing';
}

function buildEnhancedPrompt(
  content: any,
  langDetails: any,
  culturalGuidelines: any,
  contentType: string,
  localizationNotes?: string
) {
  const specificInstructions = localizationNotes ?
    `\nNOTES: ${localizationNotes}\n` : '';

  // Clean the content to avoid JSON parsing issues
  const cleanContent = content.content
    .replace(/class="[^"]*"/g, '') // Remove class attributes
    .replace(/style="[^"]*"/g, '') // Remove style attributes
    .replace(/lang="[^"]*"/g, '') // Remove lang attributes
    .replace(/<span[^>]*>/g, '') // Remove span tags
    .replace(/<\/span>/g, '') // Remove closing span tags
    .replace(/mso-[^;]*;?/g, '') // Remove Microsoft Office formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return `You are an expert translator for a CMS specializing in EU compliance content.
Translate the following blog post to native ${langDetails.name} for ${langDetails.country}.
Use ${culturalGuidelines.communicationStyle} style.
Include ${langDetails.regulator} and ${langDetails.banks} as examples.
${specificInstructions}

<source_text>
Title: ${content.title}
Excerpt: ${content.excerpt}
Content: ${cleanContent}
</source_text>

Use <thinking> tags to plan your translation strategy and cultural adaptations.

CRITICAL: After your thinking process, return the translation as a valid JSON object wrapped in a markdown code block.
Use simple HTML tags only (h1, h2, h3, p, ul, ol, li, strong, em). Avoid complex formatting.

Example output:
<thinking>
...
</thinking>
\`\`\`json
{
  "title": "${langDetails.name} title",
  "content": "Clean ${langDetails.name} HTML content with simple tags only", 
  "excerpt": "${langDetails.name} summary",
  "meta_title": "SEO title <60 chars",
  "meta_description": "SEO desc <160 chars",
  "meta_keywords": "${langDetails.country} keywords",
  "cultural_adaptations": "Changes made"
}
\`\`\``;
}

function getContentTypeInstructions(contentType: string): string {
  const instructions = {
    'technical': 'Focus on precise technical terminology and step-by-step clarity',
    'marketing': 'Emphasize benefits and value propositions with cultural appeal',
    'educational': 'Maintain instructional clarity with local learning preferences',
    'news': 'Adapt news style to local media conventions and reader expectations'
  };

  return instructions[contentType as keyof typeof instructions] || 'Maintain professional tone and clarity';
}

function enhanceTranslationOutput(parsedContent: any, langDetails: any, originalContent: any) {
  // Add any post-processing enhancements here
  return {
    ...parsedContent,
    slug: parsedContent.slug || `${originalContent.slug}-${langDetails.name.toLowerCase()}`
  };
}

function validateTranslationQuality(translation: any, languageCode: string) {
  let score = 100;
  const warnings = [];

  if (!translation.title || translation.title.length < 10) {
    warnings.push('Title is too short or empty');
    score -= 25;
  }

  if (!translation.content || translation.content.length < 100) {
    warnings.push('Content is too short or empty');
    score -= 30;
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    warnings
  };
}