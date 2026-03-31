const STUDY_BLOCKS = [
  { start: "14:15", end: "15:40" },
  { start: "16:00", end: "17:15" },
  { start: "17:20", end: "18:45" },
  { start: "18:40", end: "19:55" }
];

const timerValue = document.getElementById("timerValue");

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

function updateTimer() {
  const now = new Date();
  const state = getNextState(now);
  const timeLeft = state.target.getTime() - now.getTime();

  document.body.classList.toggle("break-mode", state.mode === "break");
  timerValue.textContent = formatTimeLeft(timeLeft);
}

updateTimer();
window.setInterval(updateTimer, 1000);
