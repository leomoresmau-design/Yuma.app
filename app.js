const STORAGE_KEYS = {
  checkins: "repere.checkins",
  routines: "repere.routines",
  routineTemplates: "repere.routineTemplates",
  tasks: "repere.tasks",
  journal: "repere.journal",
  notes: "repere.notes",
  dailyFocus: "repere.dailyFocus",
  toolbox: "repere.toolbox",
  reflections: "repere.reflections",
  calmMode: "repere.calmMode",
  supportPreference: "repere.supportPreference",
  posts: "repere.posts",
  forumInteractions: "repere.forumInteractions",
  coach: "repere.coach"
};

const moods = [
  { id: "difficile", label: "Difficile", value: 1 },
  { id: "bof", label: "Bof", value: 2 },
  { id: "neutre", label: "Neutre", value: 3 },
  { id: "bien", label: "Bien", value: 4 },
  { id: "super", label: "Super", value: 5 }
];
const scaleLabels = ["Très basse", "Basse", "Moyenne", "Bonne", "Haute"];
const sensoryLabels = ["Très légère", "Légère", "Moyenne", "Forte"];
const today = getDateKey(new Date());
const starterPosts = [
  { id: "sample-1", category: "Astuces", author: "Camille", age: "Exemple", title: "Ma règle des 3 tâches maximum par jour", body: "Pendant longtemps j’ai listé 12 choses le matin et je n’en faisais zéro, avec une grosse culpabilité. Trois petits pas, c’est déjà une belle journée.", avatar: "C", color: "lilac" },
  { id: "sample-2", category: "Sensoriel", author: "Sacha", age: "Exemple", title: "Ce qui m’aide quand tout devient trop fort", body: "Quand la surcharge monte : je baisse la lumière, je mets mon casque sans musique et je m’accorde un moment tranquille.", avatar: "S", color: "sage" },
  { id: "sample-3", category: "Organisation", author: "Noa", age: "Exemple", title: "Le minuteur de 10 minutes a changé mes matinées", body: "Je lance le minuteur sans obligation de finir. Souvent, commencer suffit. Et si je m’arrête après, ça compte aussi.", avatar: "N", color: "peach" },
  { id: "sample-4", category: "Énergie", author: "Lou", age: "Exemple", title: "Comment je repère une journée à faible énergie", body: "J’ai appris à alléger ma liste avant d’être complètement épuisée. Reporter une tâche, c’est aussi prendre soin de soi.", avatar: "L", color: "blue" },
  { id: "sample-5", category: "Humeur", author: "Morgan", age: "Exemple", title: "Aujourd’hui, j’ai réussi à demander une pause", body: "C’était un petit pas pour moi. Je le partage ici au cas où quelqu’un aurait besoin de se rappeler qu’on a le droit de ralentir.", avatar: "M", color: "yellow" },
  { id: "sample-meme-1", category: "Mèmes", author: "Camille", age: "Exemple", title: "Quand je fais une toute petite tâche…", body: "", type: "meme", topText: "Quand je fais une toute petite tâche…", bottomText: "…et que je la compte comme une victoire", template: "petit-pas", avatar: "C", color: "lilac" },
  { id: "sample-meme-2", category: "Mèmes", author: "Noa", age: "Exemple", title: "Mon cerveau avait prévu un autre programme", body: "", type: "meme", topText: "Mon cerveau avait prévu un autre programme", bottomText: "On improvise doucement.", template: "cerveau", avatar: "N", color: "peach" }
];
const memeTemplates = {
  "petit-pas": {
    top: "Quand je fais une toute petite tâche…",
    bottom: "…et que je la compte quand même comme une victoire"
  },
  cerveau: {
    top: "Mon cerveau avait prévu un autre programme",
    bottom: "On improvise doucement."
  },
  pause: {
    top: "Je prends une pause pour être plus à l’aise",
    bottom: "La pause était le plan."
  }
};
const starterTasks = [
  { id: "starter-water", text: "Boire un verre d’eau", done: false },
  { id: "starter-food", text: "Prendre quelque chose à manger", done: false },
  { id: "starter-priority", text: "Choisir une priorité pour aujourd’hui", done: false }
];

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    console.error(`Impossible de lire les données "${key}".`, error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Impossible d’enregistrer les données "${key}".`, error);
  }
}

function formatToday(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);
}

document.querySelector("#today-date-label").textContent = formatToday(new Date()).toLocaleUpperCase("fr-FR");

let checkins = readStorage(STORAGE_KEYS.checkins, {});
if (!checkins || typeof checkins !== "object" || Array.isArray(checkins)) checkins = {};
let tasks = readStorage(STORAGE_KEYS.tasks, readStorage("clair.tasks", null));
if (!Array.isArray(tasks)) {
  tasks = starterTasks;
}
saveStorage(STORAGE_KEYS.tasks, tasks);
let journalEntries = readStorage(STORAGE_KEYS.journal, []);
if (!Array.isArray(journalEntries)) journalEntries = [];
let quickNotes = readStorage(STORAGE_KEYS.notes, readStorage("clair.notes", ""));
if (typeof quickNotes !== "string") quickNotes = "";
saveStorage(STORAGE_KEYS.notes, quickNotes);
let dailyFocus = readStorage(STORAGE_KEYS.dailyFocus, { date: today, text: "" });
if (!dailyFocus || typeof dailyFocus !== "object" || dailyFocus.date !== today || typeof dailyFocus.text !== "string") {
  dailyFocus = { date: today, text: "" };
}
let toolbox = readStorage(STORAGE_KEYS.toolbox, {
  date: today,
  items: [
    { id: "starter-quiet", text: "Réduire un bruit ou une lumière" },
    { id: "starter-music", text: "Écouter une musique qui me fait du bien" },
    { id: "starter-water", text: "Boire ou manger quelque chose" },
    { id: "starter-stretch", text: "M’étirer ou bouger doucement" }
  ],
  completed: {}
});
if (!toolbox || typeof toolbox !== "object" || !Array.isArray(toolbox.items)) {
  toolbox = { date: today, items: [], completed: {} };
}
if (toolbox.date !== today || !toolbox.completed || typeof toolbox.completed !== "object") {
  toolbox.date = today;
  toolbox.completed = {};
}
toolbox.items = toolbox.items.filter((item) => item && typeof item.id === "string" && typeof item.text === "string");
let reflections = readStorage(STORAGE_KEYS.reflections, {});
if (!reflections || typeof reflections !== "object" || Array.isArray(reflections)) reflections = {};
let localPosts = readStorage(STORAGE_KEYS.posts, []);
if (!Array.isArray(localPosts)) localPosts = [];
let forumInteractions = readStorage(STORAGE_KEYS.forumInteractions, {});
if (!forumInteractions || typeof forumInteractions !== "object" || Array.isArray(forumInteractions)) forumInteractions = {};
let coachMessages = readStorage(STORAGE_KEYS.coach, []);
if (!Array.isArray(coachMessages)) coachMessages = [];

let routineState = readStorage(STORAGE_KEYS.routines, { date: today, items: {} });
if (!routineState || routineState.date !== today || typeof routineState.items !== "object") {
  routineState = { date: today, items: {} };
  saveStorage(STORAGE_KEYS.routines, routineState);
}
let routineTemplateState = readStorage(STORAGE_KEYS.routineTemplates, readStorage("clair.routines", {}));
if (!routineTemplateState || typeof routineTemplateState !== "object" || Array.isArray(routineTemplateState)) {
  routineTemplateState = {};
}
saveStorage(STORAGE_KEYS.routineTemplates, routineTemplateState);

function setPressed(buttons, selected) {
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
}

const todayCheckin = checkins[today] || {};
const moodButtons = [...document.querySelectorAll(".mood-button")];
let selectedMood = todayCheckin.mood || "";
let selectedEnergy = todayCheckin.energy || "";
let selectedSensory = todayCheckin.sensory || "";
const supportPreference = document.querySelector("#support-preference");
const supportPreferenceOptions = {
  souple: "Tu peux garder ta journée ouverte et décider au fur et à mesure. Rien à rattraper.",
  "petit-pas": "Choisis une action si petite qu’elle semble facile à commencer. Tu peux t’arrêter après.",
  priorite: "S’il y a beaucoup de choses en tête, choisis une seule priorité. Le reste peut attendre.",
  pause: "Tu peux faire une pause maintenant, sans avoir besoin de la mériter.",
  calme: "Si tu en as envie, réduis une stimulation autour de toi : lumière, bruit ou notifications."
};
const savedSupportPreference = readStorage(STORAGE_KEYS.supportPreference, "souple");
supportPreference.value = Object.prototype.hasOwnProperty.call(supportPreferenceOptions, savedSupportPreference) ? savedSupportPreference : "souple";
document.querySelector("#daily-focus-input").value = dailyFocus.text;
const todayReflection = reflections[today] || {};
document.querySelector("#reflection-helped").value = typeof todayReflection.helped === "string" ? todayReflection.helped : "";
document.querySelector("#reflection-proud").value = typeof todayReflection.proud === "string" ? todayReflection.proud : "";

function restoreCheckinControls() {
  const moodButton = moodButtons.find((button) => button.dataset.mood === selectedMood);
  if (moodButton) setPressed(moodButtons, moodButton);
  document.querySelectorAll(".scale-button").forEach((button) => {
    const selected = Number(button.dataset.value) === (button.dataset.scale === "energy" ? selectedEnergy : selectedSensory);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("#energy-label").textContent = selectedEnergy ? scaleLabels[selectedEnergy - 1] : "Pas renseignée";
  document.querySelector("#sensory-label").textContent = selectedSensory ? sensoryLabels[selectedSensory - 1] : "Pas renseigné";
  if (todayCheckin.mood) {
    document.querySelector("#checkin-feedback").textContent = "Ton humeur est déjà enregistrée pour aujourd’hui. Tu peux la modifier si tu veux.";
  }
  renderHomeCheckin({
    mood: selectedMood,
    energy: selectedEnergy,
    sensory: selectedSensory
  });
}

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedMood = button.dataset.mood;
    setPressed(moodButtons, button);
    updateDailyFocus();
    renderHomeCheckin({ mood: selectedMood, energy: selectedEnergy, sensory: selectedSensory });
  });
});

document.querySelectorAll(".scale-button").forEach((button) => {
  button.addEventListener("click", () => {
    const value = Number(button.dataset.value);
    const groupButtons = [...document.querySelectorAll(`[data-scale="${button.dataset.scale}"]`)];
    setPressed(groupButtons, button);
    if (button.dataset.scale === "energy") {
      selectedEnergy = value;
      document.querySelector("#energy-label").textContent = scaleLabels[value - 1];
    } else {
      selectedSensory = value;
      document.querySelector("#sensory-label").textContent = sensoryLabels[value - 1];
    }
    updateDailyFocus();
    renderHomeCheckin({ mood: selectedMood, energy: selectedEnergy, sensory: selectedSensory });
  });
});

document.querySelector("#save-checkin").addEventListener("click", () => {
  if (!selectedMood && !selectedEnergy && !selectedSensory) {
    document.querySelector("#checkin-feedback").textContent = "Tu peux choisir une réponse, ou simplement passer ton tour.";
    return;
  }
  checkins[today] = {
    ...(selectedMood ? { mood: selectedMood } : {}),
    ...(selectedEnergy ? { energy: selectedEnergy } : {}),
    ...(selectedSensory ? { sensory: selectedSensory } : {}),
    savedAt: new Date().toISOString()
  };
  saveStorage(STORAGE_KEYS.checkins, checkins);
  const mood = moods.find((item) => item.id === selectedMood);
  const response = mood?.value <= 2
    ? "Merci de l’avoir noté. Tu peux alléger la suite, demander de l’aide ou te reposer."
    : mood?.value >= 4
      ? "Merci pour ton check-in. Garde aussi une place pour les pauses."
      : "C’est noté. Prends la journée comme elle vient, sans te presser.";
  document.querySelector("#checkin-feedback").textContent = "Enregistré. " + response;
  updateCoachSuggestion();
  updateDailyFocus();
  renderHomeOverview();
  renderProgress();
  document.querySelector("#save-checkin").focus();
});

function renderTasks() {
  const taskList = document.querySelector("#task-list");
  taskList.replaceChildren();
  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;
    const toggle = document.createElement("button");
    toggle.className = "task-check";
    toggle.type = "button";
    toggle.setAttribute("aria-pressed", String(task.done));
    toggle.setAttribute("aria-label", `${task.done ? "Marquer comme à faire" : "Terminer"} : ${task.text}`);
    toggle.textContent = task.done ? "✓" : "";
    toggle.addEventListener("click", () => {
      task.done = !task.done;
      saveStorage(STORAGE_KEYS.tasks, tasks);
      renderTasks();
    });
    const label = document.createElement("span");
    label.className = "task-label";
    label.textContent = task.text;
    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.setAttribute("aria-label", `Supprimer : ${task.text}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveStorage(STORAGE_KEYS.tasks, tasks);
      renderTasks();
    });
    item.append(toggle, label, remove);
    taskList.append(item);
  });
  const completed = tasks.filter((task) => task.done).length;
  document.querySelector("#task-count").textContent = `${completed}/${tasks.length}`;
}

