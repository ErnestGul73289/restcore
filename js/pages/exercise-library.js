(() => {
    const filterButtons = document.querySelectorAll('.btn-filter');
    const libraryTabs = document.querySelectorAll('.library-tab');
    const exerciseFilters = document.getElementById('exerciseFilters');
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

    function createSeriesCard(series) {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.dataset.cat = series.category;

        const image = document.createElement('img');
        image.src = series.image;
        image.className = 'exercise-img';
        image.alt = series.name;

        const body = document.createElement('div');
        body.className = 'exercise-body';

        const category = document.createElement('span');
        category.className = 'exercise-category';
        category.textContent = series.categoryLabel;

        const title = document.createElement('h5');
        title.className = 'exercise-title';
        title.textContent = series.name;

        const description = document.createElement('p');
        description.className = 'small text-muted';
        description.textContent = series.description;

        const meta = document.createElement('div');
        meta.className = 'series-meta small text-muted mb-3';
        const itemsText = series.items.map(item => `${item.name} ×${item.count}`).join(' · ');
        meta.textContent = itemsText;

        const addButton = document.createElement('button');
        addButton.className = 'btn-play';
        addButton.type = 'button';
        addButton.textContent = 'DODAJ PROGRAM';
        addButton.addEventListener('click', () => addSeriesToToday(series, addButton));

        body.append(category, title, description, meta, addButton);
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

    function addSeriesToToday(series, button) {
        let addedCount = 0;
        const todayKey = window.RehabSchedule.dateKey(new Date());

        series.items.forEach(item => {
            addedCount += window.RehabSchedule.addExerciseEntries(todayKey, item.name, item.count, true);
        });

        const originalText = button.textContent;
        button.textContent = addedCount > 0 ? 'DODANO PROGRAM' : 'JUŻ W PLANIE';
        button.style.background = addedCount > 0 ? '#28a745' : '#6c757d';
        window.setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 800);
    }

    function renderExerciseCards() {
        const exerciseCards = Array.from(window.RehabExercises).map(exercise => createExerciseCard(exercise));
        exerciseGrid.replaceChildren(...exerciseCards);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(filterButton => filterButton.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;

            exerciseGrid.querySelectorAll('.exercise-card').forEach(card => {
                const matchesFilter = category === 'all' || category === card.dataset.cat;
                card.classList.toggle('hidden', !matchesFilter);
            });
        });
    });

    function renderSeriesCards() {
        const seriesCards = (window.RehabExerciseSeries || []).map(series => createSeriesCard(series));
        exerciseGrid.replaceChildren(...seriesCards);
    }

    function setActiveView(view) {
        const isSeriesView = view === 'series';
        libraryTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
        exerciseFilters.hidden = isSeriesView;
        if (isSeriesView) {
            renderSeriesCards();
            return;
        }
        renderExerciseCards();
    }

    libraryTabs.forEach(tab => {
        tab.addEventListener('click', () => setActiveView(tab.dataset.view));
    });

    setActiveView('exercises');
})();
