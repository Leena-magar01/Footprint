import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini SDK if the key is available
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface InsightItem {
  category: 'transportation' | 'electricity' | 'food' | 'water' | 'shopping';
  recommendation: string;
  estimatedReduction: number; // in kg CO2
  percentageImprovement: number; // percentage
  impact: 'High' | 'Medium' | 'Low';
}

export interface EcoLensResult {
  itemAnalyzed: string;
  category: 'transportation' | 'electricity' | 'food' | 'water' | 'shopping';
  estimatedFootprint: number; // kg CO2
  confidence: number; // 0 to 1
  explanation: string;
  greenAlternatives: string[];
}

/**
 * Helper to extract and parse JSON from AI response, ignoring any wrapping text or markdown code blocks
 */
const cleanAndParseJSON = (text: string): any => {
  const firstCurly = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startIdx = -1;
  let endChar = '';
  
  if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
    startIdx = firstCurly;
    endChar = '}';
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endChar = ']';
  }
  
  if (startIdx === -1) {
    throw new Error('JSON structure not found');
  }
  
  const endIdx = text.lastIndexOf(endChar);
  if (endIdx === -1 || endIdx < startIdx) {
    throw new Error('Invalid JSON structure boundaries');
  }
  
  const jsonStr = text.slice(startIdx, endIdx + 1);
  return JSON.parse(jsonStr);
};

/**
 * Generate sustainability insights based on user activity aggregates
 */
export const generateAIInsights = async (
  userFootprints: any[],
  userName: string
): Promise<InsightItem[]> => {
  if (!genAI) {
    console.warn('GEMINI_API_KEY not found. Returning mock insights.');
    return getMockInsights(userFootprints);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const contextPrompt = `
      You are EcoPilot AI, a premium carbon footprint coach.
      Here is the historical carbon footprint logs for user "${userName}" over the last 30 days:
      ${JSON.stringify(userFootprints)}
      
      Generate a list of 3 specific, highly actionable recommendations for this user to reduce their footprint.
      Return the output strictly in JSON format as a list of objects matching this TypeScript interface:
      interface Insight {
        category: 'transportation' | 'electricity' | 'food' | 'water' | 'shopping';
        recommendation: string;
        estimatedReduction: number; // estimated kg CO2 reduction per week if followed
        percentageImprovement: number; // estimated percentage reduction for this category
        impact: 'High' | 'Medium' | 'Low';
      }
      Do not include markdown tags like \`\`\`json or \`\`\`. Just return raw JSON.
    `;

    const result = await model.generateContent(contextPrompt);
    const text = result.response.text().trim();
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error('Gemini API Error in generateAIInsights:', error);
    return getMockInsights(userFootprints);
  }
};

/**
 * EcoLens: Analyze image upload (food, product, appliance, receipt, vehicle)
 */
