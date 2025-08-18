const { LLMConfig, LLMLog, User, Result, Survey, Group } = require('../models');
const crypto = require('crypto');

class LLMService {
  constructor() {
    this.providers = {
      claude: this.callClaude.bind(this),
      gemini: this.callGemini.bind(this),
      openai: this.callOpenAI.bind(this),
      ollama: this.callOllama.bind(this)
    };
  }

  // Encrypt API keys before storing
  encryptApiKey(apiKey) {
    const algorithm = 'aes-256-gcm';
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt API keys when using
  decryptApiKey(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const decipher = crypto.createDecipher(algorithm, key);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Get user's complete profile for matching
  async getUserProfile(userHash) {
    try {
      const user = await User.findOne({
        where: { userHash },
        include: [{
          model: Result,
          as: 'results',
          include: [{
            model: Survey,
            as: 'survey',
            attributes: ['id', 'name', 'category']
          }]
        }]
      });

      if (!user) {
        throw new Error(`User with hash ${userHash} not found`);
      }

      return {
        hash: userHash,
        demographics: {
          age: user.birthYear ? new Date().getFullYear() - user.birthYear : null,
          // Don't include identifying information
        },
        surveyResults: user.results?.map(result => ({
          surveyName: result.survey?.name,
          category: result.survey?.category,
          results: result.results_json,
          completedAt: result.completed_at
        })) || []
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Generate matching prompt for LLM
  generateMatchingPrompt(userProfiles, matchingType, groupContext = null) {
    const profileSummaries = userProfiles.map(profile => {
      const surveyData = profile.surveyResults.map(survey => 
        `${survey.category} Survey: ${JSON.stringify(survey.results)}`
      ).join('\n  ');
      
      return `User ${profile.hash}:\n  ${surveyData}`;
    }).join('\n\n');

    let prompt = `You are an expert personality analyst tasked with analyzing compatibility between users based on their comprehensive personality survey results.

MATCHING TYPE: ${matchingType}
${groupContext ? `GROUP CONTEXT: ${groupContext}` : ''}

USER PROFILES:
${profileSummaries}

Please analyze the compatibility between these users and provide:

1. COMPATIBILITY ANALYSIS: Detailed analysis of how well these personalities complement each other
2. STRENGTHS: Areas where they would work well together
3. POTENTIAL CHALLENGES: Areas that might require attention or compromise
4. RECOMMENDATIONS: Specific suggestions for successful interaction
5. COMPATIBILITY SCORE: Rate compatibility from 1-100 with explanation

${matchingType === '1:1' ? 
  'Focus on romantic/partnership compatibility and communication styles.' : 
  'Focus on group dynamics, leadership styles, and collaborative potential.'
}

Provide your analysis in JSON format with the following structure:
{
  "compatibility_score": number,
  "analysis": "detailed analysis text",
  "strengths": ["strength1", "strength2", ...],
  "challenges": ["challenge1", "challenge2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "summary": "brief summary of the match"
}`;

    return prompt;
  }

  // Main matching function
  async performMatching(userHashes, matchingType = '1:N', groupId = null, initiatedBy = null) {
    const startTime = Date.now();
    
    try {
      // Get active LLM configuration
      const config = await LLMConfig.findOne({
        where: { isActive: true, isDefault: true }
      });

      if (!config) {
        throw new Error('No active LLM configuration found');
      }

      // Get user profiles
      const userProfiles = await Promise.all(
        userHashes.map(hash => this.getUserProfile(hash))
      );

      // Generate prompt
      const prompt = this.generateMatchingPrompt(userProfiles, matchingType, 
        groupId ? `Group matching for group ID: ${groupId}` : null
      );

      // Call LLM
      const response = await this.callLLM(config, prompt);
      
      const processingTime = Date.now() - startTime;

      // Log the interaction
      const logEntry = await LLMLog.create({
        provider: config.provider,
        model: config.model,
        operation: 'matching_analysis',
        userHashes,
        groupId,
        prompt,
        response: JSON.stringify(response),
        tokenUsage: response.usage || null,
        processingTime,
        success: true,
        initiatedBy
      });

      return {
        success: true,
        analysis: response.analysis,
        logId: logEntry.id,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Log the error
      await LLMLog.create({
        provider: 'unknown',
        model: 'unknown',
        operation: 'matching_analysis',
        userHashes,
        groupId,
        prompt: 'Error occurred before prompt generation',
        response: '',
        processingTime,
        success: false,
        error: error.message,
        initiatedBy
      });

      throw error;
    }
  }

  // Generic LLM caller
  async callLLM(config, prompt) {
    const provider = this.providers[config.provider];
    if (!provider) {
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }

    return await provider(config, prompt);
  }

  // Claude API integration
  async callClaude(config, prompt) {
    // Mock implementation - replace with actual Claude API call
    console.log('Calling Claude API...');
    
    // Simulated response
    return {
      analysis: {
        compatibility_score: 85,
        analysis: "Based on the personality profiles, these users show strong compatibility with complementary traits.",
        strengths: ["Good communication potential", "Balanced personality types", "Shared values"],
        challenges: ["Different decision-making styles", "Potential energy level mismatches"],
        recommendations: ["Focus on establishing clear communication patterns", "Respect different pacing preferences"],
        summary: "High compatibility match with excellent long-term potential"
      },
      usage: {
        input_tokens: 1200,
        output_tokens: 300,
        total_tokens: 1500
      }
    };
  }

  // Gemini API integration  
  async callGemini(config, prompt) {
    // Mock implementation - replace with actual Gemini API call
    console.log('Calling Gemini API...');
    
    return {
      analysis: {
        compatibility_score: 78,
        analysis: "Gemini analysis shows good compatibility with some areas for growth.",
        strengths: ["Creative synergy", "Mutual respect"],
        challenges: ["Different communication styles"],
        recommendations: ["Practice active listening", "Establish regular check-ins"],
        summary: "Good match with potential for growth"
      },
      usage: {
        input_tokens: 1100,
        output_tokens: 280,
        total_tokens: 1380
      }
    };
  }

  // OpenAI API integration
  async callOpenAI(config, prompt) {
    // Mock implementation - replace with actual OpenAI API call
    console.log('Calling OpenAI API...');
    
    return {
      analysis: {
        compatibility_score: 82,
        analysis: "OpenAI analysis indicates strong compatibility with balanced personalities.",
        strengths: ["Excellent communication", "Shared goals", "Complementary skills"],
        challenges: ["Different time management styles"],
        recommendations: ["Coordinate schedules effectively", "Leverage each other's strengths"],
        summary: "Very good match with high success probability"
      },
      usage: {
        prompt_tokens: 1250,
        completion_tokens: 320,
        total_tokens: 1570
      }
    };
  }

  // Ollama API integration (local)
  async callOllama(config, prompt) {
    // Mock implementation - replace with actual Ollama API call
    console.log('Calling Ollama API...');
    
    return {
      analysis: {
        compatibility_score: 75,
        analysis: "Local analysis shows moderate to good compatibility.",
        strengths: ["Good foundational compatibility", "Similar interests"],
        challenges: ["Need to work on compromise", "Different energy levels"],
        recommendations: ["Focus on shared activities", "Respect individual needs"],
        summary: "Solid match with room for development"
      },
      usage: null // Ollama might not provide usage statistics
    };
  }

  // Get LLM logs for admin
  async getLogs(limit = 100, offset = 0, filters = {}) {
    const where = {};
    
    if (filters.provider) where.provider = filters.provider;
    if (filters.operation) where.operation = filters.operation;
    if (filters.success !== undefined) where.success = filters.success;

    const logs = await LLMLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'initiator', attributes: ['id', 'username'] },
        { model: Group, as: 'group', attributes: ['id', 'name'] }
      ]
    });

    return logs;
  }
}

module.exports = new LLMService();