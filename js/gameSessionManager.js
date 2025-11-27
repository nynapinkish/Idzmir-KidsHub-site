// ===============================================
// IDZMIR KIDS HUB - GAME SESSION MANAGER (UPDATED)
// With Relational Concepts Added
// ===============================================

const db = firebase.firestore();

// ================= CONCEPT CONFIGURATION =================
const CONCEPT_STRUCTURE = {
    'Spatial Concepts': {
        maxScore: 0,
        games: {
            'dalam_/_atas_/_bawah': 3,
            'atas_/_bawah': 2,
            'belakang_/_depan': 2,
            'antara_/_sekeliling': 2,
            'melalui_/_melepasi': 2,
            'naik_/_turun': 2,
            'dekat_/_jauh': 2,
            'dalam_/_luar': 2,
            'atas_/_bawah_/_tengah': 3
        }
    },
    'Relational Concepts': {
        maxScore: 0,
        games: {
            'same_/_different_/_apple': 4,           
            'same_/_different_/_carrot': 4,
            'same_/_different_/_grapes': 4,          
            'same_/_different_/_lemon': 4,          
            'same_/_different_/_tomato': 4,          
            'match_/_mismatch_/_cat': 2,        
            'match_/_mismatch_/_cow': 2,                  
            'match_/_mismatch_/_snake': 2, 
            'match_/_mismatch_/_dog': 2,                   
            'match_/_mismatch_/_spider': 2,
            'biggerThan_/_smallerThan_/_ball': 4,        
            'biggerThan_/_smallerThan_/_key': 4,                  
            'biggerThan_/_smallerThan_/_elephant': 4, 
            'biggerThan_/_smallerThan_/_chicken': 4,                   
            'biggerThan_/_smallerThan_/_klcc': 4,
            'biggerThan_/_smallerThan_/_tree': 4                                                                                          
        }
    },
    'Quantitative Concepts': {
        maxScore: 0,
        games: {
            'banyak_/_kurang': 2,
            'semua_/_tiada_/_sesetengah': 3,
            'sama_/_beza': 2,
            'penuh_/_kosong': 2,
            'berat_/_ringan': 2
        }
    },
    'Qualitative Concepts': {
        maxScore: 0,
        games: {
            'besar_/_kecil': 2,
            'panjang_/_pendek': 2,
            'sejuk_/_panas': 2,
            'basah_/_kering': 2,
            'keras_/_lembut': 2,
            'kasar_/_licin': 2,
            'laju_/_perlahan': 2,
            'bersih_/_kotor': 2,
            'bising_/_senyap': 2,
            'kuat_/_lemah': 2
        }
    },
    'Temporal Concepts': {
        maxScore: 0,
        games: {
            'sebelum_/_selepas': 2,
            'sekarang_/_kemudian': 2,
            'pagi_/_malam': 2
        }
    },
    'Color & Shape': {
        maxScore: 0,
        games: {
            'kuning': 2,
            'hijau': 2,
            'merah': 2,
            'ungu': 2,
            'oren': 2
        }
    },
    'Comparative': {
        maxScore: 0,
        games: {
            'bigger_smaller': 2,
            'longer_shorter': 2,
            'more_than_less_than': 3
        }
    },
    'Social/Emotional': {
        maxScore: 0,
        games: {
            'gembira_/_sedih_/_marah_/_takut': 4,  
            'bersama_/_bersendirian': 2,          
            'mesra_/_jahat': 2,                    
            'tolong_/_kongsi_/_tunggu': 3          
        }
    }
};

// Calculate max scores
Object.keys(CONCEPT_STRUCTURE).forEach(concept => {
    let total = 0;
    Object.values(CONCEPT_STRUCTURE[concept].games).forEach(score => {
        total += score;
    });
    CONCEPT_STRUCTURE[concept].maxScore = total;
});

console.log('📊 Concept Structure loaded:', CONCEPT_STRUCTURE);

// ================= GAME SESSION CLASS =================
class GameSessionManager {
    constructor() {
        this.studentData = this.getStudentData();
        this.currentScore = 0;
        this.maxScore = 0;
        this.conceptType = '';
        this.gameName = '';
        this.gameKey = '';
        this.sessionStartTime = Date.now();
        this.isSessionActive = false;
        this.gameAlreadyPlayed = false;
        this.existingScore = 0;
    }

    getStudentData() {
        const username = sessionStorage.getItem('userName');
        const studentId = sessionStorage.getItem('studentId');
        const age = sessionStorage.getItem('userAge');
        const role = sessionStorage.getItem('userRole');

        if (!username || role !== 'student') {
            console.error('❌ No student logged in or invalid role');
            return null;
        }

        return { username, studentId, age };
    }

    isLoggedIn() {
        return this.studentData !== null;
    }

