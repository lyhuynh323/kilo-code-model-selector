const vscode = require('vscode');
const https = require('https');

let DYNAMIC_MODELS = {};
let DEPRECATED_MODELS = {};

let MODELS = {
  'qwen-coder-32b': {
    label: 'Qwen3 Coder 32B (Free)',
    model: 'qwen/qwen3-coder-32b',
    description: 'Mạnh nhất, phù hợp for complex coding tasks'
  },
  'qwen-coder-8b': {
    label: 'Qwen3 Coder 8B (Free)',
    model: 'qwen/qwen3-coder-8b',
    description: 'Nhanh, tiết kiệm resource, phù hợp for simple tasks'
  },
  'glm-air': {
    label: 'GLM 4.5 Air (Free)',
    model: 'zhipu/glm-4.5-air',
    description: 'Cân bằng giữa tốc độ và chất lượng'
  },
  'glm-flash': {
    label: 'GLM 4 Flash (Free)',
    model: 'zhipu/glm-4-flash',
    description: 'Nhanh nhất, miễn phí, phù hợp for quick tasks'
  },
  'deepseek-r1': {
    label: 'DeepSeek R1 (Free)',
    model: 'deepseek/deepseek-r1-0528',
    description: '推理能力强, phù hợp for complex logic & debugging'
  },
  'deepseek-v3': {
    label: 'DeepSeek V3 (Free)',
    model: 'deepseek/deepseek-v3-0324',
    description: 'Đa năng, mạnh về code generation'
  },
  'kimi-k2': {
    label: 'Kimi K2 (Free)',
    model: 'moonshotai/kimi-k2',
    description: 'Hỗ trợ long context, tốt cho large codebase'
  },
  'kimi-k1.5': {
    label: 'Kimi K1.5 (Free)',
    model: 'moonshotai/kimi-k1.5',
    description: 'Multimodal, hỗ trợ cả text và vision'
  },
  'mistral-nemo': {
    label: 'Mistral Nemo (Free)',
    model: 'mistralai/mistral-nemo-instruct-2407',
    description: 'Open source từ Mistral, hiệu suất cao'
  },
  'codellama-70b': {
    label: 'CodeLlama 70B (Free)',
    model: 'meta-llama/codellama-70b-instruct',
    description: 'Từ Meta, mạnh về code completion & generation'
  },
  'starcoder2-15b': {
    label: 'StarCoder2 15B (Free)',
    model: 'bigcode/starcoder2-15b-instruct-v0.1',
    description: 'Từ BigCode, tốt cho nhiều ngôn ngữ lập trình'
  }
};

function getAllModels() {
  return { ...MODELS, ...DYNAMIC_MODELS };
}

function getAllModelsWithDeprecated() {
  return { ...MODELS, ...DYNAMIC_MODELS, ...DEPRECATED_MODELS };
}

function getOpenRouterApiUrl() {
  try {
    const config = vscode.workspace.getConfiguration();
    return config.get('kilo-code.openRouterApiUrl') || 'https://openrouter.ai/api/v1';
  } catch {
    return 'https://openrouter.ai/api/v1';
  }
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          let errorMsg = `HTTP ${res.statusCode}`;
          try {
            const errorData = JSON.parse(data);
            errorMsg += `: ${errorData.error?.message || errorData.message || data}`;
          } catch {
            errorMsg += `: ${data}`;
          }
          
          if (res.statusCode === 429) {
            reject(new Error(`${errorMsg}. Vui lòng đợi một chút và thử lại.`));
          } else if (res.statusCode >= 500) {
            reject(new Error(`${errorMsg}. OpenRouter đang gặp sự cố, vui lòng thử lại sau.`));
          } else if (res.statusCode === 401) {
            reject(new Error('API key không hợp lệ. Vui lòng kiểm tra cấu hình API key.'));
          } else {
            reject(new Error(errorMsg));
          }
          return;
        }
        
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        reject(new Error('Không thể kết nối đến OpenRouter. Vui lòng kiểm tra kết nối internet.'));
      } else if (err.code === 'ENOTFOUND') {
        reject(new Error('Không tìm thấy server OpenRouter. Vui lòng kiểm tra DNS.'));
      } else {
        reject(err);
      }
    });
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout. Vui lòng thử lại.'));
    });
  });
}

function isFreeModel(model) {
  if (model.free) return true;
  const pricing = model.pricing || {};
  const promptPrice = parseFloat(pricing.prompt) || 0;
  const completionPrice = parseFloat(pricing.completion) || 0;
  return promptPrice === 0 && completionPrice === 0;
}

