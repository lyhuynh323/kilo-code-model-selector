const vscode = require('vscode');

const MODELS = {
  'qwen-coder': {
    label: 'Qwen3 Coder (Free)',
    model: 'qwen/qwen3-coder-32b'
  },
  'glm-air': {
    label: 'GLM 4.5 Air (Free)',
    model: 'zhipu/glm-4.5-air'
  },
  'deepseek-r1': {
    label: 'DeepSeek R1 (Free)',
    model: 'deepseek/deepseek-r1-0528'
  },
  'kimi-k2': {
    label: 'Kimi K2 (Free)',
    model: 'moonshotai/kimi-k2'
  }
};

function activate(context) {
  console.log('Kilo Code Model Selector activated');

  const disposable = vscode.commands.registerCommand(
    'kilo-code-model-selector.selectModel',
    async () => {
      // Lấy danh sách model
      const items = Object.entries(MODELS).map(([key, value]) => ({
        label: value.label,
        description: value.model,
        key: key
      }));

      // Hiển thị selection dialog
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Chọn model cho Kilo Code',
        matchOnDescription: true
      });

      if (selected) {
        // Cập nhật cấu hình
        const config = vscode.workspace.getConfiguration('kilo-code.vsCodeLmModelSelector');
        const currentMode = config.get('current_mode', {});
        
        await config.update('current_mode', {
          ...currentMode,
          model: selected.key
        }, vscode.ConfigurationTarget.Global);

        vscode.window.showInformationMessage(
          `Đã chọn model: ${selected.label}`
        );
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