document.querySelector("#add-task-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#new-task");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  tasks.push({ id: createId(), text, done: false });
  saveStorage(STORAGE_KEYS.tasks, tasks);
  renderTasks();
  input.value = "";
  input.focus();
});

function renderToolbox() {
  const list = document.querySelector("#toolbox-list");
  list.replaceChildren();
  if (!toolbox.items.length) {
    const empty = document.createElement("li");
    empty.className = "toolbox-empty";
    empty.textContent = "Ajoute une idée qui te fait du bien, même toute petite.";
    list.append(empty);
    return;
  }
  toolbox.items.forEach((tool) => {
    const item = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(toolbox.completed[tool.id]);
    checkbox.addEventListener("change", () => {
      toolbox.completed[tool.id] = checkbox.checked;
      saveStorage(STORAGE_KEYS.toolbox, toolbox);
    });
    const text = document.createElement("span");
    text.textContent = tool.text;
    label.append(checkbox, text);
    const remove = document.createElement("button");
    remove.className = "delete-tool";
    remove.type = "button";
    remove.setAttribute("aria-label", `Supprimer : ${tool.text}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      toolbox.items = toolbox.items.filter((entry) => entry.id !== tool.id);
      delete toolbox.completed[tool.id];
      saveStorage(STORAGE_KEYS.toolbox, toolbox);
      renderToolbox();
    });
    item.append(label, remove);
    list.append(item);
  });
}

document.querySelector("#new-tool-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#new-tool");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  toolbox.items.push({ id: createId(), text });
  saveStorage(STORAGE_KEYS.toolbox, toolbox);
  renderToolbox();
  input.value = "";
  input.focus();
});

document.querySelector("#daily-focus-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#daily-focus-input");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    document.querySelector("#focus-saved").textContent = "Ajoute une intention, ou laisse cette case vide.";
    return;
  }
  dailyFocus = { date: today, text };
  saveStorage(STORAGE_KEYS.dailyFocus, dailyFocus);
  document.querySelector("#focus-saved").textContent = "Ton intention est gardée pour aujourd’hui.";
});

function updateCoachSuggestion() {
  const entry = checkins[today];
  const suggestions = {
    1: "Ton énergie semble basse aujourd’hui. Si tu veux, choisis une seule chose essentielle et autorise-toi à reporter le reste.",
    2: "Tu peux garder ta journée légère : une petite tâche à la fois, avec une pause entre les deux.",
    3: "Tu peux choisir une priorité et ajuster le reste selon comment tu te sens.",
    4: "Ton énergie semble plutôt bonne. Tu peux avancer sur une priorité sans oublier de garder du temps pour une pause.",
    5: "Tu as l’air d’avoir pas mal d’énergie aujourd’hui. Choisis ce qui compte le plus et garde un peu de marge pour toi."
  };
  const mood = moods.find((item) => item.id === entry?.mood);
  let energyMessage = "Tu peux choisir ce qui te ferait du bien, ou ne rien décider tout de suite.";
  if (entry?.energy) energyMessage = suggestions[entry.energy];
  else if (mood?.value <= 2) energyMessage = "Ta journée semble difficile. Tu peux réduire tes attentes et ne garder qu’une chose essentielle.";
  else if (mood?.value >= 4) energyMessage = "Tu te sens plutôt bien. Avance à ton rythme et garde de la place pour une pause.";
  const sensoryMessage = entry?.sensory >= 3 ? " Un peu moins de bruit, de lumière ou de sollicitations peut aider." : "";
  const preferenceMessage = supportPreferenceOptions[supportPreference.value];
  document.querySelector("#coach-suggestion-text").textContent = entry
    ? `${energyMessage}${sensoryMessage} ${preferenceMessage}`
    : `${preferenceMessage} Tu peux ajuster cette proposition à tout moment.`;
}

function updateDailyFocus() {
  const mood = moods.find((item) => item.id === selectedMood);
  let tip = "Choisis une intention simple, ou laisse cette journée ouverte.";
  if (selectedSensory >= 3) {
    tip = "Tout semble intense ? Baisse une stimulation autour de toi, puis reprends une chose à la fois.";
  } else if (selectedEnergy && selectedEnergy <= 2) {
    tip = "Énergie basse : garde une seule chose essentielle. Boire, manger ou faire une pause suffit déjà.";
  } else if (selectedMood === "difficile") {
    tip = "Moment difficile : ralentis et choisis un geste de soin, ou demande du soutien à quelqu’un de confiance.";
  } else if (selectedMood === "bof") {
    tip = "Journée moyenne ? Choisis une petite tâche facile à commencer, puis vérifie comment tu te sens.";
  } else if (selectedMood === "neutre") {
    tip = "Pour avancer sans te disperser, choisis une priorité et découpe-la en une première étape.";
  } else if (mood?.value >= 4 || selectedEnergy >= 4) {
    tip = "Tu te sens plutôt bien : avance sur ce qui compte, en gardant une pause dans ta journée.";
  } else if (supportPreference.value !== "souple") {
    tip = supportPreferenceOptions[supportPreference.value];
  }
  document.querySelector("#focus-suggestion").textContent = tip;
}

supportPreference.addEventListener("change", () => {
  saveStorage(STORAGE_KEYS.supportPreference, supportPreference.value);
  updateCoachSuggestion();
  updateDailyFocus();
});

document.querySelectorAll("[data-routine]").forEach((checkbox) => {
  checkbox.checked = Boolean(routineState.items[checkbox.dataset.routine]);
  checkbox.addEventListener("change", () => {
    routineState.items[checkbox.dataset.routine] = checkbox.checked;
    saveStorage(STORAGE_KEYS.routines, routineState);
    renderRoutineProgress();
  });
});

document.querySelectorAll("[data-routine-template]").forEach((checkbox) => {
  checkbox.checked = Boolean(routineTemplateState[checkbox.dataset.routineTemplate]);
  checkbox.addEventListener("change", () => {
    routineTemplateState[checkbox.dataset.routineTemplate] = checkbox.checked;
    saveStorage(STORAGE_KEYS.routineTemplates, routineTemplateState);
  });
});

document.querySelectorAll(".reset-template").forEach((button) => {
  button.addEventListener("click", () => {
    const prefix = `${button.dataset.resetTemplate}-`;
    document.querySelectorAll("[data-routine-template]").forEach((checkbox) => {
      if (!checkbox.dataset.routineTemplate.startsWith(prefix)) return;
      checkbox.checked = false;
      delete routineTemplateState[checkbox.dataset.routineTemplate];
    });
    saveStorage(STORAGE_KEYS.routineTemplates, routineTemplateState);
  });
});

function renderRoutineProgress() {
  const boxes = [...document.querySelectorAll("[data-routine]")];
  const completed = boxes.filter((box) => box.checked).length;
  document.querySelector("#routine-count").textContent = `${completed}/${boxes.length}`;
  document.querySelector("#routine-progress-fill").style.width = `${boxes.length ? completed / boxes.length * 100 : 0}%`;
  document.querySelector("#routine-progress").setAttribute("aria-label", `${completed} routine${completed === 1 ? "" : "s"} cochée${completed === 1 ? "" : "s"} sur ${boxes.length}`);
  renderHomeOverview();
}

const carouselTrack = document.querySelector("#home-carousel-track");
const carouselSlides = [...carouselTrack.querySelectorAll(".home-carousel-slide")];
const carouselDots = [...document.querySelectorAll("#carousel-pagination button")];
let activeCarouselIndex = 0;
let carouselScrollFrame = 0;

function updateCarouselPosition() {
  const trackLeft = carouselTrack.getBoundingClientRect().left;
  activeCarouselIndex = carouselSlides.reduce((closestIndex, slide, index) => {
    const closestDistance = Math.abs(carouselSlides[closestIndex].getBoundingClientRect().left - trackLeft);
    const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
    return distance < closestDistance ? index : closestIndex;
  }, 0);
  carouselSlides.forEach((slide, index) => {
    const active = index === activeCarouselIndex;
    slide.inert = !active;
    slide.setAttribute("aria-hidden", String(!active));
    carouselDots[index].setAttribute("aria-current", String(active));
  });
  updateCarouselHeight();
}

function updateCarouselHeight() {
  const activeSlide = carouselSlides[activeCarouselIndex];
  if (!activeSlide) return;
  const styles = getComputedStyle(carouselTrack);
  const slideStyles = getComputedStyle(activeSlide);
  const trackPadding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
  const slideMargins = Number.parseFloat(slideStyles.marginTop) + Number.parseFloat(slideStyles.marginBottom);
  carouselTrack.style.height = `${activeSlide.offsetHeight + trackPadding + slideMargins}px`;
}

function showCarouselSlide(index) {
  const nextIndex = Math.max(0, Math.min(index, carouselSlides.length - 1));
  carouselTrack.scrollTo({
    left: carouselSlides[nextIndex].offsetLeft - carouselTrack.offsetLeft,
    behavior: "smooth"
  });
}

carouselTrack.addEventListener("scroll", () => {
  if (carouselScrollFrame) window.cancelAnimationFrame(carouselScrollFrame);
  carouselScrollFrame = window.requestAnimationFrame(() => {
    updateCarouselPosition();
    carouselScrollFrame = 0;
  });
});
carouselTrack.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  showCarouselSlide(activeCarouselIndex + (event.key === "ArrowRight" ? 1 : -1));
});
carouselDots.forEach((dot, index) => dot.addEventListener("click", () => showCarouselSlide(index)));
if ("ResizeObserver" in window) {
  const carouselResizeObserver = new ResizeObserver(updateCarouselHeight);
  carouselSlides.forEach((slide) => carouselResizeObserver.observe(slide));
}
window.addEventListener("resize", updateCarouselPosition);
updateCarouselPosition();

function getCheckinStreak() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (!checkins[getDateKey(start)]) start.setDate(start.getDate() - 1);
  let streak = 0;
  while (checkins[getDateKey(start)]) {
    streak += 1;
    start.setDate(start.getDate() - 1);
  }
  return streak;
}

function renderHomeOverview() {
  const entry = checkins[today];
  const mood = moods.find((item) => item.id === entry?.mood);
  const routineBoxes = [...document.querySelectorAll("[data-routine]")];
  const completedRoutines = routineBoxes.filter((box) => box.checked).length;
  const hasJournal = Boolean(quickNotes.trim()) || journalEntries.some((item) => {
    if (typeof item.createdAt !== "string") return false;
    const createdAt = new Date(item.createdAt);
    return Number.isFinite(createdAt.getTime()) && getDateKey(createdAt) === today;
  });
  document.querySelector("#today-checkin-status").textContent = mood?.label || "à faire";
  document.querySelector("#today-routine-status").textContent = `${completedRoutines} sur ${routineBoxes.length}`;
  document.querySelector("#today-journal-status").textContent = hasJournal ? "note écrite" : "à écrire";
  renderHomeCheckin(entry);

  const bannerText = document.querySelector("#checkin-banner-text");
  const indicator = document.querySelector("#checkin-indicator");
  if (entry) {
    bannerText.textContent = "Point enregistré";
    indicator.classList.add("saved");
  } else {
    bannerText.textContent = "À ton rythme";
    indicator.classList.remove("saved");
  }
  const streak = getCheckinStreak();
  document.querySelector("#checkin-streak").textContent = `${streak} jour${streak === 1 ? "" : "s"}`;
}

function renderHomeCheckin(entry) {
  const mood = moods.find((item) => item.id === entry?.mood);
  const metrics = [
    { key: "mood", value: mood?.value || null, max: 5, label: mood?.label || "Pas renseignée", ring: "mood" },
    { key: "energy", value: Number(entry?.energy) || null, max: 5, label: entry?.energy ? scaleLabels[entry.energy - 1] : "Pas renseignée", ring: "energy" },
    { key: "sensory", value: Number(entry?.sensory) || null, max: 4, label: entry?.sensory ? sensoryLabels[entry.sensory - 1] : "Pas renseignée", ring: "sensory" }
  ];
  const ringDescriptions = [];
  let answered = 0;
  metrics.forEach((metric) => {
    const value = Number.isFinite(metric.value) && metric.value > 0 ? metric.value : null;
    const label = metric.key === "sensory" ? "Charge sensorielle" : metric.key === "mood" ? "Humeur" : "Énergie";
    const valueElement = document.querySelector(`#home-checkin-${metric.key}`);
    const progress = document.querySelector(`#checkin-${metric.key}-progress`);
    const ring = document.querySelector(`#checkin-ring-${metric.ring}`);
    const circumference = 2 * Math.PI * Number(ring.getAttribute("r"));
    valueElement.textContent = metric.label;
    progress.setAttribute("aria-valuemax", String(metric.max));
    progress.setAttribute("aria-valuetext", value === null ? "Pas renseignée" : `${metric.label}, ${value} sur ${metric.max}`);
    if (value === null) {
      progress.removeAttribute("aria-valuenow");
      progress.firstElementChild.style.transform = "scaleX(0)";
      ring.style.strokeDashoffset = String(circumference);
      ring.classList.add("is-empty");
      ringDescriptions.push(`${label} non renseignée`);
      return;
    }
    answered += 1;
    progress.setAttribute("aria-valuenow", String(value));
    progress.firstElementChild.style.transform = `scaleX(${value / metric.max})`;
    ring.style.strokeDashoffset = String(circumference * (1 - value / metric.max));
    ring.classList.remove("is-empty");
    ringDescriptions.push(`${label} ${value} sur ${metric.max}`);
  });
  document.querySelector("#checkin-ring-count").textContent = `${answered}/3`;
  document.querySelector("#checkin-ring-description").textContent = `${ringDescriptions.join(", ")}.`;
}

function setCalmMode(enabled) {
  document.body.classList.toggle("calm-mode", enabled);
  document.querySelectorAll('[data-action="calm"]').forEach((button) => {
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? "Mode calme ouvert" : "Ouvrir le mode calme");
    if (button.classList.contains("quick-action-calm")) button.textContent = enabled ? "Mode calme activé" : "Mode calme";
  });
  saveStorage(STORAGE_KEYS.calmMode, enabled);
}

