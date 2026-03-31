const STUDY_BLOCKS = [
  { start: "14:15", end: "15:35" },
  { start: "15:55", end: "16:15" },
  { start: "16:25", end: "17:45" },
  { start: "17:55", end: "19:30" }
];

const CRAVING_STATES = [
  {
    key: "craving-low",
    max: 25,
    text: "не особо хочу курить",
    emojis: ["😢", "😭", "🥺", "😔"]
  },
  {
    key: "craving-medium",
    max: 50,
    text: "хочу курить",
    emojis: ["🙂", "😊", "😌", "😁"]
  },
  {
    key: "craving-high",
    max: 75,
    text: "пипец как хочу курить",
    emojis: ["😤", "😬", "😣", "🫠"]
  },
  {
    key: "craving-max",
    max: 100,
    text: "хочу выкурить целую пачку",
    emojis: ["🤬", "😡", "👹", "💀"]
  }
];

const elements = {
  timerValue: document.getElementById("timerValue"),
  smokeCount: document.getElementById("smokeCount"),
  minusButton: document.getElementById("minusButton"),
  plusButton: document.getElementById("plusButton"),
  cravingSlider: document.getElementById("cravingSlider"),
  cravingPercent: document.getElementById("cravingPercent"),
  cravingText: document.getElementById("cravingText"),
  emojiField: document.getElementById("emojiField")
};

let smokeCountValue = 0;
let currentCravingKey = "";

function parseTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

function buildDateAt(baseDate, time) {
  const next = new Date(baseDate);
  const { hours, minutes } = parseTime(time);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function buildBlocksFor(date) {
  return STUDY_BLOCKS.map((block) => ({
    start: buildDateAt(date, block.start),
    end: buildDateAt(date, block.end)
  }));
}

function formatTimeLeft(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0")
  ].join(":");
}

function getNextState(now) {
  const todayBlocks = buildBlocksFor(now);

  for (let index = 0; index < todayBlocks.length; index += 1) {
    const block = todayBlocks[index];
    const nextBlock = todayBlocks[index + 1] ?? null;

    if (now < block.start) {
      return {
        mode: "lesson",
        target: block.end
      };
    }

    if (now >= block.start && now < block.end) {
      return {
        mode: "lesson",
        target: block.end
      };
    }

    if (nextBlock && now >= block.end && now < nextBlock.start) {
      return {
        mode: "break",
        target: nextBlock.start
      };
    }
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowBlocks = buildBlocksFor(tomorrow);

  return {
    mode: "lesson",
    target: tomorrowBlocks[0].end
  };
}

function getCravingState(value) {
  return CRAVING_STATES.find((state) => value <= state.max) ?? CRAVING_STATES[CRAVING_STATES.length - 1];
}

function renderEmojiField(state) {
  elements.emojiField.innerHTML = "";

  for (let index = 0; index < 36; index += 1) {
    const emoji = document.createElement("span");
    const icon = state.emojis[Math.floor(Math.random() * state.emojis.length)];
    const size = 28 + Math.floor(Math.random() * 46);
    const top = Math.floor(Math.random() * 100);
    const left = Math.floor(Math.random() * 100);
    const duration = 7 + Math.random() * 7;
    const delay = -Math.random() * 10;
    const opacity = 0.12 + Math.random() * 0.16;
    const rotate = -10 + Math.random() * 20;

    emoji.className = "emoji";
    emoji.textContent = icon;
    emoji.style.fontSize = `${size}px`;
    emoji.style.top = `${top}%`;
    emoji.style.left = `${left}%`;
    emoji.style.opacity = opacity.toFixed(2);
    emoji.style.animationDuration = `${duration.toFixed(2)}s`;
    emoji.style.animationDelay = `${delay.toFixed(2)}s`;
    emoji.style.transform = `rotate(${rotate.toFixed(1)}deg)`;
    elements.emojiField.appendChild(emoji);
  }
}

function applyCraving(value) {
  const state = getCravingState(value);

  elements.cravingPercent.textContent = `${value}%`;
  elements.cravingText.textContent = state.text;

  if (currentCravingKey !== state.key) {
    document.body.classList.remove(...CRAVING_STATES.map((item) => item.key));
    document.body.classList.add(state.key);
    renderEmojiField(state);
    currentCravingKey = state.key;
  }
}

function updateSmokeCount(delta) {
  smokeCountValue = Math.max(0, Math.min(99, smokeCountValue + delta));
  elements.smokeCount.textContent = String(smokeCountValue).padStart(2, "0");
}

function updateTimer() {
  const now = new Date();
  const state = getNextState(now);
  const timeLeft = state.target.getTime() - now.getTime();

  document.body.classList.toggle("break-mode", state.mode === "break");
  elements.timerValue.textContent = formatTimeLeft(timeLeft);
}

function setupEvents() {
  elements.plusButton.addEventListener("click", () => {
    updateSmokeCount(1);
  });

  elements.minusButton.addEventListener("click", () => {
    updateSmokeCount(-1);
  });

  elements.cravingSlider.addEventListener("input", (event) => {
    applyCraving(Number(event.target.value));
  });
}

function boot() {
  updateTimer();
  updateSmokeCount(0);
  applyCraving(Number(elements.cravingSlider.value));
  setupEvents();
  window.setInterval(updateTimer, 1000);
}

boot();
