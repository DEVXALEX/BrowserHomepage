(function (app) {
    // Curated list of 100+ Inspiring Quotes
    // Focusing on motivation, depth, and actionable wisdom.
    const QUOTES = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It invariably produces the same effect: the more you give, the more you have.", author: "Antoine de Saint-Exupéry" },
        { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
        { text: "Do not wait for the perfect moment, take the moment and make it perfect.", author: "Unknown" },
        { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
        { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
        { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
        { text: "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.", author: "Bil Keane" },
        { text: "Your limitation—it's only your imagination.", author: "Unknown" },
        { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
        { text: "Great things never come from comfort zones.", author: "Unknown" },
        { text: "Dream it. Wish it. Do it.", author: "Unknown" },
        { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
        { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
        { text: "Dream bigger. Do bigger.", author: "Unknown" },
        { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
        { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
        { text: "Do something today that your future self will thank you for.", author: "Unknown" },
        { text: "Little things make big days.", author: "Unknown" },
        { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
        { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
        { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
        { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
        { text: "Dream it. Believe it. Build it.", author: "Unknown" },
        { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "Act as if what you do makes a difference. It does.", author: "William James" },
        { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
        { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
        { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
        { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
        { text: "If you are not willing to risk the usual, you will have to settle for the ordinary.", author: "Jim Rohn" },
        { text: "Stop chasing the money and start chasing the passion.", author: "Tony Hsieh" },
        { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
        { text: "Success is the sum of small efforts, repeated day-in and day-out.", author: "Robert Collier" },
        { text: "Courage is resistance to fear, mastery of fear--not absence of fear.", author: "Mark Twain" },
        { text: "Only put off until tomorrow what you are willing to die having left undone.", author: "Pablo Picasso" },
        { text: "We become what we think about.", author: "Earl Nightingale" },
        { text: "The mind is everything. What you think you become.", author: "Buddha" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        { text: "An unexamined life is not worth living.", author: "Socrates" },
        { text: "Eighty percent of success is showing up.", author: "Woody Allen" },
        { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
        { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
        { text: "Every child is an artist. The problem is how to remain an artist once he grows up.", author: "Pablo Picasso" },
        { text: "You can never cross the ocean until you have the courage to lose sight of the shore.", author: "Christopher Columbus" },
        { text: "Two roads diverged in a wood, and I—I took the one less traveled by, And that has made all the difference.", author: "Robert Frost" },
        { text: "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.", author: "Johann Wolfgang von Goethe" },
        { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
        { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
        { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
        { text: "Life isn't about getting and having, it's about giving and being.", author: "Kevin Kruse" },
        { text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart" },
        { text: "Definiteness of purpose is the starting point of all achievement.", author: "W. Clement Stone" },
        { text: "Life is 10% what happens to me and 90% of how I react to it.", author: "Charles Swindoll" },
        { text: "If you do what you've always done, you'll get what you've always gotten.", author: "Tony Robbins" },
        { text: "Dreaming, after all, is a form of planning.", author: "Gloria Steinem" },
        { text: "You may be disappointed if you fail, but you are doomed if you don't try.", author: "Beverly Sills" },
        { text: "Remember that not getting what you want is sometimes a wonderful stroke of luck.", author: "Dalai Lama" },
        { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
        { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
        { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu" },
        { text: "The question isn't who is going to let me; it's who is going to stop me.", author: "Ayn Rand" },
        { text: "Winning passes, but the will to win endures.", author: "Unknown" },
        { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't judge each day by the harvest you reap but by the seeds that you plant.", author: "Robert Louis Stevenson" },
        { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
        { text: "The power of imagination makes us infinite.", author: "John Muir" },
        { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
        { text: "Light tomorrow with today.", author: "Elizabeth Barrett Browning" },
        { text: "Preparation is the key to success.", author: "Alexander Graham Bell" }
    ];

    let quoteBag = [];

    app.initQuote = function () {
        const quoteDisplay = document.getElementById('quote');
        if (!quoteDisplay) return;

        // Initialize bag from storage if available, else new
        loadQuoteBag();

        // Make quote clickable
        quoteDisplay.style.cursor = 'pointer';
        quoteDisplay.title = 'Click for new inspiration';

        // Initial quote
        displayNextQuote();

        // Click to refresh
        quoteDisplay.addEventListener('click', () => {
            animateQuoteChange();
        });
    };

    function loadQuoteBag() {
        const savedBag = app.Storage.get('quoteBag', []);
        if (savedBag && savedBag.length > 0) {
            quoteBag = savedBag;
        } else {
            fillQuoteBag();
        }
    }

    function fillQuoteBag() {
        // Create an array of indices [0, 1, 2, ..., N]
        quoteBag = Array.from({ length: QUOTES.length }, (_, i) => i);
        shuffleArray(quoteBag);
        saveQuoteBag();
    }

    function saveQuoteBag() {
        app.Storage.set('quoteBag', quoteBag);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getNextQuote() {
        if (quoteBag.length === 0) {
            fillQuoteBag();
        }
        const index = quoteBag.pop();
        saveQuoteBag(); // Save state after popping
        return QUOTES[index];
    }

    function displayNextQuote() {
        const quoteDisplay = document.getElementById('quote');
        const quote = getNextQuote();
        quoteDisplay.textContent = `"${quote.text}" - ${quote.author}`;
    }

    function animateQuoteChange() {
        const quoteDisplay = document.getElementById('quote');
        quoteDisplay.style.opacity = '0';
        quoteDisplay.style.transform = 'translateY(-5px)';

        setTimeout(() => {
            displayNextQuote();
            quoteDisplay.style.opacity = '1';
            quoteDisplay.style.transform = 'translateY(0)';
        }, 200);
    }

})(window.Homepage = window.Homepage || {});