setCalmMode(readStorage(STORAGE_KEYS.calmMode, false) === true);

const focusDialog = document.querySelector("#focus-dialog");
const focusTask = document.querySelector("#focus-task");
const focusDurationInput = document.querySelector("#focus-duration");
const focusAdvice = document.querySelector("#focus-advice");
const focusTimerOutput = document.querySelector("#focus-timer");
const focusTimerStatus = document.querySelector("#focus-timer-status");
const focusStartButton = document.querySelector("#focus-start");
let focusDurationMinutes = Number(focusDurationInput.value);
let focusRemainingMs = focusDurationMinutes * 60 * 1000;
let focusDeadline = 0;
let focusTimerInterval;

function formatTimer(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateFocusAdvice() {
  const entry = checkins[today] || {};
  const task = focusTask.value.trim();
  let advice = supportPreferenceOptions[supportPreference.value];
  if (entry.energy && entry.energy <= 2) {
    advice = "Ton énergie est basse : rends la tâche minuscule. Préparer le matériel ou commencer une seule étape, c’est déjà suffisant, quelle que soit la durée.";
  } else if (entry.sensory >= 3) {
    advice = "Si tu le peux, réduis une stimulation avant de commencer : notifications, bruit ou lumière. Une seule étape à la fois.";
  } else if (entry.mood === "difficile" || entry.mood === "bof") {
    advice = "Ta journée semble difficile. Choisis la version la plus simple de ta tâche, et rappelle-toi que tu peux arrêter à tout moment.";
  } else if (entry.energy >= 4) {
    advice = "Tu as de l’énergie aujourd’hui : garde le cap sur une seule priorité, sans te sentir obligé·e d’utiliser tout le temps prévu.";
  }
  if (task) advice = `Pour « ${task} », commence par la toute première action visible. Tu peux faire une pause ou t’arrêter quand tu veux.`;
  focusAdvice.textContent = advice;
}

function renderFocusTimer() {
  focusTimerOutput.textContent = formatTimer(focusRemainingMs);
}

function stopFocusTimer(completed = false) {
  window.clearInterval(focusTimerInterval);
  focusTimerInterval = undefined;
  focusDeadline = 0;
  if (completed) {
    focusRemainingMs = 0;
    focusTimerStatus.textContent = "C’est terminé. Même avoir commencé compte.";
    focusStartButton.textContent = "Terminé";
    focusStartButton.disabled = true;
  } else {
    focusTimerStatus.textContent = focusRemainingMs === focusDurationMinutes * 60 * 1000 ? "Prêt quand tu l’es" : "En pause";
    focusStartButton.textContent = focusRemainingMs === focusDurationMinutes * 60 * 1000 ? "Commencer" : "Reprendre";
  }
  renderFocusTimer();
}

function updateFocusTimer() {
  focusRemainingMs = Math.max(0, focusDeadline - Date.now());
  renderFocusTimer();
  if (focusRemainingMs <= 0) stopFocusTimer(true);
}

function startFocusTimer() {
  if (focusTimerInterval || focusStartButton.disabled) return;
  focusDeadline = Date.now() + focusRemainingMs;
  focusTimerStatus.textContent = "Tu avances à ton rythme";
  focusStartButton.textContent = "Mettre en pause";
  focusTimerInterval = window.setInterval(updateFocusTimer, 200);
  updateFocusTimer();
}

function resetFocusTimer() {
  window.clearInterval(focusTimerInterval);
  focusTimerInterval = undefined;
  focusDeadline = 0;
  focusRemainingMs = focusDurationMinutes * 60 * 1000;
  focusStartButton.disabled = false;
  focusStartButton.textContent = "Commencer";
  focusTimerStatus.textContent = "Prêt quand tu l’es";
  renderFocusTimer();
}

function changeFocusDuration() {
  if (!focusDurationInput.checkValidity()) {
    focusDurationInput.reportValidity();
    focusDurationInput.value = String(focusDurationMinutes);
    return;
  }
  focusDurationMinutes = Number(focusDurationInput.value);
  focusRemainingMs = focusDurationMinutes * 60 * 1000;
  focusStartButton.disabled = false;
  focusTimerStatus.textContent = focusTimerInterval ? "Durée ajustée" : "Nouvelle durée prête";
  focusStartButton.textContent = focusTimerInterval ? "Mettre en pause" : "Commencer";
  if (focusTimerInterval) focusDeadline = Date.now() + focusRemainingMs;
  renderFocusTimer();
}

function openFocusDialog() {
  if (!focusDialog.open) {
    focusDialog.showModal();
    updateFocusAdvice();
  }
}

focusTask.addEventListener("input", updateFocusAdvice);
focusDurationInput.addEventListener("change", changeFocusDuration);
focusStartButton.addEventListener("click", () => {
  if (focusTimerInterval) {
    focusRemainingMs = Math.max(0, focusDeadline - Date.now());
    stopFocusTimer(focusRemainingMs <= 0);
    return;
  }
  startFocusTimer();
});
document.querySelector("#focus-reset").addEventListener("click", resetFocusTimer);
document.querySelector('[data-action="timer"]').addEventListener("click", openFocusDialog);
focusDialog.addEventListener("close", () => {
  if (focusTimerInterval) {
    focusRemainingMs = Math.max(0, focusDeadline - Date.now());
    stopFocusTimer(focusRemainingMs <= 0);
  }
});
focusDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    focusDialog.close();
  }
});

