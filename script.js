const BOT_TOKEN = "8851490896:AAFK_BdUJuUplm6Op9YtKK5gtDtjWaS3bwY";
const CHAT_ID = "7315159490";

const PROMPTS = {
  "Leadership": [
    "Describe a time you led a team through a difficult challenge. What did you learn?",
    "What qualities do you think make a great leader, and why?",
    "Describe a situation where you had to motivate others to achieve a goal.",
    "Tell about a time you took initiative without being asked."
  ],
  "Problem Solving": [
    "Describe a complex problem you solved. What steps did you take?",
    "Tell about a time you had limited resources but still achieved your goal.",
    "Describe a situation where your first solution failed. What did you do next?",
    "What is the most creative solution you have ever come up with?"
  ],
  "Conflict Resolution": [
    "Describe a disagreement you had with someone and how you resolved it.",
    "Tell about a time you had to work with someone whose opinion differed from yours.",
    "Describe a situation where you had to mediate between two people in conflict.",
    "How do you handle criticism from others? Give an example."
  ],
  "Adaptability": [
    "Describe a time you had to quickly adapt to an unexpected change.",
    "Tell about a situation where you had to learn something new very fast.",
    "Describe how you handled a major change in your school or work environment.",
    "Give an example of a time you stepped outside your comfort zone."
  ]
};

let timeLeft = 900, timerId = null, running = false, currentPrompt = "", currentCat = "";
const timerVal = document.getElementById('timerVal');
const wordVal = document.getElementById('wordVal');
const charVal = document.getElementById('charVal');
const promptText = document.getElementById('promptText');
const catBadge = document.getElementById('catBadge');
const essayArea = document.getElementById('essayArea');
const newBtn = document.getElementById('newBtn');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const notice = document.getElementById('notice');

function showNotice(msg, ms=3000){
  notice.textContent = msg;
  notice.classList.add('show');
  setTimeout(()=>notice.classList.remove('show'), ms);
}

function pickPrompt(){
  const cats = Object.keys(PROMPTS);
  currentCat = cats[Math.floor(Math.random()*cats.length)];
  const arr = PROMPTS[currentCat];
  currentPrompt = arr[Math.floor(Math.random()*arr.length)];
  catBadge.textContent = currentCat;
  promptText.textContent = currentPrompt;
}

function formatTime(s){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const sec = (s%60).toString().padStart(2,'0');
  return m+":"+sec;
}

function updateTimerDisplay(){
  timerVal.textContent = formatTime(timeLeft);
  timerVal.classList.toggle('warn', timeLeft<=180 && timeLeft>60);
  timerVal.classList.toggle('danger', timeLeft<=60);
}

function startTimer(){
  if(running) return;
  running = true;
  essayArea.disabled = false;
  essayArea.focus();
  startBtn.textContent = "⏸ Жүріп жатыр...";
  startBtn.disabled = true;
  timerId = setInterval(()=>{
    timeLeft--;
    updateTimerDisplay();
    if(timeLeft<=0){
      clearInterval(timerId);
      running = false;
      essayArea.disabled = true;
      showNotice("⏰ Уақыт аяқталды!", 4000);
      startBtn.disabled = false;
      startBtn.textContent = "▶ Start";
    }
  },1000);
}

function resetTimer(){
  clearInterval(timerId);
  running = false;
  timeLeft = 900;
  updateTimerDisplay();
  startBtn.disabled = false;
  startBtn.textContent = "▶ Start";
  essayArea.disabled = true;
}

function newEssay(auto){
  pickPrompt();
  resetTimer();
  essayArea.value = "";
  updateCounts();
  if(!auto) showNotice("🎲 Жаңа тақырып таңдалды!", 1800);
}

function updateCounts(){
  const txt = essayArea.value;
  const words = txt.trim().length ? txt.trim().split(/\s+/).length : 0;
  wordVal.textContent = words;
  charVal.textContent = txt.length;
  submitBtn.disabled = words < 1;
}

essayArea.addEventListener('input', ()=>{
  updateCounts();
  if(!running && !essayArea.disabled && timeLeft>0 && essayArea.value.length>0){
    startTimer();
  }
});

newBtn.addEventListener('click', ()=>newEssay(false));
startBtn.addEventListener('click', ()=>{
  essayArea.disabled = false;
  startTimer();
});

submitBtn.addEventListener('click', async ()=>{
  const essay = essayArea.value.trim();
  if(!essay){ showNotice("✍️ Алдымен эссе жазыңыз!"); return; }
  const used = 900 - timeLeft;
  const mm = Math.floor(used/60), ss = used%60;
  const words = wordVal.textContent;
  const message =
`📝 FLEX Essay

📂 Санат: ${currentCat}
❓ Тақырып: ${currentPrompt}

✉️ Эссе:
${essay}

⏱ Жұмсалған уақыт: ${mm}м ${ss}с
📊 Сөз саны: ${words}`;

  submitBtn.disabled = true;
  submitBtn.textContent = "⏳ Жіберілуде...";
  try{
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({chat_id: CHAT_ID, text: message})
    });
    const data = await resp.json();
    if(data.ok){
      showNotice("✅ Эссе сәтті жіберілді!", 3000);
    } else {
      showNotice("⚠️ Жіберу кезінде қате шықты.", 3000);
    }
  } catch(e){
    showNotice("⚠️ Желі қатесі. Қайталап көріңіз.", 3000);
  }
  submitBtn.textContent = "📤 Эссені жіберу";
  submitBtn.disabled = essayArea.value.trim().length < 1;
});

pickPrompt();
updateTimerDisplay();