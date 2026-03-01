// 股票分析助手 - Popup Script

// 默认提示词模板
const DEFAULT_PROMPT_TEMPLATE = `帮我从以下维度进行分析股票：

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

股票的名称和代码是： {股票名称} {股票代码}`;

// DOM 元素
const targetPlatformSelect = document.getElementById('targetPlatform');
const promptTemplateTextarea = document.getElementById('promptTemplate');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');

// 加载设置
function loadSettings() {
  chrome.storage.local.get(['targetPlatform', 'promptTemplate'], (result) => {
    targetPlatformSelect.value = result.targetPlatform || 'gemini';
    promptTemplateTextarea.value = result.promptTemplate || DEFAULT_PROMPT_TEMPLATE;
  });
}

// 保存设置
function saveSettings() {
  const settings = {
    targetPlatform: targetPlatformSelect.value,
    promptTemplate: promptTemplateTextarea.value
  };
  
  chrome.storage.local.set(settings, () => {
    showStatus('设置已保存', 'success');
  });
}

// 恢复默认设置
function resetSettings() {
  promptTemplateTextarea.value = DEFAULT_PROMPT_TEMPLATE;
  targetPlatformSelect.value = 'gemini';
  
  chrome.storage.local.set({
    targetPlatform: 'gemini',
    promptTemplate: DEFAULT_PROMPT_TEMPLATE
  }, () => {
    showStatus('已恢复默认设置', 'success');
  });
}

// 显示状态
function showStatus(message, type = '') {
  statusDiv.textContent = message;
  statusDiv.className = 'status' + (type ? ' ' + type : '');
  
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}

// 分析当前页面
async function analyzeCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    showStatus('无法获取当前页面');
    return;
  }
  
  // 检查是否是雪球股票页面
  const url = tab.url || tab.pendingUrl || '';
  if (!url.includes('xueqiu.com/S/')) {
    showStatus('请在雪球股票页面使用');
    return;
  }
  
  // 保存当前设置
  saveSettings();
  
  // 发送消息给 background script
  chrome.runtime.sendMessage({
    action: 'analyze',
    tabId: tab.id,
    platform: targetPlatformSelect.value
  });
  
  showStatus('正在打开分析平台...', 'success');
  
  // 关闭 popup
  setTimeout(() => {
    window.close();
  }, 500);
}

// 事件监听
saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetSettings);
analyzeBtn.addEventListener('click', analyzeCurrentPage);

// 初始化
loadSettings();

// 检查当前页面状态
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    const url = tabs[0].url || '';
    if (url.includes('xueqiu.com/S/')) {
      statusDiv.textContent = '当前页面可以进行分析';
      statusDiv.className = 'status success';
    } else {
      statusDiv.textContent = '请在雪球股票页面使用';
    }
  }
});