const calmDialog = document.querySelector("#calm-dialog");
const groundingPrompts = [
  "Repère une chose que tu peux voir. Laisse simplement ton regard s’y poser.",
  "Remarque deux sensations de contact : tes pieds au sol, ton dos soutenu, ou tes mains.",
  "Écoute un son proche ou lointain, sans avoir besoin de l’identifier.",
  "Si tu en as envie, repère une odeur ou un goût. Tu peux aussi passer cette étape.",
  "Choisis une petite chose dont tu as besoin maintenant : du calme, de l’eau, de l’espace ou du soutien."
];
let groundingIndex = 0;
let calmWasAlreadyActive = false;
let calmBreathRemaining = 60;
let calmBreathInterval;
let calmBreathPhaseInterval;
let calmBreathGrowing = true;
const calmBreathButton = document.querySelector("#calm-breath-button");
const calmBreathOrb = document.querySelector("#calm-breath-orb");

function renderGroundingStep() {
  document.querySelector("#grounding-count").textContent = `${groundingIndex + 1} / ${groundingPrompts.length}`;
  document.querySelector("#grounding-prompt").textContent = groundingPrompts[groundingIndex];
  document.querySelector("#grounding-next").textContent = groundingIndex === groundingPrompts.length - 1 ? "Reprendre depuis le début" : "Passer à l’étape suivante";
}

