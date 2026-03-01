// 股票分析助手 - 雪球页面内容脚本
// 只负责提取股票信息，响应 background 的请求

// 从URL提取股票代码
function extractStockCode() {
  const url = window.location.href;
  const match = url.match(/xueqiu\.com\/S\/([A-Z]{2}\d{6})/);
  return match ? match[1] : null;
}

// 从页面提取股票名称
function extractStockName() {
  // 方法1：从页面标题提取
  const title = document.title;
  // 标题格式通常是: "股票名称(代码)股票股价_股价行情..."
  const titleMatch = title.match(/^(.+?)\([A-Z]{2}\d{6}\)/);
  if (titleMatch) {
    return titleMatch[1];
  }

  // 方法2：从页面元素提取
  const stockNameElement = document.querySelector('.stock-name, .name, [class*="stockName"]');
  if (stockNameElement) {
    return stockNameElement.textContent.trim();
  }

  // 方法3：从h1或特定容器提取
  const h1Element = document.querySelector('h1');
  if (h1Element) {
    const text = h1Element.textContent.trim();
    const h1Match = text.match(/^(.+?)\s*\(/);
    if (h1Match) {
      return h1Match[1];
    }
  }

  return '未知股票';
}

// 获取股票信息
function getStockInfo() {
  return {
    code: extractStockCode(),
    name: extractStockName(),
    url: window.location.href
  };
}

// 监听来自 background 或 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStockInfo') {
    const info = getStockInfo();
    sendResponse(info);
  }
  return true;
});

// 初始化时记录股票信息（用于调试）
console.log('股票分析助手已加载，当前股票:', getStockInfo());
