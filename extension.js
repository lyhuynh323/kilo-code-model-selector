const vscode = require('vscode');

const MODELS = {
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

function activate(context) {
  console.log('Kilo Code Model Selector activated');

  const disposable = vscode.commands.registerCommand(
    'kilo-code-model-selector.selectModel',
    async () => {
      try {
        // Lấy danh sách model
        const items = Object.entries(MODELS).map(([key, value]) => ({
          label: value.label,
          description: value.description,
          detail: value.model,
          key: key
        }));

        // Hiển thị selection dialog
        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: 'Chọn model cho Kilo Code',
          matchOnDescription: true
        });

        if (selected) {
          const config = vscode.workspace.getConfiguration();
          
          // Lấy model từ MODELS object
          const modelValue = MODELS[selected.key]?.model || selected.detail;
          
          // Lấy apiKey hiện tại từ model đã được cấu hình trước đó
          const existingModelConfig = config.get(`kilo-code.vsCodeLmModelSelector.${selected.key}`);
          const apiKey = existingModelConfig?.apiKey || '';
          
          // Lấy toàn bộ config hiện tại của kilo-code.vsCodeLmModelSelector
          const currentSelectorConfig = config.get('kilo-code.vsCodeLmModelSelector') || {};
          
          // Cập nhật current_mode bên trong object thay vì tạo key mới ở root
          currentSelectorConfig.current_mode = {
            model: selected.key,
            apiKey: apiKey,
            apiBaseUrl: 'https://openrouter.ai/api/v1'
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
