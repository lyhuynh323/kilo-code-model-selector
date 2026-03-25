# Kilo Code Model Selector

VS Code extension to select AI models for Kilo Code via Ctrl+Shift+P.

## Tổng quan

Kilo Code Model Selector giúp bạn dễ dàng chuyển đổi giữa các AI models khác nhau để hỗ trợ lập trình. Extension tích hợp với Kilo Code và lưu cấu hình model đã chọn vào VS Code settings.

## Overview

Kilo Code Model Selector helps you easily switch between different AI models for coding assistance. The extension integrates with Kilo Code and saves your selected model configuration to VS Code settings.

## Yêu cầu trước khi cài đặt

## Installation Requirements

### 1. Cài đặt Kilo Code Extension

### 1. Install Kilo Code Extension

Trước tiên, bạn cần cài đặt Kilo Code extension từ VS Code Marketplace:

1. Mở VS Code
2. Nhấn `Ctrl+Shift+X` để mở Extensions panel
3. Tìm kiếm "Kilo Code"
4. Nhấn Install để cài đặt

### 2. Đăng ký tài khoản OpenRouter (Bắt buộc)

### 2. Register OpenRouter Account (Required)

Extension này sử dụng OpenRouter làm API gateway để kết nối với các AI models. Bạn cần đăng ký tài khoản và lấy API key:

This extension uses OpenRouter as the API gateway to connect to AI models. You need to register an account and get an API key:

**Bước 1: Truy cập OpenRouter**
- Mở trình duyệt và truy cập: https://openrouter.ai/

**Bước 2: Đăng ký tài khoản**
- Nhấn nút "Sign Up" hoặc "Get Started"
- Bạn có thể đăng ký bằng:
  - Google Account
  - GitHub Account
  - Email/password

**Bước 3: Xác minh email (nếu đăng ký bằng email)**
- Kiểm tra hộp thư email
- Nhấn vào link xác minh

**Bước 4: Lấy API Key**
- Sau khi đăng nhập, truy cập: https://openrouter.ai/keys
- Nhấn nút "Create Secret Key"
- Đặt tên cho key (ví dụ: "VS Code Kilo Code")
- **QUAN TRỌNG**: Copy ngay lập tức vì key chỉ hiển thị một lần!
- Lưu key vào nơi an toàn

**Bước 5: Nạp credit (Khuyến nghị)**
- Mặc dù OpenRouter có credit miễn phí cho người dùng mới, bạn nên nạp thêm để sử dụng liên tục
- Truy cập: https://openrouter.ai/settings
- Nhấn "Add credits"
- Chọn phương thức thanh toán và nạp tiền (tối thiểu $5)

### 3. Cấu hình API Key trong Kilo Code

### 3. Configure API Key in Kilo Code

Sau khi có API Key từ OpenRouter, bạn cần cấu hình trong Kilo Code:

After getting the API Key from OpenRouter, configure it in Kilo Code:

1. Mở VS Code
2. Nhấn `Ctrl+Shift+P` và gõ "Preferences: Open Settings (JSON)"
3. Thêm hoặc cập nhật cấu hình sau:

```json
{
  "kilo-code.vsCodeLmModelSelector": {
    "current_mode": {
      "model": "qwen-coder-32b",
      "apiKey": "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "apiBaseUrl": "https://openrouter.ai/api/v1"
    }
  }
}
```

**Thay thế `sk-or-v1-xxxxxxxx...`** bằng API Key thực tế của bạn.

## Cài đặt Extension

## Installation

### Cách 1: Cài đặt từ VSIX (Khuyến nghị cho người dùng)

### Method 1: Install from VSIX (Recommended for users)

1. Tải file [`kilo-code-model-selector-1.1.0.vsix`](kilo-code-model-selector-1.1.0.vsix)
2. Mở VS Code
3. Nhấn `Ctrl+Shift+P` và gõ "Extensions: Install from VSIX"
4. Chọn file vừa tải về
5. Nhấn "Install" và sau đó "Reload Now"

### Cách 2: Cài đặt từ source (Dành cho nhà phát triển)

### Method 2: Install from source (For developers)

1. Clone repository:
```bash
git clone https://github.com/lyhuynh323/kilo-code-model-selector.git
```

2. Mở thư mục trong VS Code:
```bash
cd kilo-code-model-selector
code .
```

3. Nhấn `F5` để chạy trong Extension Development Host

## Cách sử dụng