function generateModelKey(id) {
  return id.replace(/[\/\-]/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
}

async function fetchAllModelsFromOpenRouter() {
  const apiUrl = getOpenRouterApiUrl();
  const data = await httpGet(`${apiUrl}/models?limit=300`);
  return data.data || [];
}

function findModelMapping(oldModelId, apiModels) {
  const modelPatterns = {
    'qwen': ['qwen', 'qwen3', 'coder'],
    'glm': ['glm', 'z-ai'],
    'deepseek': ['deepseek', 'r1', 'v3'],
    'kimi': ['kimi', 'moonshotai'],
    'mistral': ['mistral', 'nemo'],
    'codellama': ['codellama', 'meta-llama'],
    'starcoder': ['starcoder', 'bigcode']
  };

  const isModelAvailable = (model) => {
    if (model.deprecated === true) return false;
    if (model.hidden === true) return false;
    const status = model.status?.toLowerCase();
    if (status === 'deprecated' || status === 'hidden' || status === 'unavailable') return false;
    return true;
  };

  for (const [category, keywords] of Object.entries(modelPatterns)) {
    if (oldModelId.toLowerCase().includes(category)) {
      const matches = apiModels.filter(m => 
        keywords.some(k => m.id.toLowerCase().includes(k))
      );
      
      if (matches.length > 0) {
        const activeMatches = matches.filter(m => isModelAvailable(m));
        const candidateMatches = activeMatches.length > 0 ? activeMatches : matches;
        
        const freeMatch = candidateMatches.find(m => isFreeModel(m));
        if (freeMatch) {
          return freeMatch;
        }
        return candidateMatches[0];
      }
    }
  }
  return null;
}

function fetchFreeModelsFromOpenRouter(apiModels) {
  const models = apiModels || [];
  const freeModels = models.filter(isFreeModel);
  
  const seen = new Map();
  const uniqueFreeModels = freeModels.filter(model => {
    if (seen.has(model.id)) return false;
    seen.set(model.id, model);
    return true;
  });
  
  const result = {};
  const existingKeys = new Set([
    ...Object.keys(MODELS),
    ...Object.keys(DYNAMIC_MODELS),
    ...Object.keys(DEPRECATED_MODELS)
  ]);
  
  for (const model of uniqueFreeModels) {
    const baseKey = generateModelKey(model.id);
    let key = baseKey;
    let counter = 1;
    
    while (key in result || existingKeys.has(key)) {
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
}

function activate(context) {
  console.log('Kilo Code Model Selector activated');

  // Command hiển thị model hiện tại
  const showCurrentModel = vscode.commands.registerCommand(
    'kilo-code-model-selector.showCurrentModel',
    async () => {
      try {
        const config = vscode.workspace.getConfiguration();
        const currentConfig = config.get('kilo-code.vsCodeLmModelSelector') || {};
        const currentMode = currentConfig.current_mode;

        if (currentMode && currentMode.model) {
          const allModels = getAllModels();
          const modelInfo = allModels[currentMode.model];
          const modelLabel = modelInfo?.label || currentMode.model;
          const modelName = modelInfo?.model || currentMode.model;
          
          vscode.window.showInformationMessage(
            `Model hiện tại: ${modelLabel}`,
            { modal: true, detail: `Model: ${modelName}\nAPI URL: ${currentMode.apiBaseUrl || getOpenRouterApiUrl()}` }
          );
        } else {
          vscode.window.showInformationMessage(
            'Chưa có model nào được chọn. Sử dụng lệnh "Chọn Model" để chọn model.'
          );
        }
      } catch (error) {
        console.error('Error in showCurrentModel:', error);
        vscode.window.showErrorMessage(`Lỗi: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(showCurrentModel);

  const getFreeModels = vscode.commands.registerCommand(
    'kilo-code-model-selector.getFreeModels',
    async () => {
      try {
        vscode.window.showInformationMessage('Đang lấy danh sách models từ OpenRouter...');
        
        const apiModels = await fetchAllModelsFromOpenRouter();
        const freeModelsFromApi = fetchFreeModelsFromOpenRouter(apiModels);
        
        let addedCount = 0;
        let updatedCount = 0;
        let mappedCount = 0;
        let removedCount = 0;
        let restoredCount = 0;
        
        // Kiểm tra và khôi phục các model deprecated nếu chúng xuất hiện lại trong API
        for (const [depKey, depModel] of Object.entries(DEPRECATED_MODELS)) {
          const isAvailable = (m) => {
            if (m.deprecated === true) return false;
            if (m.hidden === true) return false;
            const status = m.status?.toLowerCase();
            if (status === 'deprecated' || status === 'hidden' || status === 'unavailable') return false;
            return true;
          };
          const canRestore = apiModels.some(m => m.id === depModel.model && isAvailable(m));
          if (canRestore) {
            MODELS[depKey] = {
              ...depModel,
              deprecated: false,
              label: depModel.label.replace('[Deprecated] ', '')
            };
            delete DEPRECATED_MODELS[depKey];
            restoredCount++;
          }
        }
        
        for (const [key, oldModel] of Object.entries(MODELS)) {
          const mappedModel = findModelMapping(oldModel.model, apiModels);
          
          if (mappedModel) {
            const isFree = isFreeModel(mappedModel);
            const newModelId = mappedModel.id;
            
            if (oldModel.model !== newModelId) {
              MODELS[key] = {
                ...oldModel,
                model: newModelId,
                label: isFree ? `${mappedModel.name || mappedModel.id} (Free)` : oldModel.label,
                isFree: isFree
              };
              mappedCount++;
            }
          } else {
            if (!oldModel.deprecated) {
              DEPRECATED_MODELS[key] = {
                ...oldModel,
                deprecated: true,
                label: `[Deprecated] ${oldModel.label}`
              };
              delete MODELS[key];
              removedCount++;
            }
          }
        }
        
        for (const [key, value] of Object.entries(freeModelsFromApi)) {
          if (key in DYNAMIC_MODELS) {
            if (DYNAMIC_MODELS[key].description !== value.description) {
              DYNAMIC_MODELS[key] = { ...DYNAMIC_MODELS[key], ...value };
              updatedCount++;
            }
          } else if (key in MODELS) {
            // Bỏ qua nếu key đã tồn tại trong MODELS (static models ưu tiên hơn)
          } else {
            DYNAMIC_MODELS[key] = value;
            addedCount++;
          }
        }
        
        const allModels = getAllModels();
        vscode.window.showInformationMessage(
          `Đã cập nhật! Tổng: ${Object.keys(allModels).length} models\n(${addedCount} mới, ${updatedCount} cập nhật, ${mappedCount} map sang model mới, ${removedCount} đã xóa, ${restoredCount} đã khôi phục).`
        );
      } catch (error) {
        console.error('Error in getFreeModels:', error);
        vscode.window.showErrorMessage(`Lỗi khi lấy free models: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(getFreeModels);

  const disposable = vscode.commands.registerCommand(
    'kilo-code-model-selector.selectModel',
    async () => {
      try {
        const allModels = getAllModels();
        const items = Object.entries(allModels).map(([key, value]) => ({
          label: value.label,
          description: value.description,
          detail: value.model,
          key: key
        }));

        if (items.length === 0) {
          vscode.window.showInformationMessage('Không có model nào khả dụng.');
          return;
        }

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: 'Chọn model cho Kilo Code',
          matchOnDescription: true
        });

        if (selected) {
          const config = vscode.workspace.getConfiguration();
          const modelValue = allModels[selected.key]?.model || selected.detail;
          
          // Lấy apiKey hiện tại từ model đã được cấu hình trước đó
          const existingModelConfig = config.get(`kilo-code.vsCodeLmModelSelector.${selected.key}`);
          const apiKey = existingModelConfig?.apiKey || '';
          
          // Lấy toàn bộ config hiện tại của kilo-code.vsCodeLmModelSelector
          const currentSelectorConfig = config.get('kilo-code.vsCodeLmModelSelector') || {};
          
          // Cập nhật current_mode bên trong object thay vì tạo key mới ở root
          currentSelectorConfig.current_mode = {
            model: selected.key,
            apiKey: apiKey,
            apiBaseUrl: getOpenRouterApiUrl()
          };
          
          // Ghi lại toàn bộ object kilo-code.vsCodeLmModelSelector
          await config.update('kilo-code.vsCodeLmModelSelector', currentSelectorConfig, vscode.ConfigurationTarget.Global);

          vscode.window.showInformationMessage(
            `Đã chọn model: ${selected.label}`
          );
        }
      } catch (error) {
        console.error('Error in selectModel:', error);
        // Hiển thị thông báo lỗi chi tiết hơn
        if (error.message && error.message.includes('not a registered configuration')) {
          vscode.window.showErrorMessage(`Lỗi cấu hình: Vui lòng tắt và cài đặt lại extension Kilo Code Model Selector. Thông báo lỗi: ${error.message}`);
        } else {
          vscode.window.showErrorMessage(`Lỗi: ${error.message}`);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
