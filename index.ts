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

// Execute example
const example = await import('./src/index.ts');

// Create glassmorphic controls
function createGlassmorphicControls() {
  const controls = (example as any).controls;
  
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
  lightSlider.min = String(controls['Light dir'].min);
  lightSlider.max = String(controls['Light dir'].max);
  lightSlider.step = String(controls['Light dir'].step);
  lightSlider.value = String(controls['Light dir'].initial);
  
  lightSlider.addEventListener('input', () => {
    controls['Light dir'].onSliderChange(Number.parseFloat(lightSlider.value));
  });
  
  lightGroup.appendChild(lightLabel);
  lightGroup.appendChild(lightSlider);
  controlsContainer.appendChild(lightGroup);
  
  // Initialize light direction
  controls['Light dir'].onSliderChange(Number.parseFloat(lightSlider.value));
  
  // Jelly Color Control
  const colorGroup = document.createElement('div');
  colorGroup.className = 'control-group glass-panel';
  
  const colorLabel = document.createElement('div');
  colorLabel.className = 'control-label';
  colorLabel.textContent = 'Jelly Color';
  
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.className = 'glass-color';
  colorInput.value = rgbToHex(controls['Jelly Color'].initial);
  
  colorInput.addEventListener('input', () => {
    controls['Jelly Color'].onColorChange(hexToRgb(colorInput.value));
  });
  
  colorGroup.appendChild(colorLabel);
  colorGroup.appendChild(colorInput);
  controlsContainer.appendChild(colorGroup);
  
  // Initialize color
  controls['Jelly Color'].onColorChange(controls['Jelly Color'].initial);
  
  // Blur Control
  const blurGroup = document.createElement('div');
  blurGroup.className = 'control-group glass-panel';
  
  const blurContainer = document.createElement('div');
  blurContainer.className = 'toggle-container';
  
  const blurLabel = document.createElement('div');
  blurLabel.className = 'control-label';
  blurLabel.textContent = 'Blur Effect';
  
  const toggleLabel = document.createElement('div');
  toggleLabel.className = 'toggle-label';
  toggleLabel.textContent = 'Off';
  
  const blurToggle = document.createElement('div');
  blurToggle.className = 'glass-toggle';
  if (controls['Blur'].initial) {
    blurToggle.classList.add('active');
    toggleLabel.textContent = 'On';
  }
  
  blurToggle.addEventListener('click', () => {
    const isActive = blurToggle.classList.contains('active');
    if (isActive) {
      blurToggle.classList.remove('active');
      toggleLabel.textContent = 'Off';
      controls['Blur'].onToggleChange(false);
    } else {
      blurToggle.classList.add('active');
      toggleLabel.textContent = 'On';
      controls['Blur'].onToggleChange(true);
    }
  });
  
  blurGroup.appendChild(blurLabel);
  blurContainer.appendChild(toggleLabel);
  blurContainer.appendChild(blurToggle);
  blurGroup.appendChild(blurContainer);
  controlsContainer.appendChild(blurGroup);
  
  // Initialize blur
  controls['Blur'].onToggleChange(controls['Blur'].initial);
}

createGlassmorphicControls();

// Control types (kept for reference but simplified since we're using direct implementation)

function hexToRgb(hex: string): readonly [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function componentToHex(c: number) {
  const hex = (c * 255).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex(rgb: readonly [number, number, number]) {
  return `#${rgb.map(componentToHex).join('')}`;
}
