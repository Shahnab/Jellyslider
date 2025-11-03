import { WebGPUDetector } from './src/webgpu-support.ts';

async function setupUI() {
  const body = document.querySelector('body') as HTMLBodyElement;
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.alignItems = 'center';
  body.style.height = '100vh';
  body.style.gap = '1.5rem';
  body.style.margin = '0';
  body.style.boxSizing = 'border-box';
  body.style.padding = '1rem';

  // Resize canvases
  for (const canvas of document.querySelectorAll('canvas')) {
    if ('width' in canvas.attributes || 'height' in canvas.attributes) {
      continue; // custom canvas, not replacing with resizable
    }

    const container = document.createElement('div');
    const frame = document.createElement('div');

    canvas.parentElement?.replaceChild(container, canvas);

    frame.appendChild(canvas);
    container.appendChild(frame);

    container.style.display = 'flex';
    container.style.flex = '1';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'top';
    container.style.width = '100%';

    container.style.containerType = 'size';

    frame.style.position = 'relative';

    if (canvas.dataset.fitToContainer !== undefined) {
      frame.style.width = '100%';
      frame.style.height = '100%';
    } else {
      const aspectRatio = canvas.dataset.aspectRatio ?? '1';
      frame.style.aspectRatio = aspectRatio;
      frame.style.height =
        `min(calc(min(100cqw, 100cqh)/(${aspectRatio})), min(100cqw, 100cqh))`;
    }

    canvas.style.position = 'absolute';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const onResize = () => {
      canvas.width = frame.clientWidth * window.devicePixelRatio;
      canvas.height = frame.clientHeight * window.devicePixelRatio;
    };

    onResize();
    new ResizeObserver(onResize).observe(container);
  }

  // Create glassmorphic controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  body.appendChild(controlsContainer);
}

function createControlsUI(controls: any) {
  const controlsContainer = document.querySelector('.controls-container') as HTMLElement;
  
  // Quality Control
  const qualityGroup = document.createElement('div');
  qualityGroup.className = 'control-group glass-panel';
  
  const qualityLabel = document.createElement('div');
  qualityLabel.className = 'control-label';
  qualityLabel.textContent = 'Quality';
  
  const qualitySelect = document.createElement('select');
  qualitySelect.className = 'glass-select';
  qualitySelect.innerHTML = controls['Quality'].options
    .map((option: string) => `<option value="${option}">${option}</option>`)
    .join('');
  qualitySelect.value = controls['Quality'].initial;
  
  qualitySelect.addEventListener('change', () => {
    controls['Quality'].onSelectChange(qualitySelect.value);
  });
  
  qualityGroup.appendChild(qualityLabel);
  qualityGroup.appendChild(qualitySelect);
  controlsContainer.appendChild(qualityGroup);
  
  // Initialize quality
  controls['Quality'].onSelectChange(qualitySelect.value);
  
  // Light Direction Control
  const lightGroup = document.createElement('div');
  lightGroup.className = 'control-group glass-panel';
  
  const lightLabel = document.createElement('div');
  lightLabel.className = 'control-label';
  lightLabel.textContent = 'Light Direction';
  
  const lightSlider = document.createElement('input');
  lightSlider.type = 'range';
  lightSlider.className = 'glass-slider';
  lightSlider.min = '0';
  lightSlider.max = '1';
  lightSlider.step = '0.01';
  lightSlider.value = controls['Light dir'].initial.toString();
  
  lightSlider.addEventListener('input', () => {
    controls['Light dir'].onSliderChange(parseFloat(lightSlider.value));
  });
  
  lightGroup.appendChild(lightLabel);
  lightGroup.appendChild(lightSlider);
  controlsContainer.appendChild(lightGroup);
  
  // Jelly Color Control
  const colorGroup = document.createElement('div');
  colorGroup.className = 'control-group glass-panel';
  
  const colorLabel = document.createElement('div');
  colorLabel.className = 'control-label';
  colorLabel.textContent = 'Jelly Color';
  
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.className = 'glass-color';
  const [r, g, b] = controls['Jelly Color'].initial;
  colorInput.value = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
  
  colorInput.addEventListener('input', () => {
    const hex = colorInput.value;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    controls['Jelly Color'].onColorChange([r, g, b]);
  });
  
  colorGroup.appendChild(colorLabel);
  colorGroup.appendChild(colorInput);
  controlsContainer.appendChild(colorGroup);
  
  // Blur Control
  const blurGroup = document.createElement('div');
  blurGroup.className = 'control-group glass-panel';
  
  const blurLabel = document.createElement('div');
  blurLabel.className = 'control-label';
  blurLabel.textContent = 'Blur';
  
  const blurCheckbox = document.createElement('input');
  blurCheckbox.type = 'checkbox';
  blurCheckbox.className = 'glass-checkbox';
  blurCheckbox.checked = controls['Blur'].initial;
  
  blurCheckbox.addEventListener('change', () => {
    controls['Blur'].onToggleChange(blurCheckbox.checked);
  });
  
  blurGroup.appendChild(blurLabel);
  blurGroup.appendChild(blurCheckbox);
  controlsContainer.appendChild(blurGroup);
}

async function initializeApp() {
  // Detect browser
  const browserInfo = WebGPUDetector.detectBrowser();
  console.log(`Detected browser: ${browserInfo.name} ${browserInfo.version}`);

  // Check WebGPU support
  const webgpuSupport = await WebGPUDetector.checkWebGPUSupport();
  
  if (!webgpuSupport.supported) {
    // Show error UI with browser-specific instructions
    const errorUI = WebGPUDetector.createErrorUI(browserInfo, webgpuSupport.error!);
    document.body.appendChild(errorUI);
    
    // Hide the canvas since WebGPU is not available
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.display = 'none';
    }
    
    console.error('WebGPU initialization failed:', webgpuSupport.error);
    return;
  }

  console.log('WebGPU is supported! Initializing application...');
  
  // Import and initialize the main application
  try {
    // Setup body styles and canvas container
    await setupUI();
    
    // Initialize the main application
    const { initJellySlider } = await import('./src/index.ts');
    const { controls } = await initJellySlider();
    
    // Create controls UI
    createControlsUI(controls);
  } catch (error) {
    console.error('Failed to initialize Jelly Slider:', error);
    
    // Show a generic error if the app fails to load after WebGPU check passes
    const errorUI = WebGPUDetector.createErrorUI(browserInfo, `Application failed to initialize: ${error}`);
    document.body.appendChild(errorUI);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}