function stopCalmBreathing(completed = false) {
  window.clearInterval(calmBreathInterval);
  window.clearInterval(calmBreathPhaseInterval);
  calmBreathInterval = undefined;
  calmBreathPhaseInterval = undefined;
  calmBreathOrb.classList.remove("active");
  calmBreathButton.textContent = completed ? "Refaire une minute de respiration" : "Lancer une minute de respiration";
  document.querySelector("#calm-breath-caption").textContent = completed ? "C’est fini. Garde ce rythme si ça t’aide." : "Ou suis doucement le rythme du cercle.";
  document.querySelector("#calm-breath-time").textContent = "";
}

function openCalmDialog() {
  calmWasAlreadyActive = document.body.classList.contains("calm-mode");
  setCalmMode(true);
  if (!calmDialog.open) calmDialog.showModal();
}

document.querySelectorAll('[data-action="calm"]').forEach((button) => {
  button.addEventListener("click", openCalmDialog);
});
document.querySelector("#grounding-next").addEventListener("click", () => {
  groundingIndex = (groundingIndex + 1) % groundingPrompts.length;
  renderGroundingStep();
});
calmBreathButton.addEventListener("click", () => {
  if (calmBreathInterval) {
    stopCalmBreathing();
    return;
  }
  calmBreathRemaining = 60;
  calmBreathGrowing = true;
  calmBreathOrb.classList.add("active");
  calmBreathButton.textContent = "Arrêter la respiration";
  document.querySelector("#calm-breath-caption").textContent = "Inspire doucement…";
  document.querySelector("#calm-breath-time").textContent = "1:00";
  calmBreathInterval = window.setInterval(() => {
    calmBreathRemaining -= 1;
    document.querySelector("#calm-breath-time").textContent = `0:${String(calmBreathRemaining).padStart(2, "0")}`;
    if (calmBreathRemaining <= 0) stopCalmBreathing(true);
  }, 1000);
  calmBreathPhaseInterval = window.setInterval(() => {
    calmBreathGrowing = !calmBreathGrowing;
    calmBreathOrb.classList.toggle("active", calmBreathGrowing);
    document.querySelector("#calm-breath-caption").textContent = calmBreathGrowing ? "Inspire doucement…" : "Expire lentement…";
  }, 4000);
});
calmDialog.addEventListener("close", () => {
  stopCalmBreathing();
  if (!calmWasAlreadyActive) setCalmMode(false);
  groundingIndex = 0;
  renderGroundingStep();
});
calmDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    calmDialog.close();
  }
});
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});
document.querySelector('[data-action="write"]').addEventListener("click", () => {
  showView("journal");
  window.setTimeout(() => document.querySelector("#journal-input").focus({ preventScroll: true }), 250);
});
document.querySelector('[data-action="customize"]').addEventListener("click", () => {
  const preference = document.querySelector("#support-preference");
  showView("aujourdhui");
  showCarouselSlide(4);
  const focusPreference = () => {
    if (activeCarouselIndex === 4) {
      preference.focus({ preventScroll: true });
      return;
    }
    window.setTimeout(focusPreference, 50);
  };
  focusPreference();
});
function renderJournal() {
  const container = document.querySelector("#journal-entries");
  container.replaceChildren();
  if (journalEntries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Rien encore. Un mot suffit pour commencer.";
    container.append(empty);
    renderHomeOverview();
    return;
  }
  [...journalEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).forEach((entry) => {
    const card = document.createElement("article");
    card.className = "card journal-entry";
    const date = document.createElement("time");
    date.dateTime = entry.createdAt;
    date.textContent = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(entry.createdAt));
    const text = document.createElement("p");
    text.textContent = entry.text;
    card.append(date, text);
    container.append(card);
  });
  renderHomeOverview();
}

