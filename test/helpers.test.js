describe('Kilo Code Model Selector - Helper Functions', () => {
  let MODELS;
  let DYNAMIC_MODELS;
  let isFreeModel;
  let generateModelKey;
  let findModelMapping;
  let fetchFreeModelsFromOpenRouter;

  beforeEach(() => {
    jest.resetModules();
    
    MODELS = {
      'qwen-coder-32b': {
        label: 'Qwen3 Coder 32B (Free)',
        model: 'qwen/qwen3-coder-32b',
        description: 'Mạnh nhất, phù hợp for complex coding tasks'
      },
      'glm-air': {
        label: 'GLM 4.5 Air (Free)',
        model: 'zhipu/glm-4.5-air',
        description: 'Cân bằng giữa tốc độ và chất lượng'
      }
    };
    
    DYNAMIC_MODELS = {};

    isFreeModel = function(model) {
      if (model.free) return true;
      const pricing = model.pricing || {};
      const promptPrice = parseFloat(pricing.prompt) || 0;
      const completionPrice = parseFloat(pricing.completion) || 0;
      return promptPrice === 0 && completionPrice === 0;
    };

    generateModelKey = function(id) {
      return id.replace(/[\/\-]/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    };

    findModelMapping = function(oldModelId, apiModels) {
      const modelPatterns = {
        'qwen': ['qwen', 'qwen3', 'coder'],
        'glm': ['glm', 'z-ai'],
        'deepseek': ['deepseek', 'r1', 'v3'],
        'kimi': ['kimi', 'moonshotai'],
        'mistral': ['mistral', 'nemo'],
        'codellama': ['codellama', 'meta-llama'],
        'starcoder': ['starcoder', 'bigcode']
      };

      for (const [category, keywords] of Object.entries(modelPatterns)) {
        if (oldModelId.toLowerCase().includes(category)) {
          const matches = apiModels.filter(m => 
            keywords.some(k => m.id.toLowerCase().includes(k))
          );
          
          if (matches.length > 0) {
            const freeMatch = matches.find(m => isFreeModel(m));
            if (freeMatch) {
              return freeMatch;
            }
            return matches[0];
          }
        }
      }
      return null;
    };

    fetchFreeModelsFromOpenRouter = function(apiModels) {
      const models = apiModels || [];
      const freeModels = models.filter(isFreeModel);
      
      const seen = new Map();
      const uniqueFreeModels = freeModels.filter(model => {
        if (seen.has(model.id)) return false;
        seen.set(model.id, model);
        return true;
      });
      
      const result = {};
      const existingKeys = new Set(Object.keys(MODELS));
      
      for (const model of uniqueFreeModels) {
        const baseKey = generateModelKey(model.id);
        let key = baseKey;
        let counter = 1;
        
        while (existingKeys.has(key) || key in DYNAMIC_MODELS) {
          key = `${baseKey}_${counter}`;
          counter++;
        }
        
        existingKeys.add(key);
        result[key] = {
          label: `${model.name || model.id} (Free)`,
          model: model.id,
          description: model.description ? model.description.substring(0, 100) : 'Free model from OpenRouter'
        };
      }
      return result;
    };
  });

  describe('generateModelKey', () => {
    test('should generate correct key for model ID', () => {
      expect(generateModelKey('qwen/qwen3-coder-32b')).toBe('qwen_qwen3_coder_32b');
      expect(generateModelKey('deepseek/deepseek-r1-0528')).toBe('deepseek_deepseek_r1_0528');
      expect(generateModelKey('z-ai/glm-4.5-air:free')).toBe('z_ai_glm_45_airfree');
    });

    test('should handle special characters', () => {
      expect(generateModelKey('model-with-dashes')).toBe('model_with_dashes');
      expect(generateModelKey('model.name')).toBe('modelname');
    });

    test('should convert to lowercase', () => {
      expect(generateModelKey('QWEN/QWEN3-CODER')).toBe('qwen_qwen3_coder');
    });
  });

  describe('isFreeModel', () => {
    test('should return true for model with free flag', () => {
      const model = { free: true };
      expect(isFreeModel(model)).toBe(true);
    });

    test('should return true for model with zero pricing', () => {
      const model = { pricing: { prompt: '0', completion: '0' } };
      expect(isFreeModel(model)).toBe(true);
    });

    test('should return false for model with non-zero pricing', () => {
      const model = { pricing: { prompt: '0.0000004', completion: '0.000002' } };
      expect(isFreeModel(model)).toBe(false);
    });

    test('should return true for model with no pricing (default to 0)', () => {
      const model = {};
      expect(isFreeModel(model)).toBe(true);
    });

    test('should handle missing pricing object', () => {
      const model = { free: false };
      expect(isFreeModel(model)).toBe(true);
    });
  });

  describe('findModelMapping', () => {
    const apiModels = [
      { id: 'qwen/qwen3-coder:free', pricing: { prompt: '0', completion: '0' } },
      { id: 'qwen/qwen3-coder-next', pricing: { prompt: '0.00000012', completion: '0.00000075' } },
      { id: 'z-ai/glm-4.5-air:free', pricing: { prompt: '0', completion: '0' } },
      { id: 'deepseek/deepseek-r1-0528', pricing: { prompt: '0.00000045', completion: '0.00000215' } }
    ];

    test('should find free model mapping for qwen', () => {
      const result = findModelMapping('qwen/qwen3-coder-32b', apiModels);
      expect(result).not.toBeNull();
      expect(result.id).toBe('qwen/qwen3-coder:free');
    });

    test('should find mapping for glm', () => {
      const result = findModelMapping('zhipu/glm-4.5-air', apiModels);
      expect(result).not.toBeNull();
      expect(result.id).toBe('z-ai/glm-4.5-air:free');
    });

    test('should return first match if no free model found', () => {
      const result = findModelMapping('deepseek/deepseek-v3-0324', apiModels);
      expect(result).not.toBeNull();
      expect(result.id).toBe('deepseek/deepseek-r1-0528');
    });

    test('should return null for unknown model', () => {
      const result = findModelMapping('unknown/model', apiModels);
      expect(result).toBeNull();
    });

    test('should prioritize free models over paid', () => {
      const result = findModelMapping('qwen/qwen3-coder-32b', apiModels);
      expect(result.id).toBe('qwen/qwen3-coder:free');
    });
  });

  describe('fetchFreeModelsFromOpenRouter', () => {
    test('should filter and return free models', () => {
      const apiModels = [
        { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', description: 'Free model', pricing: { prompt: '0', completion: '0' } },
        { id: 'qwen/qwen3-coder-paid', name: 'Qwen3 Coder Paid', description: 'Paid model', pricing: { prompt: '0.0001', completion: '0.0001' } },
        { id: 'free/model', name: 'Free Model', description: 'Free', pricing: { prompt: '0', completion: '0' } }
      ];

      const result = fetchFreeModelsFromOpenRouter(apiModels);
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['qwen_qwen3_coderfree']).toBeDefined();
      expect(result['free_model']).toBeDefined();
    });

    test('should handle empty API models', () => {
      const result = fetchFreeModelsFromOpenRouter([]);
      expect(result).toEqual({});
    });

    test('should handle null/undefined API models', () => {
      expect(fetchFreeModelsFromOpenRouter(null)).toEqual({});
      expect(fetchFreeModelsFromOpenRouter(undefined)).toEqual({});
    });

    test('should avoid key conflicts with existing MODELS', () => {
      const apiModels = [
        { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', description: 'Free model', pricing: { prompt: '0', completion: '0' } }
      ];

      const result = fetchFreeModelsFromOpenRouter(apiModels);
      
      expect(result['qwen_qwen3_coder_32b']).toBeUndefined();
    });

    test('should truncate long descriptions', () => {
      const longDescription = 'A'.repeat(200);
      const apiModels = [
        { id: 'test/model', name: 'Test', description: longDescription, pricing: { prompt: '0', completion: '0' } }
      ];

      const result = fetchFreeModelsFromOpenRouter(apiModels);
      
      expect(result['test_model'].description.length).toBe(100);
    });

    test('should use default description when missing', () => {
      const apiModels = [
        { id: 'test/model', name: 'Test', pricing: { prompt: '0', completion: '0' } }
      ];

      const result = fetchFreeModelsFromOpenRouter(apiModels);
      
      expect(result['test_model'].description).toBe('Free model from OpenRouter');
    });

    test('should deduplicate models with same id', () => {
      const apiModels = [
        { id: 'test/model-a', name: 'Test Model A', description: 'First', pricing: { prompt: '0', completion: '0' } },
        { id: 'test/model-a', name: 'Test Model A', description: 'Second', pricing: { prompt: '0', completion: '0' } },
        { id: 'test/model-b', name: 'Test Model B', description: 'Third', pricing: { prompt: '0', completion: '0' } }
      ];

      const result = fetchFreeModelsFromOpenRouter(apiModels);
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['test_model_a'].description).toBe('First');
      expect(result['test_model_b'].description).toBe('Third');
    });
  });

  describe('Integration Tests', () => {
    test('MODELS structure should be valid', () => {
      expect(MODELS).toBeDefined();
      expect(typeof MODELS).toBe('object');
      
      Object.entries(MODELS).forEach(([key, value]) => {
        expect(value).toHaveProperty('label');
        expect(value).toHaveProperty('model');
        expect(value).toHaveProperty('description');
      });
    });

    test('DYNAMIC_MODELS should start empty', () => {
      expect(DYNAMIC_MODELS).toEqual({});
    });

    test('getAllModels should merge MODELS and DYNAMIC_MODELS', () => {
      DYNAMIC_MODELS = {
        'dynamic-model': {
          label: 'Dynamic Model (Free)',
          model: 'test/dynamic-model',
          description: 'Dynamic test model'
        }
      };

      const getAllModels = () => ({ ...MODELS, ...DYNAMIC_MODELS });
      const allModels = getAllModels();

      expect(Object.keys(allModels)).toHaveLength(3);
      expect(allModels['qwen-coder-32b']).toBeDefined();
      expect(allModels['dynamic-model']).toBeDefined();
    });
  });
});
