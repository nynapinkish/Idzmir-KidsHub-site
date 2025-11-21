document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Game loaded!');
    
    const items = document.querySelectorAll('.item-card');
    let currentScore = 0;
    const usedItems = new Set();
    
    console.log('✅ Found items:', items.length);
    
    // Setup drag for each item
    items.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            console.log('🎯 Dragging:', this.dataset.shape);
            
            e.dataTransfer.setData('shape', this.dataset.shape);
            e.dataTransfer.setData('itemId', this.dataset.shape);
            
            const img = this.querySelector('img');
            e.dataTransfer.setData('src', img.src);
            
            this.style.opacity = '0.5';
        });
        
        item.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
        });
    });
    
    // Allow drop
    document.body.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    // Handle drop
    document.body.addEventListener('drop', function(e) {
        e.preventDefault();
        
        const shape = e.dataTransfer.getData('shape');
        const src = e.dataTransfer.getData('src');
        const itemId = e.dataTransfer.getData('itemId');
        
        console.log('💥 Dropped:', shape, 'at X=' + e.clientX + ' Y=' + e.clientY);
        
        if (usedItems.has(itemId)) {
            alert('Item ini sudah digunakan!');
            return;
        }
        
        const droppedZone = checkZone(e.clientX, e.clientY, shape);
        
        if (droppedZone) {
            console.log('✅ CORRECT! Zone found for:', shape);
            
            // Create dropped item
            const dropped = document.createElement('img');
            dropped.src = src;
            dropped.classList.add('dropped-item');
            dropped.style.position = 'absolute';
            dropped.style.left = `${droppedZone.x}px`;
            dropped.style.top = `${droppedZone.y}px`;
            dropped.style.width = `${droppedZone.width}px`;
            dropped.style.height = `${droppedZone.height}px`;
            dropped.style.zIndex = '50';
            dropped.style.pointerEvents = 'none';
            dropped.style.objectFit = 'contain';
            
            document.body.appendChild(dropped);
            
            usedItems.add(itemId);
            
            // Disable used item
            const usedItem = document.querySelector(`.item-card[data-shape="${itemId}"]`);
            if (usedItem) {
                usedItem.style.opacity = '0.3';
                usedItem.style.filter = 'grayscale(100%)';
                usedItem.draggable = false;
            }
            
            addSparkles(dropped);
            
            // Update score
            currentScore += 10;
            const scoreText = document.getElementById('scoreText');
            if (scoreText) {
                scoreText.textContent = currentScore;
            }
            
            // Check complete
            if (usedItems.size === items.length) {
                setTimeout(() => showCompletionMessage(), 800);
            }
            
        } else {
            console.log('❌ WRONG! Shape:', shape, 'not matching any zone');
            alert('Ops! Letakkan pada tempat yang betul!');
        }
    });
    
function checkZone(x, y, shape) {
    const zones = {
        'window': { 
            x: -157, y: 152, 
            width: 660, height: 540,
            minX: 50, maxX: 270,
            minY: 270, maxY: 490
        },
        'frame': { 
            x: 565, y: 195, 
            width: 250, height: 350,
            minX: 520, maxX: 670,
            minY: 300, maxY: 430
        },
        'triangle': { 
            x: 720, y: 260, 
            width: 250, height: 350,
            minX: 690, maxX: 880,
            minY: 260, maxY: 430
        },
        'star': { 
            x: 740, y: 520, 
            width: 200, height: 200,
            minX: 700, maxX: 880,
            minY: 480, maxY: 650
        },
        'carpet': { 
            x: 370, y: 660, 
            width: 400, height: 150,
            minX: 300, maxX: 640,
            minY: 620, maxY: 740
        }
    };
        
        const zone = zones[shape.toLowerCase()];
        
        if (!zone) {
            console.log('⚠️ No zone defined for:', shape);
            return null;
        }
        
        // Check with boundaries
        if (x >= zone.minX && x <= zone.maxX && 
            y >= zone.minY && y <= zone.maxY) {
            console.log('✅ Match found!', shape, 'zone');
            return zone;
        }
        
        console.log('❌ Outside bounds for', shape);
        console.log('   Current:', x, y);
        console.log('   Need X:', zone.minX, '-', zone.maxX);
        console.log('   Need Y:', zone.minY, '-', zone.maxY);
        return null;
    }
    
    function addSparkles(element) {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.innerHTML = '✨';
                sparkle.style.position = 'absolute';
                sparkle.style.left = `${Math.random() * 100}%`;
                sparkle.style.top = `${Math.random() * 100}%`;
                sparkle.style.fontSize = '30px';
                sparkle.style.animation = 'sparkleUp 1s ease-out forwards';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '100';
                
                element.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1000);
            }, i * 100);
        }
    }
    
    function showCompletionMessage() {
        const message = document.createElement('div');
        message.style.position = 'fixed';
        message.style.top = '0';
        message.style.left = '0';
        message.style.width = '100%';
        message.style.height = '100%';
        message.style.background = 'rgba(0, 0, 0, 0.85)';
        message.style.display = 'flex';
        message.style.alignItems = 'center';
        message.style.justifyContent = 'center';
        message.style.zIndex = '9999';
        
        message.innerHTML = `
            <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 60px; border-radius: 30px; text-align: center; border: 5px solid #003E8D;">
                <h2 style="font-size: 52px; color: #003E8D; margin-bottom: 20px; font-family: 'Poppins', sans-serif;">🎉 Tahniah! 🎉</h2>
                <p style="font-size: 26px; color: #003E8D; margin: 10px 0; font-family: 'Poppins', sans-serif; font-weight: 600;">Anda berjaya menyiapkan bilik tamu!</p>
                <p style="font-size: 28px; color: #003E8D; margin: 15px 0; font-family: 'Poppins', sans-serif; font-weight: 700;">Skor: ${currentScore}</p>
                <button onclick="location.reload()" style="margin-top: 30px; padding: 18px 45px; font-size: 22px; background: #003E8D; color: #FFD700; border: none; border-radius: 18px; cursor: pointer; font-weight: 800; font-family: 'Poppins', sans-serif; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">Main Lagi</button>
            </div>
        `;
        
        document.body.appendChild(message);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleUp {
            0% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
            100% { opacity: 0; transform: translateY(-60px) scale(0.3) rotate(360deg); }
        }
        
        .dropped-item {
            animation: popIn 0.5s ease-out;
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.7));
        }
        
        @keyframes popIn {
            0% { transform: scale(0.3); opacity: 0; }
            60% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});

// DEBUG - Click to get coordinates
document.addEventListener('click', function(e) {
    console.log(`📍 Clicked at X=${e.clientX}, Y=${e.clientY}`);
});