document.querySelector("#journal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#journal-input");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  journalEntries.push({ id: createId(), text, createdAt: new Date().toISOString() });
  saveStorage(STORAGE_KEYS.journal, journalEntries);
  input.value = "";
  renderJournal();
  renderProgress();
});

const quickNotesInputs = [document.querySelector("#quick-notes")];
quickNotesInputs.forEach((input) => { input.value = quickNotes; });
document.querySelector("#notes-length").textContent = `${quickNotes.length} / 2000`;
let notesSaveTimeout;
quickNotesInputs.forEach((input) => input.addEventListener("input", () => {
  quickNotes = input.value;
  document.querySelector("#notes-length").textContent = `${quickNotes.length} / 2000`;
  document.querySelector("#notes-saved").textContent = "Enregistrement…";
  window.clearTimeout(notesSaveTimeout);
  notesSaveTimeout = window.setTimeout(() => {
    saveStorage(STORAGE_KEYS.notes, quickNotes);
    document.querySelector("#notes-saved").textContent = "Enregistré sur cet appareil";
    renderHomeOverview();
  }, 350);
}));

document.querySelector("#reflection-form").addEventListener("submit", (event) => {
  event.preventDefault();
  reflections[today] = {
    helped: document.querySelector("#reflection-helped").value.trim(),
    proud: document.querySelector("#reflection-proud").value.trim()
  };
  if (!reflections[today].helped && !reflections[today].proud) {
    document.querySelector("#reflection-saved").textContent = "Tu peux noter une chose, ou garder ce moment pour toi.";
    document.querySelector("#reflection-helped").focus();
    return;
  }
  saveStorage(STORAGE_KEYS.reflections, reflections);
  document.querySelector("#reflection-saved").textContent = "Ton petit bilan est gardé sur cet appareil.";
});

function makePostCard(post) {
  const card = document.createElement("article");
  card.className = "card forum-post";
  const interaction = forumInteractions[post.id] || { liked: false, comments: [] };
  const header = document.createElement("div");
  header.className = "post-header";
  const avatar = document.createElement("span");
  avatar.className = `profile-avatar ${post.color || "own-avatar"}`;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = post.avatar || post.author.slice(0, 1).toUpperCase();
  const authorBlock = document.createElement("div");
  authorBlock.className = "post-author";
  const author = document.createElement("strong");
  author.textContent = post.author;
  const timestamp = document.createElement("span");
  timestamp.textContent = post.local ? "À l’instant · privé sur cet appareil" : "Publication d’exemple";
  authorBlock.append(author, timestamp);
  const category = document.createElement("span");
  category.className = "post-category";
  category.textContent = post.category;
  header.append(avatar, authorBlock, category);

  let content;
  if (post.type === "meme") {
    content = document.createElement("div");
    content.className = "meme-card";
    content.dataset.template = post.template || "petit-pas";
    content.setAttribute("role", "img");
    content.setAttribute("aria-label", `Mème : ${post.topText || post.title} ${post.bottomText || ""}`);
    const topText = document.createElement("p");
    topText.className = "meme-card-top";
    topText.textContent = post.topText || post.title;
    const divider = document.createElement("span");
    divider.className = "meme-card-divider";
    divider.setAttribute("aria-hidden", "true");
    divider.textContent = "✳";
    const bottomText = document.createElement("p");
    bottomText.className = "meme-card-bottom";
    bottomText.textContent = post.bottomText || "";
    content.append(topText, divider, bottomText);
  } else {
    content = document.createElement("div");
    content.className = "post-media";
    content.dataset.category = post.category;
    content.setAttribute("role", "img");
    content.setAttribute("aria-label", `Publication de ${post.author} : ${post.title}`);
    const mediaMark = document.createElement("span");
    mediaMark.className = "post-media-mark";
    mediaMark.setAttribute("aria-hidden", "true");
    mediaMark.textContent = post.category === "Sensoriel" ? "☼" : post.category === "Énergie" ? "✧" : "♡";
    const mediaCategory = document.createElement("span");
    mediaCategory.className = "post-media-category";
    mediaCategory.textContent = post.category;
    const mediaTitle = document.createElement("p");
    mediaTitle.className = "post-media-title";
    mediaTitle.textContent = post.local ? "Un petit moment de vie" : post.title;
    content.append(mediaMark, mediaCategory, mediaTitle);
  }
  const actions = document.createElement("div");
  actions.className = "post-actions";
  const reactionButton = document.createElement("button");
  reactionButton.className = `post-action reaction-button${interaction.liked ? " selected" : ""}`;
  reactionButton.type = "button";
  reactionButton.setAttribute("aria-pressed", String(Boolean(interaction.liked)));
  const reactionIcon = document.createElement("span");
  reactionIcon.setAttribute("aria-hidden", "true");
  reactionIcon.textContent = interaction.liked ? "♥" : "♡";
  const reactionLabel = document.createElement("span");
  reactionLabel.textContent = interaction.liked ? "Aimé" : "J’aime";
  reactionButton.append(reactionIcon, reactionLabel);
  reactionButton.addEventListener("click", () => {
    const state = forumInteractions[post.id] || { liked: false, comments: [] };
    state.liked = !state.liked;
    forumInteractions[post.id] = state;
    saveStorage(STORAGE_KEYS.forumInteractions, forumInteractions);
    renderForum();
  });
  const commentButton = document.createElement("button");
  commentButton.className = "post-action comment-toggle";
  commentButton.type = "button";
  const commentIcon = document.createElement("span");
  commentIcon.setAttribute("aria-hidden", "true");
  commentIcon.textContent = "◯";
  const commentLabel = document.createElement("span");
  commentLabel.textContent = `Répondre${interaction.comments.length ? ` · ${interaction.comments.length}` : ""}`;
  commentButton.append(commentIcon, commentLabel);
  actions.append(reactionButton, commentButton);

  const replies = document.createElement("div");
  replies.className = "post-replies";
  replies.hidden = true;
  interaction.comments.forEach((comment) => {
    const reply = document.createElement("div");
    reply.className = "post-reply";
    const replyAvatar = document.createElement("span");
    replyAvatar.className = "profile-avatar own-avatar reply-avatar";
    replyAvatar.textContent = comment.author === "Toi" ? "A" : comment.author.slice(0, 1).toUpperCase();
    const replyText = document.createElement("p");
    const replyAuthor = document.createElement("strong");
    replyAuthor.textContent = comment.author;
    const replyContent = document.createElement("span");
    replyContent.textContent = comment.text;
    replyText.append(replyAuthor, replyContent);
    reply.append(replyAvatar, replyText);
    replies.append(reply);
  });
  const replyForm = document.createElement("form");
  replyForm.className = "reply-form";
  const replyInput = document.createElement("input");
  replyInput.type = "text";
  replyInput.maxLength = 240;
  replyInput.placeholder = "Écrire une réponse bienveillante…";
  replyInput.setAttribute("aria-label", "Écrire une réponse");
  const replySubmit = document.createElement("button");
  replySubmit.type = "submit";
  replySubmit.textContent = "Répondre";
  replyForm.append(replyInput, replySubmit);
  replyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = replyInput.value.trim();
    if (!text) {
      replyInput.focus();
      return;
    }
    const state = forumInteractions[post.id] || { liked: false, comments: [] };
    state.comments.push({ id: createId(), author: "Toi", text, createdAt: new Date().toISOString() });
    forumInteractions[post.id] = state;
    saveStorage(STORAGE_KEYS.forumInteractions, forumInteractions);
    renderForum(categoryFilter);
    const updatedReplies = document.querySelector(`[data-post-id="${post.id}"] .post-replies`);
    if (updatedReplies) updatedReplies.hidden = false;
  });
  replies.append(replyForm);
  commentButton.addEventListener("click", () => {
    replies.hidden = !replies.hidden;
    if (!replies.hidden) replyInput.focus();
  });
  const caption = document.createElement("p");
  caption.className = "post-caption";
  const captionAuthor = document.createElement("strong");
  captionAuthor.textContent = post.author;
  const captionText = document.createElement("span");
  captionText.textContent = post.type === "meme" ? post.title : post.body || post.title;
  caption.append(captionAuthor, captionText);
  const privateNote = document.createElement("span");
  privateNote.className = "interaction-note";
  privateNote.textContent = "Interactions privées · démo";
  card.dataset.postId = post.id;
  card.append(header, content, actions, caption, replies, privateNote);
  return card;
}

