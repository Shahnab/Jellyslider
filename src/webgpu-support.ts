interface BrowserInfo {
  name: string;
  version: string;
}

interface WebGPUInstructions {
  browser: string;
  instructions: string[];
}

export class WebGPUDetector {
  static detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent;
    
    // Chrome/Chromium
    if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
      const version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
      return { name: 'Chrome', version };
    }
    
    // Edge
    if (userAgent.includes('Edg/')) {
      const version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown';
      return { name: 'Edge', version };
    }
    
    // Firefox
    if (userAgent.includes('Firefox/')) {
      const version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
      return { name: 'Firefox', version };
    }
    
    // Safari
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      const version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
      return { name: 'Safari', version };
    }
    
    return { name: 'Unknown', version: 'unknown' };
  }

  static async checkWebGPUSupport(): Promise<{
    supported: boolean;
    adapter?: GPUAdapter | null;
    error?: string;
  }> {
    // Check if WebGPU is available in the browser
    if (!navigator.gpu) {
      return {
        supported: false,
        error: 'WebGPU is not supported in this browser'
      };
    }

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        return {
          supported: false,
          error: 'WebGPU adapter could not be requested'
        };
      }

      return {
        supported: true,
        adapter
      };
    } catch (error) {
      return {
        supported: false,
        error: `WebGPU initialization failed: ${error}`
      };
    }
  }

  static getInstructions(browserName: string): WebGPUInstructions {
    const instructions: { [key: string]: WebGPUInstructions } = {
      Chrome: {
        browser: 'Google Chrome',
        instructions: [
          '1. Open Chrome and go to chrome://flags',
          '2. Search for "Unsafe WebGPU"',
          '3. Enable the "Unsafe WebGPU" flag',
          '4. Restart Chrome',
          '5. Refresh this page',
          '',
          'Note: Chrome 113+ has WebGPU enabled by default on supported hardware.'
        ]
      },
      Edge: {
        browser: 'Microsoft Edge',
        instructions: [
          '1. Open Edge and go to edge://flags',
          '2. Search for "Unsafe WebGPU"',
          '3. Enable the "Unsafe WebGPU" flag',
          '4. Restart Edge',
          '5. Refresh this page',
          '',
          'Note: Edge 113+ has WebGPU enabled by default on supported hardware.'
        ]
      },
      Firefox: {
        browser: 'Mozilla Firefox',
        instructions: [
          '1. Open Firefox and go to about:config',
          '2. Accept the risk warning',
          '3. Search for "dom.webgpu.enabled"',
          '4. Set it to "true"',
          '5. Restart Firefox',
          '6. Refresh this page',
          '',
          'Note: WebGPU support in Firefox is experimental and may not work on all systems.'
        ]
      },
      Safari: {
        browser: 'Safari',
        instructions: [
          '1. Open Safari Preferences (Safari → Preferences)',
          '2. Go to the "Advanced" tab',
          '3. Check "Show Develop menu in menu bar"',
          '4. In the Develop menu, select "Experimental Features"',
          '5. Enable "WebGPU"',
          '6. Restart Safari',
          '7. Refresh this page',
          '',
          'Note: WebGPU is available in Safari 16.4+ on macOS 13.3+ and iOS 16.4+.'
        ]
      },
      Unknown: {
        browser: 'Your Browser',
        instructions: [
          'WebGPU support varies by browser. Please try one of the following:',
          '',
          '• Use Google Chrome 113+ or Microsoft Edge 113+',
          '• Use Safari 16.4+ on macOS 13.3+ or iOS 16.4+',
          '• Use Firefox with WebGPU experimental features enabled',
          '',
          'For the best experience, we recommend using Chrome or Edge with the latest version.'
        ]
      }
    };

    return instructions[browserName] || instructions.Unknown;
  }

  static createErrorUI(browserInfo: BrowserInfo, error: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'webgpu-error-container';
    
    const instructions = this.getInstructions(browserInfo.name);
    
    container.innerHTML = `
      <div class="webgpu-error-overlay">
        <div class="webgpu-error-modal glass-panel">
          <div class="webgpu-error-header">
            <div class="webgpu-error-icon">⚠️</div>
            <h2>WebGPU Not Available</h2>
            <p class="webgpu-error-message">${error}</p>
          </div>
          
          <div class="webgpu-error-content">
            <div class="browser-info">
              <h3>Detected Browser: ${instructions.browser} ${browserInfo.version}</h3>
            </div>
            
            <div class="instructions">
              <h4>How to enable WebGPU in ${instructions.browser}:</h4>
              <ol class="instruction-list">
                ${instructions.instructions.map(instruction => 
                  instruction.trim() === '' 
                    ? '<li class="instruction-spacer"></li>' 
                    : `<li>${instruction}</li>`
                ).join('')}
              </ol>
            </div>
            
            <div class="webgpu-error-actions">
              <button onclick="location.reload()" class="retry-button">
                🔄 Try Again
              </button>
              <a href="https://caniuse.com/webgpu" target="_blank" class="learn-more-button">
                📚 Learn More About WebGPU Support
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return container;
  }
}