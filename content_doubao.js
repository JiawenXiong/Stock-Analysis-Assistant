// 股票分析助手 - 豆包平台内容脚本

(function() {
    // 检查并执行分析任务
    function trySubmitDoubao() {
        chrome.storage.local.get(['pendingStockAnalysis', 'analysisTimestamp'], (result) => {
            const prompt = result.pendingStockAnalysis;
            if (!prompt) return;
            
            // 检查时间戳（5分钟内有效）
            const timestamp = result.analysisTimestamp || 0;
            const now = Date.now();
            if (now - timestamp > 5 * 60 * 1000) {
                chrome.storage.local.remove(['pendingStockAnalysis', 'analysisTimestamp']);
                return;
            }

            // 豆包的输入框选择器（多种可能）
            const selectors = [
                'textarea',
                'div[contenteditable="true"]',
                'div[role="textbox"]',
                '[data-testid="chat-input"]',
                '.input-area textarea'
            ];
            
            let textarea = null;
            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el && isElementVisible(el)) {
                    textarea = el;
                    break;
                }
            }
            
            if (textarea) {
                // 清除存储中的任务
                chrome.storage.local.remove(['pendingStockAnalysis', 'analysisTimestamp']);

                textarea.focus();
                // 使用 execCommand 以触发框架的状态更新
                document.execCommand('insertText', false, prompt);
                
                // 触发输入事件
                textarea.dispatchEvent(new Event('input', { bubbles: true }));

                // 模拟按回车键发送
                setTimeout(() => {
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    textarea.dispatchEvent(enterEvent);
                    showToast('已自动发送分析请求');
                }, 800);
            } else {
                // 如果页面还没加载好，1秒后重试
                setTimeout(trySubmitDoubao, 1000);
            }
        });
    }
    
    // 检查元素是否可见
    function isElementVisible(element) {
        return element && element.offsetWidth > 0 && element.offsetHeight > 0;
    }
    
    // 显示Toast提示
    function showToast(message) {
        const existingToast = document.getElementById('stock-analysis-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'stock-analysis-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: #00d4aa;
            color: white;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            z-index: 1000000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 初次加载时尝试
    trySubmitDoubao();
    
    // 监听页面导航变化（SPA路由变化）
    let lastUrl = location.href;
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(trySubmitDoubao, 500);
        }
    }).observe(document, { subtree: true, childList: true });
})();