## Usage

### Bước 1: Mở Command Palette

### Step 1: Open Command Palette

Nhấn `Ctrl+Shift+P` (Windows/Linux) hoặc `Cmd+Shift+P` (Mac)

Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

### Bước 2: Chọn Model

### Step 2: Select Model

1. Gõ "Kilo Code: Select Model"
2. Nhấn Enter để chọn command
3. Một danh sách các models sẽ hiện ra
4. Chọn model mong muốn bằng cách nhấn Enter hoặc click

1. Type "Kilo Code: Select Model"
2. Press Enter to select command
3. A list of models will appear
4. Select your desired model by pressing Enter or clicking

### Bước 3: Xác nhận

### Step 3: Confirm

Sau khi chọn, thông báo "Đã chọn model: [Tên model]" sẽ hiện lên.

After selection, a message "Đã chọn model: [Model name]" will appear.

## Danh sách Models hiện có

## Available Models

| # | Tên hiển thị | Model ID | Mô tả |
|---|-------------|----------|-------|
| 1 | Qwen3 Coder 32B (Free) | qwen/qwen3-coder-32b | Mạnh nhất, phù hợp cho complex coding tasks |
| 2 | Qwen3 Coder 8B (Free) | qwen/qwen3-coder-8b | Nhanh, tiết kiệm resource, phù hợp cho simple tasks |
| 3 | GLM 4.5 Air (Free) | zhipu/glm-4.5-air | Cân bằng giữa tốc độ và chất lượng |
| 4 | GLM 4 Flash (Free) | zhipu/glm-4-flash | Nhanh nhất, miễn phí, phù hợp cho quick tasks |
| 5 | DeepSeek R1 (Free) | deepseek/deepseek-r1-0528 |推理能力强, phù hợp cho complex logic & debugging |
| 6 | DeepSeek V3 (Free) | deepseek/deepseek-v3-0324 | Đa năng, mạnh về code generation |
| 7 | Kimi K2 (Free) | moonshotai/kimi-k2 | Hỗ trợ long context, tốt cho large codebase |
| 8 | Kimi K1.5 (Free) | moonshotai/kimi-k1.5 | Multimodal, hỗ trợ cả text và vision |
| 9 | Mistral Nemo (Free) | mistralai/mistral-nemo-instruct-2407 | Open source từ Mistral, hiệu suất cao |
| 10 | CodeLlama 70B (Free) | meta-llama/codellama-70b-instruct | Từ Meta, mạnh về code completion & generation |
| 11 | StarCoder2 15B (Free) | bigcode/starcoder2-15b-instruct-v0.1 | Từ BigCode, tốt cho nhiều ngôn ngữ lập trình |

## Khắc phục sự cố

### Lỗi: "Extension không hoạt động"

**Giải pháp:**
1. Đảm bảo đã cài đặt Kilo Code extension trước
2. Reload VS Code bằng cách nhấn `Ctrl+Shift+P` và gõ "Developer: Reload Window"
3. Thử cài đặt lại extension

### Lỗi: "API Key không hợp lệ"

**Giải pháp:**
1. Kiểm tra lại API Key trong settings.json
2. Đảm bảo key bắt đầu bằng "sk-or-v1-"
3. Truy cập https://openrouter.ai/keys để tạo key mới nếu cần

### Lỗi: "Không thể kết nối API"

**Giải pháp:**
1. Kiểm tra kết nối internet
2. Kiểm tra xem API Key còn hiệu lực không
3. Thử sử dụng model khác để xác định vấn đề

### Lỗi: "Credit không đủ"

**Giải pháp:**
1. Truy cập https://openrouter.ai/settings
2. Kiểm tra số dư tài khoản
3. Nạp thêm credit nếu cần

## Yêu cầu hệ thống

- VS Code 1.70.0 trở lên
- Kilo Code extension đã được cài đặt
- Tài khoản OpenRouter với API Key
- Kết nối internet để sử dụng AI models

## Cấu trúc project

```
kilo-code-model-selector/
├── extension.js                     # Main code của extension
├── package.json                     # Extension manifest
├── README.md                        # Tài liệu hướng dẫn
└── kilo-code-model-selector-1.1.0.vsix  # Package để cài đặt
```

## Thông tin thêm

- **Version**: 1.1.0
- **Author**: Custom
- **License**: MIT
- **Repository**: https://github.com/lyhuynh323/kilo-code-model-selector