export const analyzeImageEcoLens = async (
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<EcoLensResult> => {
  if (!genAI) {
    console.warn('GEMINI_API_KEY not found. Returning mock EcoLens analysis.');
    return getMockEcoLensAnalysis(fileName);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analyze this image upload. It represents a receipt, a product, food, an appliance, a water usage activity, or a transportation vehicle.
      Estimate its carbon footprint and determine its sustainability details.
      Return the output strictly in JSON format matching this structure:
      {
        "itemAnalyzed": "Short name of the product or item identified",
        "category": "transportation" | "electricity" | "food" | "water" | "shopping",
        "estimatedFootprint": 12.4, // estimated carbon footprint in kg CO2 (use reasonable coefficients)
        "confidence": 0.85, // confidence score between 0.0 and 1.0
        "explanation": "A concise explanation of why this item has this carbon footprint and what factors contribute to it.",
        "greenAlternatives": ["Alternative 1", "Alternative 2", "Alternative 3"] // list 2 to 3 greener alternatives
      }
      Do not include markdown tags like \`\`\`json or \`\`\`. Just return raw JSON.
    `;

    const imageParts = [
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text().trim();
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error('Gemini API Error in analyzeImageEcoLens:', error);
    return getMockEcoLensAnalysis(fileName);
  }
};

// --- MOCK FALLBACKS ---

const getMockInsights = (footprints: any[]): InsightItem[] => {
  // Return intelligent mocks based on categories logged
  const hasTrans = footprints.some(f => f.category === 'transportation');
  const hasFood = footprints.some(f => f.category === 'food');
  const hasElectricity = footprints.some(f => f.category === 'electricity');

  const insights: InsightItem[] = [];

  if (hasTrans || insights.length < 3) {
    insights.push({
      category: 'transportation',
      recommendation: 'Switch to public transport or carpool for your daily work commutes twice a week.',
      estimatedReduction: 18.4,
      percentageImprovement: 12,
      impact: 'High'
    });
  }
  if (hasElectricity || insights.length < 3) {
    insights.push({
      category: 'electricity',
      recommendation: 'Replace standard lighting fixtures with high-efficiency LEDs and reduce standby power usage.',
      estimatedReduction: 6.2,
      percentageImprovement: 8,
      impact: 'Medium'
    });
  }
  if (hasFood || insights.length < 3) {
    insights.push({
      category: 'food',
      recommendation: 'Introduce a "Meatless Monday" or replace beef/pork meals with organic plant-based alternatives.',
      estimatedReduction: 11.5,
      percentageImprovement: 15,
      impact: 'High'
    });
  }

  // Fallbacks if not enough
  if (insights.length < 3) {
    insights.push({
      category: 'water',
      recommendation: 'Install low-flow aerators on taps and shorten daily shower duration to 5 minutes.',
      estimatedReduction: 2.1,
      percentageImprovement: 5,
      impact: 'Low'
    });
  }

  return insights;
};

const getMockEcoLensAnalysis = (fileName: string): EcoLensResult => {
  const name = fileName.toLowerCase();
  
  if (name.includes('receipt') || name.includes('bill') || name.includes('invoice')) {
    return {
      itemAnalyzed: 'Grocery Receipt (Paper)',
      category: 'shopping',
      estimatedFootprint: 4.8,
      confidence: 0.90,
      explanation: 'Analysis of grocery receipt shows items with high food-mileage and meat products, coupled with standard paper waste footprint.',
      greenAlternatives: [
        'Choose locally sourced organic produce to reduce transport emissions.',
        'Opt for digital receipts (e-receipts) to eliminate paper waste.',
        'Incorporate more plant-based alternatives to reduce livestock emission weight.'
      ]
    };
  } else if (name.includes('food') || name.includes('meal') || name.includes('beef') || name.includes('burger') || name.includes('plate')) {
    return {
      itemAnalyzed: 'Beef Cheeseburger',
      category: 'food',
      estimatedFootprint: 7.2,
      confidence: 0.95,
      explanation: 'Red meat (specifically beef) has the highest carbon footprint of any food group due to enteric fermentation, land clearance, and water usage in cattle farming.',
      greenAlternatives: [
        'Plant-based meat alternatives (like Beyond or Impossible burgers), reducing emissions by up to 90%.',
        'Chicken or turkey burger (reduces footprint to ~1.8 kg CO2).',
        'Lentil or black bean patty (minimizes footprint to ~0.5 kg CO2).'
      ]
    };
  } else if (name.includes('car') || name.includes('vehicle') || name.includes('suv')) {
    return {
      itemAnalyzed: 'Midsize Petrol SUV',
      category: 'transportation',
      estimatedFootprint: 0.22, // kg CO2 / km
      confidence: 0.88,
      explanation: 'Internal combustion engine SUV with standard emissions. Emits high amounts of CO2 directly into the atmosphere during combustion.',
      greenAlternatives: [
        'Electric Vehicle (EV), which reduces carbon footprint by ~75% depending on energy grid source.',
        'Hybrid vehicle (reduces emissions to ~0.10 kg CO2 / km).',
        'Public subway or bus networks (approx. 0.04 kg CO2 / km per passenger).'
      ]
    };
  } else if (name.includes('fridge') || name.includes('ac') || name.includes('appliance') || name.includes('light')) {
    return {
      itemAnalyzed: 'Legacy Air Conditioning Unit',
      category: 'electricity',
      estimatedFootprint: 1.8, // kg CO2 per hour of operation
      confidence: 0.82,
      explanation: 'Air conditioning uses significant electrical power. Legacy units lack high-efficiency inverter compressors, increasing grid electricity draw.',
      greenAlternatives: [
        'Energy Star Certified inverter air conditioner, which saves up to 40% energy.',
        'Smart programmable thermostat to schedule cooling periods efficiently.',
        'High-efficiency ceiling fan combined with cross-ventilation.'
      ]
    };
  } else {
    // Default general product mockup
    return {
      itemAnalyzed: 'Plastic Water Bottle',
      category: 'shopping',
      estimatedFootprint: 0.35,
      confidence: 0.85,
      explanation: 'Single-use PET plastic bottles have a notable carbon cost during production (petroleum-based polymer synthesis) and shipping, plus high plastic waste pollution potential.',
      greenAlternatives: [
        'Reusable Stainless Steel bottle (zero footprint after 20 uses).',
        'Filtered tap water in reusable glass jugs.',
        'Aluminum canned beverages (aluminum is highly recyclable and requires less lifecycle energy).'
      ]
    };
  }
};
