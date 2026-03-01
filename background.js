// 股票分析助手 - Background Script

// 平台URL配置
const PLATFORM_URLS = {
  gemini: () => 'https://gemini.google.com/app',
  chatgpt: () => 'https://chatgpt.com/',
  kimi: () => 'https://www.kimi.com/',
  doubao: () => 'https://www.doubao.com/chat/',
  grok: () => 'https://grok.com/'
};

// 平台ID列表
const PLATFORM_IDS = ['gemini', 'chatgpt', 'kimi', 'doubao', 'grok'];

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

// 获取本地化消息（兼容无国际化情况）
function getMessage(key, fallback) {
  try {
    const msg = chrome.i18n.getMessage(key);
    return msg || fallback;
  } catch (e) {
    return fallback;
  }
}

// 创建右键菜单
function createContextMenus() {
  // 先移除已存在的菜单（避免重复）
  chrome.contextMenus.removeAll(() => {
    // 创建父菜单
    chrome.contextMenus.create({
      id: 'stock-analysis-parent',
      title: getMessage('contextMenuAnalyze', '股票分析'),
      contexts: ['page']
    });

    // 创建各平台子菜单
    PLATFORM_IDS.forEach(platform => {
      const platformName = getMessage(`platform${platform.charAt(0).toUpperCase() + platform.slice(1)}`, getPlatformDisplayName(platform));
      chrome.contextMenus.create({
        id: `analyze-${platform}`,
        parentId: 'stock-analysis-parent',
        title: platformName,
        contexts: ['page']
      });
    });
  });
}

// 获取平台显示名称
function getPlatformDisplayName(platform) {
  const names = {
    gemini: 'Google Gemini',
    chatgpt: 'ChatGPT',
    kimi: 'Kimi (月之暗面)',
    doubao: '豆包',
    grok: 'Grok (xAI)'
  };
  return names[platform] || platform;
}

// 扩展安装或更新时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
  // 设置默认提示词模板
  chrome.storage.local.get(['promptTemplate'], (result) => {
    if (!result.promptTemplate) {
      chrome.storage.local.set({ promptTemplate: DEFAULT_PROMPT_TEMPLATE });
    }
  });
});

// 确保右键菜单存在（Service Worker 重启后）
chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.startsWith('analyze-')) {
    const platform = info.menuItemId.replace('analyze-', '');
    if (PLATFORM_IDS.includes(platform)) {
      await analyzeStockWithPlatform(tab, platform);
    }
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    chrome.tabs.get(request.tabId, async (tab) => {
      if (tab) {
        await analyzeStockWithPlatform(tab, request.platform);
      }
    });
  }
  if (request.action === 'getStockInfo') {
    // 向雪球页面请求股票信息
    sendResponse({ success: false, message: 'Use content script to get stock info' });
  }
});

// 使用指定平台分析股票
async function analyzeStockWithPlatform(tab, platform) {
  const tabUrl = tab.url || tab.pendingUrl;
  
  // 检查是否是雪球股票页面
  if (!tabUrl || !tabUrl.includes('xueqiu.com/S/')) {
    // 不是雪球页面，提示用户
    console.log('Not a Xueqiu stock page');
    return;
  }

  // 从URL提取股票代码
  const stockCode = extractStockCode(tabUrl);
  const stockName = tab.title ? extractStockName(tab.title, stockCode) : '未知股票';

  if (!stockCode) {
    console.error('无法获取股票代码');
    return;
  }

  // 获取提示词模板
  chrome.storage.local.get(['promptTemplate'], async (result) => {
    const template = result.promptTemplate || DEFAULT_PROMPT_TEMPLATE;
    
    // 替换变量
    const finalPrompt = template
      .replace(/{股票名称}/g, stockName)
      .replace(/{股票代码}/g, stockCode);
    
    // 复制到剪贴板（备用）
    try {
      await navigator.clipboard.writeText(finalPrompt);
      console.log('已复制到剪贴板:', finalPrompt);
    } catch (err) {
      console.error('复制失败:', err);
    }
    
    // 使用 Storage Bridge 模式
    chrome.storage.local.set({ 
      'pendingStockAnalysis': finalPrompt,
      'analysisTimestamp': Date.now()
    }, () => {
      const platformUrl = PLATFORM_URLS[platform]();
      chrome.tabs.create({ url: platformUrl });
    });
  });
}

// 从URL提取股票代码
function extractStockCode(url) {
  const match = url.match(/xueqiu\.com\/S\/([A-Z]{2}\d{6})/);
  return match ? match[1] : null;
}

// 从页面标题提取股票名称
function extractStockName(title, stockCode) {
  // 标题格式通常是: "股票名称(代码)股票股价_股价行情..."
  const titleMatch = title.match(/^(.+?)\([A-Z]{2}\d{6}\)/);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  // 尝试其他格式
  const h1Match = title.match(/^(.+?)\s*\(/);
  if (h1Match) {
    return h1Match[1];
  }
  
  return '未知股票';
}