function getAllPosts() {
  return [
    ...localPosts.map((post) => ({ ...post, avatar: "A", color: "own-avatar" })),
    ...starterPosts
  ];
}

let categoryFilter = "Tout";
let authorFilter = "";
function renderForum(category = categoryFilter) {
  categoryFilter = category;
  const allPosts = getAllPosts();
  const filtered = allPosts.filter((post) =>
    (category === "Tout" || post.category === category) &&
    (!authorFilter || post.author === authorFilter)
  );
  const list = document.querySelector("#forum-list");
  list.replaceChildren();
  filtered.forEach((post) => list.append(makePostCard(post)));
  if (!filtered.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = authorFilter ? "Aucune publication de ce profil dans ce sujet." : "Aucune publication pour le moment.";
    list.append(emptyState);
  }

}

document.querySelectorAll(".category-button").forEach((button) => {
  button.addEventListener("click", () => {
    authorFilter = "";
    document.querySelectorAll(".story-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".category-button").forEach((item) => item.classList.toggle("active", item === button));
    renderForum(button.dataset.category);
  });
});

document.querySelectorAll(".story-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.storyAuthor === "__create__") {
      authorFilter = "";
      document.querySelectorAll(".story-button").forEach((item) => item.classList.remove("active"));
      renderForum();
      document.querySelector('[data-post-mode="publication"]').click();
      postForm.scrollIntoView({ behavior: "smooth", block: "center" });
      postContent.focus({ preventScroll: true });
      return;
    }
    authorFilter = button.dataset.storyAuthor;
    document.querySelectorAll(".story-button").forEach((item) => item.classList.toggle("active", item === button));
    renderForum();
  });
});

const postForm = document.querySelector("#new-post-form");
let postMode = "publication";
const postContent = document.querySelector("#post-content");
const postCategory = document.querySelector("#post-category");
const memeEditor = document.querySelector("#meme-editor");
const memeTemplate = document.querySelector("#meme-template");
const memeTop = document.querySelector("#meme-top");
const memeBottom = document.querySelector("#meme-bottom");
const memePreview = document.querySelector("#meme-preview");

function updateMemePreview() {
  document.querySelector(".meme-preview-top").textContent = memeTop.value.trim() || "Ton texte du haut apparaîtra ici";
  document.querySelector(".meme-preview-bottom").textContent = memeBottom.value.trim() || "Ton texte du bas apparaîtra ici";
  memePreview.dataset.template = memeTemplate.value;
}

function loadMemeTemplate() {
  const template = memeTemplates[memeTemplate.value];
  if (!template) return;
  memeTop.value = template.top;
  memeBottom.value = template.bottom;
  updateMemePreview();
}

document.querySelectorAll("[data-post-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    postMode = button.dataset.postMode;
    document.querySelectorAll("[data-post-mode]").forEach((modeButton) => {
      modeButton.classList.toggle("active", modeButton === button);
      modeButton.setAttribute("aria-pressed", String(modeButton === button));
    });
    const isMeme = postMode === "meme";
    postContent.hidden = isMeme;
    memeEditor.hidden = !isMeme;
    document.querySelector(".composer-profile > span:last-child").textContent = isMeme ? "Crée un mème qui te ressemble" : "Un petit mot à partager ?";
    postContent.required = !isMeme;
    if (isMeme) {
      postCategory.value = "Mèmes";
      loadMemeTemplate();
    } else {
      if (postCategory.value === "Mèmes") postCategory.value = "Astuces";
      postContent.focus();
    }
  });
});
memeTemplate.addEventListener("change", loadMemeTemplate);
memeTop.addEventListener("input", updateMemePreview);
memeBottom.addEventListener("input", updateMemePreview);

postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const topText = memeTop.value.trim();
  const bottomText = memeBottom.value.trim();
  const text = postMode === "meme" ? `${topText}\n${bottomText}` : postContent.value.trim();
  if (!text) {
    (postMode === "meme" ? memeTop : postContent).focus();
    return;
  }
  if (postMode === "meme" && (!topText || !bottomText)) {
    (topText ? memeBottom : memeTop).focus();
    return;
  }
  const post = {
    id: createId(),
    category: postMode === "meme" ? "Mèmes" : postCategory.value,
    author: "Toi",
    title: text.length > 72 ? `${text.slice(0, 69)}…` : text,
    body: postMode === "meme" ? "" : text,
    local: true
  };
  if (postMode === "meme") {
    post.type = "meme";
    post.topText = topText;
    post.bottomText = bottomText;
    post.template = memeTemplate.value;
  }
  localPosts.unshift(post);
  saveStorage(STORAGE_KEYS.posts, localPosts);
  postForm.reset();
  postMode = "publication";
  document.querySelector('[data-post-mode="publication"]').click();
  authorFilter = "";
  document.querySelectorAll(".story-button").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".category-button").forEach((item) => item.classList.toggle("active", item.dataset.category === "Tout"));
  renderForum("Tout");
  document.querySelector("#post-content").focus();
});

const coachReplies = {
  start: "On peut rendre le premier pas minuscule. Qu’est-ce qui prend le plus de place dans ta tête ? Choisis une seule chose, même si c’est juste te préparer à commencer.",
  sensory: "Si tu le peux, essaie de réduire une stimulation à la fois : baisser la lumière, t’éloigner du bruit ou mettre un casque. Tu peux aussi ne rien faire pendant quelques minutes.",
  priority: "Qu’est-ce qui est vraiment nécessaire aujourd’hui ? Choisis une priorité, puis transforme-la en étape de cinq minutes. Le reste peut attendre.",
  default: "Merci de le partager. Tu n’as pas besoin de tout résoudre maintenant. Quel serait le plus petit pas possible, ou est-ce qu’une pause te ferait du bien ?"
};

