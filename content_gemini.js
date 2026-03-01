// 股票分析助手 - Gemini 平台内容脚本

(function() {
    // 检查并执行分析任务
    function trySubmitGemini() {
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

            // Gemini 的输入框选择器（多种可能）
            const selectors = [
                'div[role="textbox"]',
                '.ql-editor',
                'div[contenteditable="true"]',
                'rich-textarea',
                'textarea'
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
                
                // 聚焦并填入文字
                textarea.focus();
                
                // 使用 execCommand 以触发框架的状态更新
                document.execCommand('insertText', false, prompt);
                
                // 触发输入事件
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));

                // 尝试点击发送按钮
                setTimeout(() => {
                    tryClickSendButton();
                }, 800);
            } else {
                // 如果页面还没加载好，1秒后重试
                setTimeout(trySubmitGemini, 1000);
            }
        });
    }
    
    // 尝试点击发送按钮
    function tryClickSendButton() {
        // Gemini 的发送按钮可能的选择器
        const sendBtnSelectors = [
            'button[aria-label*="Send"]',
            'button[aria-label*="发送"]',
            'button[aria-label*="Submit"]',
            'button[type="submit"]'
        ];
        
        for (const selector of sendBtnSelectors) {
            const btn = document.querySelector(selector);
            if (btn && !btn.disabled && isElementVisible(btn)) {
                btn.click();
                showToast('已自动发送分析请求');
                return;
            }
        }
        
        // 尝试通过按钮内容查找
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
            const text = (btn.textContent || '').toLowerCase();
            if ((ariaLabel.includes('send') || ariaLabel.includes('发送') || 
                 text.includes('send') || text.includes('发送')) && 
                !btn.disabled && isElementVisible(btn)) {
                btn.click();
                showToast('已自动发送分析请求');
                return;
            }
        }
        
        showToast('请在输入框中按 Enter 发送');
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
            background: #1a73e8;
            color: white;
            border-radius: 8px;
            font-family: 'Google Sans', Roboto, sans-serif;
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
    trySubmitGemini();
    
    // 监听页面导航变化（SPA路由变化）
    let lastUrl = location.href;
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(trySubmitGemini, 500);
        }
    }).observe(document, { subtree: true, childList: true });
})();