    async checkGameStatus(gameKey) {
        try {
            const studentId = sessionStorage.getItem('studentId');
            if (!studentId) {
                console.log('⚠️ No studentId in session');
                return { played: false, score: 0 };
            }

            const studentQuery = await db.collection('students')
                .where('studentId', '==', studentId)
                .get();

            if (studentQuery.empty) {
                console.warn('⚠️ Student not found in Firebase');
                return { played: false, score: 0 };
            }

            const studentDoc = studentQuery.docs[0];
            const studentData = studentDoc.data();
            
            console.log('🔍 Checking game status for:', gameKey);
            
            const conceptProgress = studentData.conceptProgress || {};
            
            for (const conceptType in conceptProgress) {
                const conceptData = conceptProgress[conceptType];
                const gamesCompleted = conceptData.gamesCompleted || {};
                
                if (gamesCompleted[gameKey] !== undefined) {
                    console.log(`🔒 Game already played in ${conceptType}!`);
                    console.log(`   Score: ${gamesCompleted[gameKey]}`);
                    return { 
                        played: true, 
                        score: gamesCompleted[gameKey] 
                    };
                }
            }

            console.log('✅ First time playing this game');
            return { played: false, score: 0 };

        } catch (error) {
            console.error('❌ Error checking game status:', error);
            return { played: false, score: 0 };
        }
    }

    async startSession(conceptType, gameName, maxScore) {
        if (!this.isLoggedIn()) {
            console.error('❌ Student must be logged in to play');
            this.showLoginPrompt();
            return false;
        }

        this.gameKey = gameName.replace(/\s*\/\s*/g, '_/_').replace(/\s+/g, '_').toLowerCase();
        
        console.log(`🎮 Starting session for: "${gameName}"`);
        console.log(`🔑 Game key: "${this.gameKey}"`);
        
        const gameStatus = await this.checkGameStatus(this.gameKey);
        
        if (gameStatus.played) {
            this.gameAlreadyPlayed = true;
            this.existingScore = gameStatus.score;
            console.log('🔒 Game locked - already played with score:', gameStatus.score);
            return false;
        }

        this.conceptType = conceptType;
        this.gameName = gameName;
        this.maxScore = maxScore;
        this.currentScore = 0;
        this.sessionStartTime = Date.now();
        this.isSessionActive = true;
        this.gameAlreadyPlayed = false;

        console.log('✅ Game session started:', {
            student: this.studentData.username,
            concept: conceptType,
            game: gameName,
            gameKey: this.gameKey,
            maxScore: maxScore
        });

        return true;
    }

