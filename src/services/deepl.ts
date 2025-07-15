import * as deepl from 'deepl-node';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

let translator: deepl.Translator | null = null;

function getTranslator(): deepl.Translator {
  if (!DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY environment variable is not set');
  }
  
  if (!translator) {
    translator = new deepl.Translator(DEEPL_API_KEY);
  }
  
  return translator;
}

export interface DeepLTranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  usage?: {
    characterCount: number;
    characterLimit?: number;
  };
}

/**
 * Translate text using DeepL API
 */
export async function translateWithDeepL(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<DeepLTranslationResult> {
  try {
    const translator = getTranslator();
    
    // Convert language codes to DeepL format if needed
    const targetLangCode = normalizeLanguageCode(targetLanguage);
    const sourceLangCode = sourceLanguage ? normalizeLanguageCode(sourceLanguage) : null;
    
    const result = await translator.translateText(
      text,
      sourceLangCode,
      targetLangCode as deepl.TargetLanguageCode
    );
    
    // Get usage information
    const usage = await translator.getUsage();
    
    return {
      translatedText: result.text,
      detectedSourceLanguage: result.detectedSourceLang,
      usage: {
        characterCount: text.length,
        characterLimit: usage.character?.limit
      }
    };
  } catch (error) {
    throw new Error(`DeepL translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get available target languages from DeepL
 */
export async function getAvailableLanguages(): Promise<deepl.Language[]> {
  try {
    const translator = getTranslator();
    return await translator.getTargetLanguages();
  } catch (error) {
    throw new Error(`Failed to get available languages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Normalize language codes to DeepL format
 */
function normalizeLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'spanish': 'ES',
    'french': 'FR', 
    'german': 'DE',
    'italian': 'IT',
    'portuguese': 'PT',
    'russian': 'RU',
    'japanese': 'JA',
    'chinese': 'ZH',
    'korean': 'KO',
    'dutch': 'NL',
    'polish': 'PL',
    'danish': 'DA',
    'finnish': 'FI',
    'greek': 'EL',
    'hungarian': 'HU',
    'indonesian': 'ID',
    'latvian': 'LV',
    'lithuanian': 'LT',
    'norwegian': 'NB',
    'romanian': 'RO',
    'slovak': 'SK',
    'slovenian': 'SL',
    'swedish': 'SV',
    'turkish': 'TR',
    'ukrainian': 'UK',
    'bulgarian': 'BG',
    'czech': 'CS',
    'estonian': 'ET',
    'arabic': 'AR',
    'english': 'EN'
  };

  // If it's already a code format (e.g., 'es', 'fr'), convert to uppercase
  if (language.length <= 3) {
    return language.toUpperCase();
  }
  
  // If it's a full language name, map it to the code
  const normalizedLanguage = language.toLowerCase();
  return languageMap[normalizedLanguage] || language.toUpperCase();
}

export { getTranslator };