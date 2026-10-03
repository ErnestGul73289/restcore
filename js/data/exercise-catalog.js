(() => {
    window.RehabExercises = [
        {
            name: 'Koci Grzbiet',
            category: 'plecy',
            categoryLabel: 'Kręgosłup',
            description: 'Mobilizuje kręgosłup i rozluźnia napięte mięśnie pleców dzięki kontrolowanemu ruchowi tułowia i głowy.',
            image: '../assets/images/exercise-back-mobility.jpg'
        },
        {
            name: 'Przysiady klasyczne',
            category: 'kolana',
            categoryLabel: 'Kolana / Nogi',
            description: 'Klasyczne ćwiczenie wzmacniające nogi, poprawiające stabilność kolan oraz bioder i wspomagające pracę całego ciała.',
            image: '../assets/images/exercise-squat.jpg'
        },
        {
            name: 'Podnoszenie Hantli',
            category: 'rece',
            categoryLabel: 'Ręce',
            description: 'Izoluje biceps i wzmacnia przedramiona, a przy tym pomaga utrzymać poprawną postawę ramion podczas treningu.',
            image: '../assets/images/exercise-bicep-curl.jpg'
        },
        {
            name: 'Wznosy ramion bokiem',
            category: 'barki',
            categoryLabel: 'Barki',
            description: 'Wzmacnia mięśnie naramienne oraz wspiera poprawę mobilności łopatek i stabilizacji barków w ruchu.',
            image: '../assets/images/exercise-shoulders.jpg'
        },
        {
            name: 'Wznosy nóg leżąc',
            category: 'kolana',
            categoryLabel: 'Kolana / Nogi',
            description: 'Ćwiczenie wzmacniające mięsień czworogłowy bez nadmiernego obciążania stawów, idealne do pracy nad kontrolą ruchu.',
            image: '../assets/images/exercise-legs.jpg'
        },
        {
            name: 'Pompki na klatkę',
            category: 'klatka',
            categoryLabel: 'Klatka / Górna część ciała',
            description: 'Wzmacnia klatkę piersiową, triceps i barki, rozwijając siłę stabilizacji górnej części ciała.',
            image: '../assets/images/exercise-shoulders.jpg'
        },
        {
            name: 'Rozciąganie łydek',
            category: 'kolana',
            categoryLabel: 'Kolana / Nogi',
            description: 'Zwiększa elastyczność mięśni łydek i pomaga poprawić zakres ruchu oraz komfort w codziennym chodzeniu.',
            image: '../assets/images/exercise-legs.jpg'
        },
        {
            name: 'Przyciąganie kolan do klatki',
            category: 'plecy',
            categoryLabel: 'Kręgosłup',
            description: 'Pomaga rozciągać pośladki i dolny odcinek kręgosłupa, wspiera mobilność bioder i poprawę postawy.',
            image: '../assets/images/exercise-back-mobility.jpg'
        },
        {
            name: 'Wspięcia na palce',
            category: 'kolana',
            categoryLabel: 'Kolana / Nogi',
            description: 'Ćwiczenie wzmacniające łydki i stabilizujące staw skokowy podczas chodzenia i ćwiczeń siłowych.',
            image: '../assets/images/exercise-legs.jpg'
        }
    ];

    window.RehabExerciseSeries = [
        {
            id: 'stretch-beginner',
            name: 'Rozciąganie dla początkujących',
            category: 'rozciaganie',
            categoryLabel: 'Rozciąganie',
            description: 'Delikatna seria rozciągająca poprawiająca ruchomość kręgosłupa, bioder i kończyn dolnych bez nadmiernego obciążania.',
            image: '../assets/images/exercise-back-mobility.jpg',
            items: [
                { name: 'Koci Grzbiet', count: 2 },
                { name: 'Rozciąganie łydek', count: 2 },
                { name: 'Przyciąganie kolan do klatki', count: 2 }
            ]
        },
        {
            id: 'strength-advanced',
            name: 'Siła dla zaawansowanych',
            category: 'sila',
            categoryLabel: 'Siła',
            description: 'Trening oparty na ćwiczeniach ogólnorozwojowych, wzmacniający nogi, barki i górną część ciała dla osób z doświadczeniem.',
            image: '../assets/images/exercise-squat.jpg',
            items: [
                { name: 'Przysiady klasyczne', count: 3 },
                { name: 'Pompki na klatkę', count: 2 },
                { name: 'Podnoszenie Hantli', count: 3 },
                { name: 'Wznosy ramion bokiem', count: 2 }
            ]
        },
        {
            id: 'mobility-evening',
            name: 'Mobilność wieczorna',
            category: 'mobilnosc',
            categoryLabel: 'Mobilność',
            description: 'Krótka, regeneracyjna seria ruchowa na zakończenie dnia, skoncentrowana na rozluźnieniu kręgosłupa i stawów.',
            image: '../assets/images/exercise-legs.jpg',
            items: [
                { name: 'Koci Grzbiet', count: 2 },
                { name: 'Wznosy nóg leżąc', count: 2 },
                { name: 'Rozciąganie łydek', count: 2 }
            ]
        }
    ];
})();
