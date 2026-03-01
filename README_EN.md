# Stock Analysis Assistant

English | [简体中文](./README.md)

A Chrome extension that helps you quickly analyze stocks using AI platforms on Xueqiu stock pages.

## Features

- 🔘 **Context Menu Trigger** - Right-click on Xueqiu stock pages to select an AI platform for analysis
- 🤖 **Multi-Platform Support** - Supports Google Gemini, ChatGPT, Kimi, Doubao, Grok, and more
- ✏️ **Customizable Prompts** - Customize analysis prompt templates via the popup interface
- 📋 **Auto-Fill** - Automatically extracts stock name and code, fills them into AI platform inputs

## Installation

### Install from Source

1. Download or clone this project
   ```bash
   git clone https://github.com/your-username/stock-analysis-extension.git
   ```

2. Open Chrome and navigate to the extensions page
   - Enter in address bar: `chrome://extensions/`
   - Or via menu: More tools → Extensions

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the `stock-analysis-extension` directory

5. Installation complete! The extension icon will appear in the toolbar

## Usage

### Method 1: Context Menu (Recommended)

1. Open any Xueqiu stock page, e.g., `https://xueqiu.com/S/SH600026`
2. Right-click anywhere on the page
3. Select "Stock Analysis" → Choose target AI platform
4. The extension will automatically open the platform and fill in the analysis prompt

### Method 2: Click Extension Icon

1. Open a Xueqiu stock page
2. Click the extension icon in the browser toolbar
3. Select your default analysis platform
4. Click the "Analyze Current Stock" button

## Customizing Prompts

Click the extension icon to open settings and customize your analysis prompt template.

### Available Variables

| Variable | Description |
|----------|-------------|
| `{股票名称}` | Stock name |
| `{股票代码}` | Stock code |

### Default Prompt

The extension uses the following default prompt template:

```
帮我从以下维度进行分析股票：

1. 业务理解：用简单术语解释公司业务、解决的问题、付费对象及客户选择它的理由（避免财务术语）。
2. 收入分解：拆解收入流，指出增长/放缓业务及对主要产品/客户的依赖程度。
3. 行业背景：说明所在行业增长/稳定/萎缩状况及长期趋势的影响。
4. 竞争格局：列出主要对手，从定价、产品、规模、护城河对比，突出公司优劣势。
5. 财务质量：分析近年收入增长一致性、利润率、债务、现金流及资本配置。
6. 风险与下跌：识别最大业务/财务/监管风险及可能永久损害业务的因素。
7. 管理层与执行：评估管理团队历史表现及决策对长期股东的影响。
8. 牛熊情景：列出未来3-5年现实牛案与熊案（聚焦基本面，非价格预测）。
9. 估值思考：解释市场如何看待估值，哪些假设最关键及支撑更高/更低估值的条件。
10. 长期论文：形成长期投资论点，总结为什么是好投资、必须成功的条件及出错信号。

最后使用表格汇总；

股票的名称和代码是： {股票名称} {股票代码}
```

## Supported AI Platforms

| Platform | URL |
|----------|-----|
| Google Gemini | https://gemini.google.com |
| ChatGPT | https://chatgpt.com |
| Kimi | https://www.kimi.com |
| Doubao | https://www.doubao.com |
| Grok (xAI) | https://grok.com |

## Technical Architecture

```
stock-analysis-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service Worker: Context menu + Message handling
├── content.js             # Xueqiu page script: Extract stock info
├── content_*.js           # AI platform scripts: Auto-fill prompts
├── popup.html/js          # Popup interface: Configure prompts
├── _locales/              # Internationalization files
└── icons/                 # Extension icons
```

### Core Mechanisms

1. **Storage Bridge Pattern**: Pass data between pages via `chrome.storage.local`
2. **Content Script Injection**: Inject scripts into Xueqiu and AI platform pages
3. **Auto-Fill**: Use `document.execCommand('insertText')` to simulate user input

## Notes

- This extension only works on Xueqiu stock pages (`https://xueqiu.com/S/*`)
- Some AI platforms may require login
- If auto-fill fails, the prompt is automatically copied to clipboard for manual pasting

## License

MIT License
