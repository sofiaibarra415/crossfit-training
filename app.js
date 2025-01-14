const workouts = JSON.parse(localStorage.getItem('workouts')) || [];

// DOM Elements
const modal = document.getElementById('modal');
const addWorkoutBtn = document.getElementById('add-workout-btn');
const cancelBtn = document.getElementById('cancel-btn');
const addWorkoutForm = document.getElementById('add-workout-form');
const workoutsContainer = document.getElementById('workouts-container');

// Show modal
addWorkoutBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

// Hide modal
cancelBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Save workouts to localStorage
function saveWorkouts() {
  localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Handle adding a new workout
addWorkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const type = document.getElementById('workout-type').value;
  const description = document.getElementById('workout-description').value;

  const newWorkout = {
    id: workouts.length + 1,
    type,
    description,
    results: [],
  };

  workouts.push(newWorkout);
  saveWorkouts();
  renderWorkouts();
  addWorkoutForm.reset();
  modal.classList.add('hidden');
});

// Render workouts
function renderWorkouts() {
  workoutsContainer.innerHTML = '';

  const amrapSection = document.createElement('div');
  const forTimeSection = document.createElement('div');

  amrapSection.innerHTML = `<h2 class="text-3xl font-bold text-gray-800 mb-4">AMRAP</h2>`;
  forTimeSection.innerHTML = `<h2 class="text-3xl font-bold text-gray-800 mb-4">FOR TIME</h2>`;

  workouts.forEach((workout) => {
    const workoutCard = document.createElement('div');
    workoutCard.className = 'bg-white rounded-lg shadow p-6 mb-4';

    workoutCard.innerHTML = `
      <h2 class="text-2xl font-semibold text-gray-800">Workout ${workout.id}: ${workout.type}</h2>
      <p class="text-gray-600 mb-4">${workout.description}</p>
      <form class="mb-4" onsubmit="handleResult(event, ${workout.id})">
        <div class="block gap-2 mb-2 ">
          <input type="text" id="name-workout-${workout.id}" class="flex-1 p-2 border rounded" placeholder="Your Name" required>
          <br/>
          <br/>
          ${
            workout.type === 'AMRAP'
              ? `<input type="number" id="result-workout-${workout.id}" class="w-20 p-2 border rounded" placeholder="Reps" required>`
              : ` 
              <input type="number" id="hours-workout-${workout.id}" class="w-20 p-2 border rounded" placeholder="HH" min="0" required>
              <input type="number" id="minutes-workout-${workout.id}" class="w-20 p-2 border rounded" placeholder="MM" min="0" max="59" required>
              <input type="number" id="seconds-workout-${workout.id}" class="w-20 p-2 border rounded" placeholder="SS" min="0" max="59" required>
            `
          }
        </div>
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
      </form>
      <h3 class="text-xl font-semibold mb-2">Ranking:</h3>
      <ul id="ranking-workout-${workout.id}" class="space-y-2"></ul>
    `;

    if (workout.type === 'AMRAP') {
      amrapSection.appendChild(workoutCard);
    } else {
      forTimeSection.appendChild(workoutCard);
    }
  });

  workoutsContainer.appendChild(amrapSection);
  workoutsContainer.appendChild(forTimeSection);
}

// Handle result submission
function handleResult(event, workoutId) {
  event.preventDefault();

  const workout = workouts.find((w) => w.id === workoutId);
  const nameInput = document.getElementById(`name-workout-${workoutId}`);
  const name = nameInput.value;

  if (!/^[A-Za-z\s]{3,}$/.test(name)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Name',
      text: 'Name must be at least 3 letters and contain only letters.',
    });
    return;
  }

  let result;
  if (workout.type === 'AMRAP') {
    result = parseInt(document.getElementById(`result-workout-${workoutId}`).value, 10);
  } else {
    const hours = parseInt(document.getElementById(`hours-workout-${workoutId}`).value, 10) || 0;
    const minutes = parseInt(document.getElementById(`minutes-workout-${workoutId}`).value, 10) || 0;
    const seconds = parseInt(document.getElementById(`seconds-workout-${workoutId}`).value, 10) || 0;
    result = hours * 3600 + minutes * 60 + seconds;
  }

  workout.results.push({ name, result });

  if (workout.type === 'AMRAP') {
    workout.results.sort((a, b) => b.result - a.result);
  } else {
    workout.results.sort((a, b) => a.result - b.result);
  }

  saveWorkouts();
  renderRanking(workoutId);

  nameInput.value = '';
  if (workout.type === 'FOR TIME') {
    document.getElementById(`hours-workout-${workoutId}`).value = '';
    document.getElementById(`minutes-workout-${workoutId}`).value = '';
    document.getElementById(`seconds-workout-${workoutId}`).value = '';
  } else {
    document.getElementById(`result-workout-${workoutId}`).value = '';
  }
}

// Render rankings
function renderRanking(workoutId) {
  const workout = workouts.find((w) => w.id === workoutId);
  const rankingList = document.getElementById(`ranking-workout-${workoutId}`);
  rankingList.innerHTML = '';

  workout.results.forEach((entry, index) => {
    const formattedResult =
      workout.type === 'AMRAP'
        ? `${entry.result} reps`
        : new Date(entry.result * 1000).toISOString().substr(11, 8);

    const listItem = document.createElement('li');
    listItem.className = 'flex justify-between bg-gray-100 p-2 rounded';
    listItem.innerHTML = `<span>${index + 1}. ${entry.name}</span><span>${formattedResult}</span>`;
    rankingList.appendChild(listItem);
  });
}

// Initial render
renderWorkouts();
