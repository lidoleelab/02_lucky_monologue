const qrMain = document.getElementById("qr-main");
const terminal = document.getElementById("terminal");

const AUDIO_INTERVAL_MS = 120;
const MAX_ACTIVE_AUDIOS = 8;

let interval = null;
let active = false;
let current = null;
let audioUnlocked = false;
let activeAudios = [];

const words = [
  "프왕송", "와트만", "공동연구", "인격신", "공간", "시간", "하늘", "무감각", "무공포", "침묵",
  "사랑", "고통", "불", "불길", "지옥", "미란다", "속단", "금물", "미완성", "블레스",
  "베르트", "테스튜", "코나르", "인체측정학", "아카데미", "수상연구", "인간", "계산", "오류", "가능성",
  "이론", "설정", "명백", "파르토프", "벨세", "노작", "사실", "판명", "영양", "섭취",
  "배설", "향상", "반대의견", "요컨대", "훈련", "스포츠", "테니스", "축구", "달리기", "도보",
  "자전거", "경주", "수영", "마술", "항공", "빙상", "스케이트", "롤러스케이트", "겨울", "여름",
  "가을", "잔디밭", "전나무", "땅바닥", "바다", "공중", "하키", "페니실린", "대용약품", "왜소",
  "골프", "세느", "세느에와즈", "세느에마르느", "마르느에와즈", "병행", "여위다", "오그라들다", "와즈", "마르느",
  "볼테르", "노르망디", "벌거벗은남자", "몸무게", "평균치", "스타인베그", "페터만", "실험", "들", "산",
  "바닷가", "물가", "공기", "땅", "혹독한추위", "제7기", "돌", "에테르", "구렁", "수염"
];

function qrFileName(index, word) {
  const num = String(index + 1).padStart(3, "0");
  return `assets/qr_words/${num}_${word}.png`;
}

function voiceFileName(index, word) {
  const num = String(index + 1).padStart(2, "0");
  return `assets/voice/${num}_${word}.mp3`;
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const items = words.map((word, index) => {
  const img = new Image();
  img.src = qrFileName(index, word);

  return {
    word,
    qrSrc: img.src,
    voiceSrc: voiceFileName(index, word)
  };
});

current = rand(items);
qrMain.src = current.qrSrc;
terminal.innerText = "";

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  const silent = new Audio();
  silent.muted = true;
  silent.play().catch(() => {});
}

function trimActiveAudios() {
  activeAudios = activeAudios.filter(audio => !audio.ended);

  while (activeAudios.length > MAX_ACTIVE_AUDIOS) {
    const old = activeAudios.shift();
    if (old) {
      old.pause();
      old.src = "";
    }
  }
}

function playWord(item) {
  if (!audioUnlocked) return;

  trimActiveAudios();

  const audio = new Audio(item.voiceSrc);
  audio.volume = 0.85;

  activeAudios.push(audio);

  audio.play().catch(() => {});
}

function updateFast() {
  current = rand(items);

  qrMain.src = current.qrSrc;
  terminal.innerText = `decoded: ${current.word}`;

  playWord(current);
}

function startOutput() {
  unlockAudio();

  if (active) return;

  active = true;
  updateFast();

  interval = setInterval(updateFast, AUDIO_INTERVAL_MS);
}

function stopOutput() {
  active = false;

  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  terminal.innerText = "";
}

qrMain.addEventListener("mouseenter", startOutput);
qrMain.addEventListener("mouseleave", stopOutput);

qrMain.addEventListener("mousemove", () => {
  if (!active || !current) return;
  terminal.innerText = `decoded: ${current.word}`;
});

qrMain.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startOutput();
}, { passive: false });

qrMain.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!active) startOutput();
}, { passive: false });

qrMain.addEventListener("touchend", (e) => {
  e.preventDefault();
  stopOutput();
}, { passive: false });

qrMain.addEventListener("touchcancel", stopOutput);

qrMain.addEventListener("click", () => {
  if (active) {
    stopOutput();
  } else {
    startOutput();
  }
});