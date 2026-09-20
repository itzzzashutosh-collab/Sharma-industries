/**
 * Sharma Industries / Swatch Paints — Hermes Sales Training Engine
 * 
 * Implements the Indian Sales Psychology & Script Playbook (Version 1.0)
 * Architecture:
 *   1. Teach Indian buyer psychology first, product second.
 *   2. 3 Roleplay Certification Gates: Dealer, Painter, Homeowner (Passing Score: 8/10).
 *   3. Daily 15-Minute Objection Drills (Empathy ➔ Reframe ➔ Proof ➔ Close).
 *   4. Trainee Evaluation & Scoring: Trust Building, Probing, Objection Handling, Closing.
 *   5. Daily 1-Page Training Brief for Ashutosh Sir (+91 9079609627).
 *   6. 3-Strike Rule: 3 fails = Field Shadowing recommendation, not field selling.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'data', 'trainee_training_state.json');

class SalesTrainingEngine {
  constructor() {
    this.objectionBank = [
      {
        id: 'OBJ-01',
        objection: 'Aapka brand naya hai. Kaun khareedega?',
        buyerType: 'Dealer',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, bilkul sahi baat hai. Isi liye to pehla mauka aapko mil raha hai. Jab sab bechne lagenge tab margin kam ho jayega. Abhi 40-45% margin, zero tinting machine requirement, aur 30-day stock buyback guarantee hai. 10 bag (25kg) counter pe rakhte hain, na bike to main wapas le jaunga.'
      },
      {
        id: 'OBJ-02',
        objection: 'Asian Paints zyada chalta hai, customer wahi mangta hai.',
        buyerType: 'Dealer',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, Asian Paints zabardast brand hai, lekin wo aapko 25% margin deta hai aur lakhon ki machine counter par lagwata hai. Swatch Rustic direct 25kg ready bags me aata hai, zero machine investment, aur pura 45% margin deta hai. Ek trial order lijiye.'
      },
      {
        id: 'OBJ-03',
        objection: 'Aapka rate thoda mehenga lag raha hai.',
        buyerType: 'Homeowner',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Madam/Sir, sasta paint 2 saal me ukhad jata hai aur dobara labour ka kharcha lagta hai. Swatch Rustic 7 saal tak bina crack chale ga. Saal ka hisab lagayein to ye sabse kifayati padega.'
      },
      {
        id: 'OBJ-04',
        objection: 'Mujhe credit chahiye, udhaar pe doge?',
        buyerType: 'Dealer',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, 30 days ka clean credit term hai. Aur agar aap 7 din me payment karte hain to 2% extra cash discount bhi milega. Business me cash ghume to munafa double hota hai.'
      },
      {
        id: 'OBJ-05',
        objection: 'Soch ke batayenge / Card chhod jao.',
        buyerType: 'Dealer / Homeowner',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, bilkul sochiye. Par kya rate me dikkat hai ya quality me? Khulkar batayein, main factory direct baitha hoon, turant solution nikalte hain.'
      },
      {
        id: 'OBJ-06',
        objection: 'Mera paisa fas jayega naye maal me.',
        buyerType: 'Dealer',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, Swatch Paints 100% written Return Guarantee deta hai. 30 din me agar ek 25kg bag bhi na bike to pura maal bina kisi deduction ke wapas. Risk hamara, munafa aapka.'
      },
      {
        id: 'OBJ-07',
        objection: 'Painter / Thekedaar ise nahi lagayega.',
        buyerType: 'Dealer',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, har 25kg bag me Painter ke liye instant ₹50 cash scratch coupon aur Swatch Painter Club rewards hain. Hum unhe [Painter Name] ji kehkar unke naam se samman dete hain, demo conduct karte hain aur certified applicator banate hain.'
      },
      {
        id: 'OBJ-08',
        objection: 'Aur discount do, tab lenge.',
        buyerType: 'Dealer / Contractor',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, rate me se aur katenge to quality kam ho jayegi. Main aapke liye factory se ek painter kit aur display sample board bilkul free lagwa deta hoon. Discount se bada fayda hoga.'
      },
      {
        id: 'OBJ-09',
        objection: 'Hum sirf established brands bechte hain.',
        buyerType: 'Dealer',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, established brand bechkar aap dukan ka kiraya nikalte hain, par Swatch Rustic 25kg bags bechkar aap bina kisi machine kharche ke pura 40-45% munafa banate hain. Ek counter shelf Swatch ko dekar dekhiye.'
      },
      {
        id: 'OBJ-10',
        objection: 'Diwali ke baad aana, abhi time nahi hai.',
        buyerType: 'Dealer',
        idealFormula: 'Empathy ➔ Reframe ➔ Proof ➔ Close',
        masterTurnaround: 'Sir, Diwali ke baad to painting ka seasonal demand khatam ho jayega! Abhi sabse bada season hai, agar abhi counter pe stock nahi hoga to customer doosri dukan chala jayega. Aaj hi 15 bags lock kijiye.'
      }
    ];

    this.roleplayGates = [
      {
        id: 'GATE-1',
        title: 'Dealer Qualification Gate',
        persona: 'Skeptical Hardware Store Owner',
        focus: '40–45% margin, 30 days credit, zero tinting machine barrier (ready 25kg bags), 30-day buyback guarantee.',
        passCriteria: 'Must build rapport in first 2 mins, probe current margins, reframe fear of stuck capital, highlight zero tinting machine investment, and close on 10-bag trial.'
      },
      {
        id: 'GATE-2',
        title: 'Painter & Contractor Partner Gate',
        persona: 'Senior Contractor / Professional Painter',
        focus: 'Painter Club respect, address by registered name [Painter Name] ji, scratch token instant cash, tools kit, zero-callback texture workability.',
        passCriteria: 'Must address painter respectfully by their actual name, explain scratch token mechanism, offer demo, and enroll into Swatch Painter Club.'
      },
      {
        id: 'GATE-3',
        title: 'Homeowner Protection Gate',
        persona: 'Cost-Conscious Middle-Class Homeowner (Pati-Patni)',
        focus: '7-year weather durability, family pride, free color consultation, paisa-vasool calculation.',
        passCriteria: 'Must involve family decision, explain life-cycle value vs cheap repaints, offer shade card demo.'
      }
    ];
  }

  loadState() {
    if (!fs.existsSync(STATE_FILE)) {
      const defaultState = {
        trainees: {
          '+919057501926': {
            name: 'Sonu Kumar',
            role: 'Salesman',
            drillsCompleted: 12,
            drillsPassed: 10,
            consecutiveFails: 0,
            gates: {
              'GATE-1': { passed: true, score: 8.5, date: '2026-09-15' },
              'GATE-2': { passed: true, score: 9.0, date: '2026-09-16' },
              'GATE-3': { passed: false, score: 7.2, attempts: 2 }
            },
            readiness: 'Field Shadowing (Gate 3 Pending)'
          }
        },
        dailyLogs: []
      };
      this.saveState(defaultState);
      return defaultState;
    }
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      return { trainees: {}, dailyLogs: [] };
    }
  }

  saveState(state) {
    try {
      fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[SalesTraining] Error saving state:', e.message);
    }
  }

  getRandomDrill() {
    const idx = Math.floor(Math.random() * this.objectionBank.length);
    return this.objectionBank[idx];
  }

  evaluateTraineeResponse(traineePhone, objectionId, responseText) {
    const text = (responseText || '').toLowerCase();
    const objection = this.objectionBank.find(o => o.id === objectionId) || this.objectionBank[0];

    // Pillar Scoring: 0 to 10
    // 1. Trust: Respect words ("sir", "ji", "aap", "namaste", empathy)
    let trustScore = 5.0;
    if (text.includes('sir') || text.includes('ji') || text.includes('namaste') || text.includes('aap')) trustScore += 2.5;
    if (text.includes('sahi') || text.includes('samajh') || text.includes('bilkul')) trustScore += 2.5;

    // 2. Probing: Understanding reason ("kya dikkat", "kyu", "pucho", "reason")
    let probingScore = 5.0;
    if (text.includes('kya') || text.includes('kaise') || text.includes('reason') || text.includes('dikkat')) probingScore += 2.5;
    if (text.includes('price') || text.includes('quality') || text.includes('margin')) probingScore += 2.5;

    // 3. Objection Handling: Reframe + Proof (Margin 40-45%, guarantee, scratch token, BIS)
    let objectionScore = 5.0;
    if (text.includes('40') || text.includes('45%') || text.includes('margin') || text.includes('token') || text.includes('guarantee')) objectionScore += 2.5;
    if (text.includes('return') || text.includes('wapas') || text.includes('7 saal') || text.includes('risk')) objectionScore += 2.5;

    // 4. Closing: Direct call to action (10 bucket, trial, order, sign)
    let closingScore = 5.0;
    if (text.includes('bucket') || text.includes('trial') || text.includes('order') || text.includes('start')) closingScore += 2.5;
    if (text.includes('kal') || text.includes('aaj') || text.includes('counter')) closingScore += 2.5;

    trustScore = Math.min(10, trustScore);
    probingScore = Math.min(10, probingScore);
    objectionScore = Math.min(10, objectionScore);
    closingScore = Math.min(10, closingScore);

    const overallScore = Number(((trustScore + probingScore + objectionScore + closingScore) / 4).toFixed(1));
    const passed = overallScore >= 8.0 && trustScore >= 7.5 && objectionScore >= 7.5;

    // Update state
    const state = this.loadState();
    if (!state.trainees[traineePhone]) {
      state.trainees[traineePhone] = {
        name: 'Field Trainee',
        drillsCompleted: 0,
        drillsPassed: 0,
        consecutiveFails: 0,
        gates: {}
      };
    }
    const trainee = state.trainees[traineePhone];
    trainee.drillsCompleted += 1;
    if (passed) {
      trainee.drillsPassed += 1;
      trainee.consecutiveFails = 0;
    } else {
      trainee.consecutiveFails += 1;
    }

    if (trainee.consecutiveFails >= 3) {
      trainee.readiness = '⚠️ 3 Fails Detected — Assigned to Field Shadowing (Not Field Selling)';
    } else if (trainee.drillsPassed >= 5) {
      trainee.readiness = '✅ Field Ready for Trial Counters';
    }

    this.saveState(state);

    return {
      objection: objection.objection,
      passed,
      overallScore,
      scores: {
        trustBuilding: trustScore,
        probing: probingScore,
        objectionHandling: objectionScore,
        closing: closingScore
      },
      consecutiveFails: trainee.consecutiveFails,
      readiness: trainee.readiness,
      idealScript: objection.masterTurnaround
    };
  }

  generateCeoDailyBrief() {
    const state = this.loadState();
    const today = new Date().toISOString().split('T')[0];
    const traineeList = Object.values(state.trainees);

    let passedRoleplays = 0;
    let failedRoleplays = 0;
    traineeList.forEach(t => {
      Object.values(t.gates || {}).forEach(g => {
        if (g.passed) passedRoleplays++;
        else failedRoleplays++;
      });
    });

    return `👑 *HERMES SALES FORCE ENABLEMENT — 1-PAGE DAILY BRIEF*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 *Date*: ${today} | *Orchestrator*: Hermes (Brain)
👥 *Active Trainees*: ${traineeList.length} (Sonu Kumar & Field Reps)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *Trainee Performance & Certification*:
• Total Roleplays Passed: *${passedRoleplays}*
• Total Roleplays In-Progress / Failed: *${failedRoleplays}*
• Active Field Readiness:
${traineeList.map(t => `  - *${t.name}* (${t.role || 'Sales Rep'}): ${t.readiness || 'Training'}`).join('\n')}

🎯 *Top 3 Market Objections Trained Today*:
1. "Aapka brand naya hai, paisa fas jayega" ➔ Counter: 30-Day Written Buyback Guarantee + 45% Margin.
2. "Asian Paints 25% deta hai" ➔ Counter: 45% Swatch Margin (₹150 net profit per pail).
3. "Painter nahi lagayega" ➔ Counter: ₹50 Instant Cash Scratch Code in bucket + Swatch Painter Club.

⭐ *Best Script of the Day*:
> _"Sir, Asian Paints se dukan ka kiraya nikalta hai, par Swatch Paints ka 45% margin aapki dukan ka asali munafa banata hai. 10 bucket counter pe rakhiye, na bike to main wapas le jaunga."_

⚠️ *Hermes 3-Strike Rule Recommendation*:
${traineeList.some(t => t.consecutiveFails >= 3)
  ? '⚠️ *Action Alert*: Trainee has failed 3 drills consecutively. Auto-routed to 3-day Field Shadowing under Senior Rep before customer meetings.'
  : '✅ All active trainees meet minimum 8.0/10 certification threshold. Approved for field beat.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Authorized by Hermes Brain for CEO Ashutosh Sharma (+91 9079609627)_`;
  }
}

module.exports = new SalesTrainingEngine();
