  let score = 0;
  let completedLines = new Set();
  const totalLines = 3;
  let isDrawing = false;
  let currentLineIndex = -1;

  const lineData = [
    { startY: 50, endY: 50, lineIndex: 0 },
    { startY: 150, endY: 150, lineIndex: 1 },
    { startY: 250, endY: 250, lineIndex: 2 }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Tracing game initialized...');

    const canvas = document.getElementById('traceCanvas');
    const container = document.querySelector('.canvas-container');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = container.offsetWidth;
    canvas.height = 400;

    // Draw dashed lines
    drawDashedLines(ctx, canvas);

    // Mouse events
    canvas.addEventListener('mousedown', (e) => startTracing(e, canvas, ctx));
    canvas.addEventListener('mousemove', (e) => trace(e, canvas, ctx));
    canvas.addEventListener('mouseup', () => stopTracing());
    canvas.addEventListener('mouseleave', () => stopTracing());

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      startTracing(mouseEvent, canvas, ctx);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      trace(mouseEvent, canvas, ctx);
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopTracing();
    });
  });

  function drawDashedLines(ctx, canvas) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);

    lineData.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(0, line.startY);
      ctx.lineTo(canvas.width * 0.85, line.endY);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  function startTracing(e, canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Find which line user is starting from
    currentLineIndex = findNearestLine(y);

    if (currentLineIndex === -1 || completedLines.has(currentLineIndex)) {
      return;
    }

    isDrawing = true;
    const x = e.clientX - rect.left;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function trace(e, canvas, ctx) {
    if (!isDrawing || currentLineIndex === -1) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopTracing() {
    if (!isDrawing || currentLineIndex === -1) {
      isDrawing = false;
      return;
    }

    isDrawing = false;

    // Check if user traced along the line
    const tolerance = 30; // pixels tolerance
    const lineY = lineData[currentLineIndex].startY;

    const canvas = document.getElementById('traceCanvas');
    const rect = canvas.getBoundingClientRect();
    
    // Simple check: did user draw roughly along the line?
    // For now, we'll mark it as complete
    completedLines.add(currentLineIndex);
    
    showFeedback('✅ Betul!', 'correct');
    score += 10;
    document.getElementById('score').textContent = score;

    // Mark animal as completed
    document.querySelectorAll('.animal-item').forEach(item => {
      if (parseInt(item.getAttribute('data-line')) === currentLineIndex) {
        item.classList.add('completed');
      }
    });

    // Check if all lines completed
    if (completedLines.size === totalLines) {
      setTimeout(showCompletion, 500);
    }

    currentLineIndex = -1;
  }

  function findNearestLine(y) {
    let nearestIndex = -1;
    let minDistance = 50;

    lineData.forEach(line => {
      const distance = Math.abs(line.startY - y);
      if (distance < minDistance && !completedLines.has(line.lineIndex)) {
        minDistance = distance;
        nearestIndex = line.lineIndex;
      }
    });

    return nearestIndex;
  }

  function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${type}`;
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 1500);
  }

  function showCompletion() {
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
      <div class="completion-content">
        <h2>🎉 Tahniah! 🎉</h2>
        <p>Anda telah berjaya!</p>
        <p>Skor: ${score}</p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Initialize Header
  initializeHeader('../../../../homepage/header.html');