function renderCoachMessages() {
  const container = document.querySelector("#chat-messages");
  container.replaceChildren();
  document.querySelector(".coach-intro-message").hidden = coachMessages.length > 0;
  document.querySelector(".prompt-list").hidden = coachMessages.length > 0;
  coachMessages.forEach((message) => {
    const bubble = document.createElement("p");
    bubble.className = `chat-bubble ${message.from === "toi" ? "from-user" : "from-coach"}`;
    bubble.textContent = message.text;
    container.append(bubble);
  });
}

function sendToCoach(text) {
  const prompt = text.trim();
  if (!prompt) return;
  const normalized = prompt.toLocaleLowerCase("fr");
  const reply = normalized.includes("sensoriel") || normalized.includes("surcharge") || normalized.includes("trop fort")
    ? coachReplies.sensory
    : normalized.includes("priorité")
      ? coachReplies.priority
      : normalized.includes("démarrer") || normalized.includes("commencer")
        ? coachReplies.start
        : coachReplies.default;
  coachMessages.push({ from: "toi", text: prompt }, { from: "coach", text: reply });
  saveStorage(STORAGE_KEYS.coach, coachMessages);
  renderCoachMessages();
}

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendToCoach(button.dataset.prompt));
});
document.querySelector("#coach-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#coach-input");
  if (!input.value.trim()) {
    input.focus();
    return;
  }
  sendToCoach(input.value);
  input.value = "";
  input.focus();
});

function average(items) {
  const values = items.filter(Number.isFinite);
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getRecentDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - index - 1));
    return date;
  });
}

function renderMoodEnergyChart(container, chartEntries, ariaLabel, height = 190, xLabels = [], pointRadius = 4) {
  const width = 560;
  const padding = { top: 12, right: 12, bottom: xLabels.length ? 23 : 12, left: 22 };
  const x = (index) => padding.left + index * (width - padding.left - padding.right) / (chartEntries.length - 1);
  const y = (value) => padding.top + (5 - value) * (height - padding.top - padding.bottom) / 4;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", ariaLabel);
  for (let level = 1; level <= 5; level += 1) {
    const line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", String(padding.left));
    line.setAttribute("x2", String(width - padding.right));
    line.setAttribute("y1", String(y(level)));
    line.setAttribute("y2", String(y(level)));
    line.setAttribute("class", "chart-grid-line");
    svg.append(line);
  }
  [
    { key: "mood", className: "chart-mood-line" },
    { key: "energy", className: "chart-energy-line" }
  ].forEach(({ key, className }) => {
    const points = chartEntries.map((entry, index) => entry[key] ? `${x(index)},${y(entry[key])}` : "");
    let activeSegment = [];
    const addSegment = () => {
      if (activeSegment.length > 1) {
        const path = document.createElementNS(svg.namespaceURI, "polyline");
        path.setAttribute("points", activeSegment.join(" "));
        path.setAttribute("class", className);
        svg.append(path);
      }
      activeSegment = [];
    };
    points.forEach((point, index) => {
      if (point) {
        activeSegment.push(point);
        const circle = document.createElementNS(svg.namespaceURI, "circle");
        circle.setAttribute("cx", String(x(index)));
        circle.setAttribute("cy", String(y(chartEntries[index][key])));
        circle.setAttribute("r", String(pointRadius));
        const title = document.createElementNS(svg.namespaceURI, "title");
        title.textContent = `${xLabels[index] || `Jour ${index + 1}`} : ${key === "mood" ? moods[chartEntries[index][key] - 1].label : scaleLabels[chartEntries[index][key] - 1]}`;
        circle.append(title);
        circle.setAttribute("class", className.replace("-line", "-point"));
        svg.append(circle);
      } else {
        addSegment();
      }
    });
    addSegment();
  });
  xLabels.forEach((label, index) => {
    const text = document.createElementNS(svg.namespaceURI, "text");
    text.setAttribute("x", String(x(index)));
    text.setAttribute("y", String(height - 3));
    text.setAttribute("class", "chart-axis-label");
    text.setAttribute("text-anchor", "middle");
    text.textContent = label;
    svg.append(text);
  });
  container.append(svg);
}

function renderProgress() {
  const entries = Object.values(checkins);
  const moodAverage = average(entries.map((entry) => moods.find((mood) => mood.id === entry.mood)?.value));
  const energyAverage = average(entries.map((entry) => Number(entry.energy) || null));
  document.querySelector("#days-tracked").textContent = String(entries.length);
  document.querySelector("#average-mood").textContent = moodAverage === null ? "—" : moods[Math.round(moodAverage) - 1].label;
  document.querySelector("#average-energy").textContent = energyAverage === null ? "—" : scaleLabels[Math.round(energyAverage) - 1];
  document.querySelector("#journal-count").textContent = String(journalEntries.length);

  const days = getRecentDays(14);
  const recent = days.map((date) => ({ date, key: getDateKey(date), entry: checkins[getDateKey(date)] }));
  const tracked = recent.filter((item) => item.entry);
  document.querySelector("#days-summary").textContent = `${tracked.length} jour${tracked.length === 1 ? "" : "s"} sur 14 avec un check-in.`;
  const daysTrack = document.querySelector("#days-track");
  daysTrack.replaceChildren();
  recent.forEach(({ date, key, entry }) => {
    const day = document.createElement("div");
    day.className = `day-mark${entry ? " checked" : ""}`;
    day.setAttribute("aria-label", `${formatToday(date)}${entry ? ", check-in enregistré" : ", aucun check-in"}`);
    const bar = document.createElement("span");
    bar.setAttribute("aria-hidden", "true");
    const label = document.createElement("small");
    label.textContent = String(date.getDate());
    day.append(bar, label);
    daysTrack.append(day);
  });

  const chart = document.querySelector("#chart-wrap");
  const empty = document.querySelector("#chart-empty");
  chart.replaceChildren();
  const chartEntries = recent.map(({ entry }) => ({
    mood: entry ? moods.find((item) => item.id === entry.mood)?.value : null,
    energy: entry ? Number(entry.energy) || null : null
  }));
  const hasChartData = chartEntries.some((entry) => entry.mood || entry.energy);
  empty.hidden = hasChartData;
  if (!hasChartData) return;

  renderMoodEnergyChart(chart, chartEntries, "Graphique des niveaux d’humeur et d’énergie sur les 14 derniers jours");
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});
document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.go));
});

function showView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    const selected = view.id === `view-${viewName}`;
    view.hidden = !selected;
    view.classList.toggle("active", selected);
  });
  document.querySelectorAll("[data-view]").forEach((link) => {
    const selected = link.dataset.view === (viewName === "routines" ? "aujourdhui" : viewName);
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.querySelector("#home-carousel-pagination").hidden = viewName !== "aujourdhui";
  if (viewName === "progres") renderProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

restoreCheckinControls();
updateCoachSuggestion();
updateDailyFocus();
document.querySelector("#focus-saved").textContent = dailyFocus.text ? "Ton intention est déjà gardée pour aujourd’hui." : "À toi de choisir, sans pression.";
renderToolbox();
renderTasks();
renderRoutineProgress();
renderJournal();
renderForum();
renderCoachMessages();
renderProgress();
updateCarouselPosition();
