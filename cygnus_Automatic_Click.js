// ==UserScript==
// @name         cygnus Automatic Click 
// @namespace    https://i.cygnus.finance/*
// @version      2025-03-19
// @description  dandan
// @author       dandan
// @match        https://i.cygnus.finance/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

// 自动点击器 - 持久化版本
(function() {
    // 检查是否已经存在模拟器
    if (!window.clickerInitialized) {
        // 标记已初始化
        window.clickerInitialized = true;

        // 将完整代码保存到localStorage，用于页面刷新后恢复
        const fullScript = function() {
            // 游戏区域查找函数
            function getGameArea() {
                // 方法1：通过背景图查找
                const gameAreas = Array.from(document.querySelectorAll('*')).filter(el => {
                    try {
                        const style = window.getComputedStyle(el);
                        return style.backgroundImage.includes('play-bg.png');
                    } catch (e) {
                        return false;
                    }
                });
                if (gameAreas.length > 0) return gameAreas[0];

                // 方法2：通过尺寸和margin特征查找
                const gameArea = document.querySelector('div[class*="mt-[10px]"][class*="w-[345px]"][class*="h-[487px]"]');
                if (gameArea) return gameArea;

                // 方法3：如果上述方法都失败，返回页面中心坐标
                return {
                    getBoundingClientRect: () => ({
                        left: (window.innerWidth - 345) / 2,
                        top: (window.innerHeight - 487) / 2,
                        width: 345,
                        height: 487
                    })
                };
            }

            // 点击模拟器创建函数
            function createClickSimulator() {
                // 创建红点元素
                const dot = document.createElement('div');
                dot.style.cssText = `
                    position: fixed;
                    width: 5px;
                    height: 5px;
                    background-color: red;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    transition: opacity 0.3s;
                `;
                document.body.appendChild(dot);

                let isRunning = false;
                let intervalId = null;

                // 从localStorage恢复设置
                const savedInterval = localStorage.getItem('autoClickerInterval') || '1000';
                const savedState = localStorage.getItem('autoClickerRunning') === 'true';
                const savedPosition = JSON.parse(localStorage.getItem('autoClickerPosition') || '{"top":"20px","right":"20px"}');

                function simulateClick(x, y) {
                    // 显示红点
                    dot.style.left = x + 'px';
                    dot.style.top = y + 'px';
                    dot.style.opacity = '1';

                    // 创建事件序列
                    const events = ['pointerdown', 'mousedown', 'mouseup', 'click'].map(eventType =>
                        new MouseEvent(eventType, {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            button: 0,
                            buttons: 1,
                            clientX: x,
                            clientY: y,
                            screenX: x,
                            screenY: y,
                            detail: 1
                        })
                    );

                    // 触发事件序列
                    setTimeout(() => {
                        const element = document.elementFromPoint(x, y);
                        if (element && !controlPanel.contains(element)) {
                            events.forEach((event, index) => {
                                setTimeout(() => {
                                    element.dispatchEvent(event);
                                }, index * 10);
                            });
                        }
                        setTimeout(() => {
                            dot.style.opacity = '0';
                        }, 50);
                    }, 200);
                }

                // 获取游戏区域中心点
                function updateGameArea() {
                    const gameArea = getGameArea();
                    const rect = gameArea.getBoundingClientRect();
                    return {
                        centerX: rect.left + rect.width / 2,
                        centerY: rect.top + rect.height / 2
                    };
                }

                // 创建模拟器对象
                const simulator = {
                    start: function(interval = 1000) {
                        if (isRunning) return;
                        isRunning = true;

                        // 保存状态到localStorage
                        localStorage.setItem('autoClickerRunning', 'true');
                        localStorage.setItem('autoClickerInterval', interval.toString());

                        intervalId = setInterval(() => {
                            try {
                                const {centerX, centerY} = updateGameArea(); // 每次点击前更新位置
                                const randomX = centerX + (Math.random() * 60 - 30);
                                const randomY = centerY + (Math.random() * 60 - 30);
                                simulateClick(randomX, randomY);
                            } catch (e) {
                                console.error('点击过程中出错:', e);
                            }
                        }, interval);
                    },

                    stop: function() {
                        if (!isRunning) return;
                        clearInterval(intervalId);
                        intervalId = null;
                        isRunning = false;
                        dot.style.opacity = '0';

                        // 保存状态到localStorage
                        localStorage.setItem('autoClickerRunning', 'false');
                    }
                };

                // 创建迷你控制面板
                const controlPanel = document.createElement('div');
                controlPanel.id = 'auto-clicker-panel'; // 添加ID便于查找
                controlPanel.style.cssText = `
                    position: fixed;
                    top: ${savedPosition.top || '20px'};
                    left: ${savedPosition.left || 'auto'};
                    right: ${!savedPosition.left ? (savedPosition.right || '20px') : 'auto'};
                    background: rgba(0, 0, 0, 0.8);
                    padding: 8px;
                    border-radius: 8px;
                    display: flex;
                    gap: 6px;
                    z-index: 10001;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                    cursor: move;
                    user-select: none;
                `;

                // 创建输入框
                const intervalInput = document.createElement('input');
                intervalInput.type = 'number';
                intervalInput.min = '100';
                intervalInput.value = savedInterval;
                intervalInput.style.cssText = `
                    width: 60px;
                    padding: 2px 4px;
                    border: 1px solid #666;
                    border-radius: 3px;
                    background: #333;
                    color: white;
                    text-align: center;
                    font-size: 12px;
                `;

                // 创建开始/停止按钮
                const toggleButton = document.createElement('button');
                toggleButton.textContent = savedState ? '停止' : '开始';
                toggleButton.style.cssText = `
                    padding: 2px 8px;
                    border: none;
                    border-radius: 3px;
                    background: ${savedState ? '#f44336' : '#4CAF50'};
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 12px;
                `;

                // 创建文本标签
                const label = document.createElement('span');
                label.textContent = 'ms';
                label.style.cssText = `
                    color: white;
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                `;

                // 拖动相关变量和函数
                let isDragging = false;
                let startPos = { x: 0, y: 0 };

                controlPanel.onmousedown = (e) => {
                    if (e.target === controlPanel) {
                        isDragging = true;
                        startPos = {
                            x: e.clientX - controlPanel.offsetLeft,
                            y: e.clientY - controlPanel.offsetTop
                        };
                        e.preventDefault();
                    }
                };

                document.onmousemove = (e) => {
                    if (isDragging) {
                        const left = e.clientX - startPos.x;
                        const top = e.clientY - startPos.y;

                        controlPanel.style.left = left + 'px';
                        controlPanel.style.top = top + 'px';
                        controlPanel.style.right = 'auto';

                        // 保存位置到localStorage
                        localStorage.setItem('autoClickerPosition', JSON.stringify({
                            top: top + 'px',
                            left: left + 'px'
                        }));
                    }
                };

                document.onmouseup = () => {
                    isDragging = false;
                };

                // 阻止输入框和按钮的鼠标事件传播
                intervalInput.onmousedown = (e) => e.stopPropagation();
                toggleButton.onmousedown = (e) => e.stopPropagation();

                // 按钮点击事件
                toggleButton.onclick = (e) => {
                    e.stopPropagation();
                    if (!isRunning) {
                        const interval = parseInt(intervalInput.value);
                        if (interval < 100) {
                            alert('间隔时间不能小于100ms');
                            return;
                        }
                        simulator.start(interval);
                        toggleButton.textContent = '停止';
                        toggleButton.style.background = '#f44336';
                    } else {
                        simulator.stop();
                        toggleButton.textContent = '开始';
                        toggleButton.style.background = '#4CAF50';
                    }
                };

                // 组装控制面板
                controlPanel.appendChild(intervalInput);
                controlPanel.appendChild(label);
                controlPanel.appendChild(toggleButton);
                document.body.appendChild(controlPanel);

                // 如果之前是运行状态，自动启动
                if (savedState) {
                    simulator.start(parseInt(savedInterval));
                }

                return simulator;
            }

            // 创建点击模拟器实例
            const clicker = createClickSimulator();

            // 监听页面加载完成事件
            if (document.readyState === 'complete') {
                initAutoReloader();
            } else {
                window.addEventListener('load', initAutoReloader);
            }

            // 初始化自动重载功能
            function initAutoReloader() {
                // 检测Vercel安全验证
                const detectVercelChallenge = () => {
                    // 查找Vercel验证脚本
                    const vercelScript = document.querySelector('script[src*="vercel/security"]');
                    if (vercelScript) {
                        console.log('检测到Vercel安全验证，等待验证完成...');
                        // 验证完成后会刷新页面，我们的脚本会通过localStorage自动恢复
                    }
                };

                // 检查页面是否需要重新加载脚本
                const checkAndReload = () => {
                    // 检测Vercel验证
                    detectVercelChallenge();

                    // 如果模拟器不存在或被移除，重新创建
                    const panel = document.getElementById('auto-clicker-panel');
                    if (!panel || !document.body.contains(panel)) {
                        console.log('检测到模拟器被移除，重新创建...');
                        window.clickerInitialized = false;

                        // 从localStorage获取脚本并执行
                        const savedScript = localStorage.getItem('autoClickerScript');
                        if (savedScript) {
                            try {
                                eval(savedScript);
                            } catch (e) {
                                console.error('恢复脚本时出错:', e);
                            }
                        }
                    }
                };

                // 每3秒检查一次
                setInterval(checkAndReload, 3000);
            }
        };

        // 保存脚本到localStorage
        localStorage.setItem('autoClickerScript', `(${fullScript.toString()})();`);

        // 执行脚本
        fullScript();
    }
})();
