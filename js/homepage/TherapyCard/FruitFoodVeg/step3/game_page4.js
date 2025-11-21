const canvases = [];

// PENTING: Wrap dalam DOMContentLoaded agar canvas siap!
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Canvas game initializing...');
  
  // Initialize all canvases
  for (let i = 1; i <= 24; i++) {
    const canvas = document.getElementById(`canvas${i}`);
    if (!canvas) {
      console.warn(`⚠️ canvas${i} not found`);
      continue; // Safety check
    }
    
    const ctx = canvas.getContext('2d');
    
    let shapeType;
    if (i <= 8) shapeType = 'parallelogram';
    else if (i <= 16) shapeType = 'circle';
    else shapeType = 'triangle';
    
    const canvasObj = {
      canvas,
      ctx,
      shapeType,
      isDrawing: false
    };
    
    canvases.push(canvasObj);

    // Draw dashed outline
    drawDashedOutline(ctx, shapeType, canvas.width, canvas.height);

    // Add event listeners
    addDrawingListeners(canvasObj);
    
    console.log(`✅ canvas${i} (${shapeType}) initialized`);
  }
  
  console.log(`✅ Total ${canvases.length} canvases ready!`);
});

function drawDashedOutline(ctx, shapeType, width, height) {
  ctx.strokeStyle = '#000000'; // Hitam untuk outline
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  if (shapeType === 'parallelogram') {
    // Segi empat selari (parallelogram) - EXTRA BESAR
    const offset = 25; // Slant amount
    ctx.beginPath();
    ctx.moveTo(2 + offset, 2);              // Top left
    ctx.lineTo(width - 2, 2);               // Top right
    ctx.lineTo(width - 2 - offset, height - 2); // Bottom right
    ctx.lineTo(2, height - 2);              // Bottom left
    ctx.closePath();
    ctx.stroke();
  } else if (shapeType === 'circle') {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, (width / 2) - 2, 0, Math.PI * 2); // Extra besar
    ctx.stroke();
  } else if (shapeType === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(width / 2, 2);               // Top
    ctx.lineTo(width - 2, height - 2);      // Bottom right
    ctx.lineTo(2, height - 2);              // Bottom left
    ctx.closePath();
    ctx.stroke();
  }

  ctx.setLineDash([]); // Reset line dash
}

function addDrawingListeners(canvasObj) {
  const { canvas } = canvasObj;

  // Mouse events
  canvas.addEventListener('mousedown', (e) => startDrawing(e, canvasObj));
  canvas.addEventListener('mousemove', (e) => draw(e, canvasObj));
  canvas.addEventListener('mouseup', () => stopDrawing(canvasObj));
  canvas.addEventListener('mouseleave', () => stopDrawing(canvasObj));

  // Touch events untuk mobile
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    startDrawing(mouseEvent, canvasObj);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    draw(mouseEvent, canvasObj);
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing(canvasObj);
  });
}

function startDrawing(e, canvasObj) {
  canvasObj.isDrawing = true;
  const rect = canvasObj.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  canvasObj.ctx.beginPath();
  canvasObj.ctx.moveTo(x, y);
  canvasObj.ctx.strokeStyle = '#FF0000'; // Merah untuk garisan user
  canvasObj.ctx.lineWidth = 5; // Lebih tebal lagi
  canvasObj.ctx.lineCap = 'round';
  canvasObj.ctx.lineJoin = 'round';
}

function draw(e, canvasObj) {
  if (!canvasObj.isDrawing) return;

  const rect = canvasObj.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  canvasObj.ctx.lineTo(x, y);
  canvasObj.ctx.stroke();
}

function stopDrawing(canvasObj) {
  canvasObj.isDrawing = false;
}