(() => {
    const filterButtons = document.querySelectorAll('.btn-filter');
    const exerciseGrid = document.getElementById('exerciseGrid');

    function createExerciseCard(exercise) {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.dataset.cat = exercise.category;

        const image = document.createElement('img');
        image.src = exercise.image;
        image.className = 'exercise-img';
        image.alt = exercise.name;

        const body = document.createElement('div');
        body.className = 'exercise-body';

        const category = document.createElement('span');
        category.className = 'exercise-category';
        category.textContent = exercise.categoryLabel;

        const title = document.createElement('h5');
        title.className = 'exercise-title';
        title.textContent = exercise.name;

        const description = document.createElement('p');
        description.className = 'small text-muted';
        description.textContent = exercise.description;

        const addButton = document.createElement('button');
        addButton.className = 'btn-play';
        addButton.type = 'button';
        addButton.textContent = 'START';
        addButton.addEventListener('click', () => addExerciseToToday(exercise.name, addButton));

        body.append(category, title, description, addButton);
        card.append(image, body);
        return card;
    }

    function addExerciseToToday(exerciseName, button) {
        const wasAdded = window.RehabSchedule.addExercise(
            window.RehabSchedule.dateKey(new Date()),
            exerciseName
        );
        const originalText = button.textContent;
        button.textContent = wasAdded ? 'DODANO NA DZIŚ' : 'JUŻ W PLANIE';
        button.style.background = wasAdded ? '#28a745' : '#6c757d';
        window.setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 800);
    }

    window.RehabExercises.forEach(exercise => {
        exerciseGrid.appendChild(createExerciseCard(exercise));
    });

    const exerciseCards = exerciseGrid.querySelectorAll('.exercise-card');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(filterButton => filterButton.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;

            exerciseCards.forEach(card => {
                const matchesFilter = category === 'all' || category === card.dataset.cat;
                card.classList.toggle('hidden', !matchesFilter);
            });
        });
    });
})();