    showLoginPrompt() {
        const existingPrompt = document.getElementById('loginPromptOverlay');
        if (existingPrompt) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'loginPromptOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
        `;
        
        const promptBox = document.createElement('div');
        promptBox.style.cssText = `
            background: white; padding: 40px; border-radius: 20px; text-align: center;
            max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        
        promptBox.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">🔒</div>
            <h2 style="color: #003d82; margin-bottom: 15px; font-size: 24px;">Login Diperlukan</h2>
            <p style="color: #666; margin-bottom: 25px; font-size: 16px;">
                Anda perlu login untuk bermain game dan simpan score!
            </p>
            <button onclick="window.location.href='../../../index.html'" style="
                background: linear-gradient(135deg, #21537c 0%, #003e8d 100%);
                color: white; padding: 15px 40px; border: none; border-radius: 25px;
                font-size: 16px; font-weight: 700; cursor: pointer;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2); transition: transform 0.2s;
            ">Pergi ke Login Page</button>
        `;
        
        overlay.appendChild(promptBox);
        document.body.appendChild(overlay);
    }

    // CRITICAL: This updates gameSession internal score
    addScore(points = 1) {
        if (!this.isSessionActive) {
            console.error('❌ No active game session');
            return;
        }
        this.currentScore += points;
        console.log(`✅ Score updated in gameSession: ${this.currentScore}/${this.maxScore}`);
    }

    getScore() {
        return {
            current: this.currentScore,
            max: this.maxScore,
            percentage: Math.round((this.currentScore / this.maxScore) * 100)
        };
    }

    async saveScore() {
        if (!this.isSessionActive || !this.isLoggedIn()) {
            console.error('❌ Cannot save score - invalid session');
            return false;
        }

        try {
            console.log('💾 ========== SAVING TO FIREBASE ==========');
            console.log('   Student:', this.studentData.studentId);
            console.log('   Game:', this.gameName);
            console.log('   Game Key:', this.gameKey);
            console.log('   Score:', this.currentScore + '/' + this.maxScore);
            
            const gameStatus = await this.checkGameStatus(this.gameKey);
            if (gameStatus.played) {
                console.log('🔒 Score already exists:', gameStatus.score);
                return false;
            }

            const duration = Date.now() - this.sessionStartTime;
            const percentage = Math.round((this.currentScore / this.maxScore) * 100);

            const gameScoreData = {
                studentId: this.studentData.studentId,
                username: this.studentData.username,
                conceptType: this.conceptType,
                gameName: this.gameName,
                gameKey: this.gameKey,
                score: this.currentScore,
                maxScore: this.maxScore,
                percentage: percentage,
                duration: duration,
                playTime: Math.round(duration / 60000),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0]
            };

            console.log('📝 Saving to gameScores collection...');
            await db.collection('gameScores').add(gameScoreData);
            console.log('✅ Saved to gameScores!');

            console.log('📝 Updating student progress...');
            await this.updateStudentProgress();
            console.log('✅ Student progress updated!');

            console.log('========================================');
            return true;

        } catch (error) {
            console.error('❌ Error saving score:', error);
            return false;
        }
    }

    async updateStudentProgress() {
        try {
            const studentQuery = await db.collection('students')
                .where('studentId', '==', this.studentData.studentId)
                .get();

            if (studentQuery.empty) {
                console.error('❌ Student not found');
                return;
            }

            const studentDoc = studentQuery.docs[0];
            const studentRef = studentDoc.ref;
            const currentData = studentDoc.data();

            let conceptProgress = currentData.conceptProgress || {};

            if (!conceptProgress[this.conceptType]) {
                conceptProgress[this.conceptType] = {
                    totalScore: 0,
                    maxPossibleScore: CONCEPT_STRUCTURE[this.conceptType]?.maxScore || 0,
                    gamesCompleted: {},
                    lastPlayed: null
                };
            }

            const previousScore = conceptProgress[this.conceptType].gamesCompleted[this.gameKey];
            
            if (previousScore !== undefined) {
                console.log('🔒 Game already recorded:', previousScore);
                return;
            }

            console.log(`💾 Recording: ${this.gameKey} = ${this.currentScore}/${this.maxScore}`);
            
            conceptProgress[this.conceptType].totalScore += this.currentScore;
            conceptProgress[this.conceptType].gamesCompleted[this.gameKey] = this.currentScore;
            conceptProgress[this.conceptType].lastPlayed = firebase.firestore.FieldValue.serverTimestamp();

            let overallTotalScore = 0;
            Object.values(conceptProgress).forEach(concept => {
                overallTotalScore += concept.totalScore;
            });

            const spiderWebData = {};
            Object.keys(CONCEPT_STRUCTURE).forEach(conceptName => {
                if (conceptProgress[conceptName]) {
                    const achieved = conceptProgress[conceptName].totalScore;
                    const max = CONCEPT_STRUCTURE[conceptName].maxScore;
                    spiderWebData[conceptName] = {
                        score: achieved,
                        maxScore: max,
                        percentage: Math.round((achieved / max) * 100)
                    };
                } else {
                    spiderWebData[conceptName] = {
                        score: 0,
                        maxScore: CONCEPT_STRUCTURE[conceptName].maxScore,
                        percentage: 0
                    };
                }
            });

            await studentRef.update({
                conceptProgress: conceptProgress,
                totalScore: overallTotalScore,
                spiderWebData: spiderWebData,
                lastGamePlayed: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Firebase updated successfully!');

        } catch (error) {
            console.error('❌ Error updating progress:', error);
        }
    }

    async endSession() {
        if (!this.isSessionActive) {
            console.error('❌ No active session to end');
            return false;
        }

        console.log('🏁 Ending game session...');
        console.log(`   Final score: ${this.currentScore}/${this.maxScore}`);

        const saved = await this.saveScore();
        
        if (saved) {
            this.isSessionActive = false;
            console.log('✅ Session ended successfully');
            return true;
        } else {
            console.error('❌ Failed to save score');
            return false;
        }
    }
}

// ================= GLOBAL INSTANCE & FUNCTIONS =================
const gameSession = new GameSessionManager();

async function initializeGame(conceptType, gameName, maxScore) {
    console.log('🎮 INITIALIZING GAME...');
    console.log('   Concept:', conceptType);
    console.log('   Game:', gameName);
    console.log('   Max Score:', maxScore);
    
    const started = await gameSession.startSession(conceptType, gameName, maxScore);
    
    if (started) {
        console.log('✅ Game initialized!');
    } else {
        console.log('🔒 Game already played!');
    }
    
    return started;
}

// REMOVED updateScoreDisplay() - Let game handle its own display
// Only provide addScore functionality

function handleCorrectAnswer() {
    gameSession.addScore(1);
    console.log('✅ handleCorrectAnswer called - score:', gameSession.currentScore);
}

function handleWrongAnswer() {
    console.log('❌ handleWrongAnswer called - no score change');
}

// ================= EXPORTS =================
window.gameSession = gameSession;
window.initializeGame = initializeGame;
window.handleCorrectAnswer = handleCorrectAnswer;
window.handleWrongAnswer = handleWrongAnswer;

console.log('✅ Game Session Manager loaded! (WITH RELATIONAL CONCEPTS)');
console.log('🔒 First attempt only - No replays allowed');
console.log('📊 Concepts loaded:', Object.keys(CONCEPT_STRUCTURE).length);
console.log('📋 Relational Concepts games:', Object.keys(CONCEPT_STRUCTURE['Relational Concepts'].games));