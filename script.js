document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const sectionsToAnimate = document.querySelectorAll('#act-two, #act-three');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // A little more of the element should be visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });

    // Act IV Logic
    const submitButton = document.getElementById('submit-button');
    const userInput = document.getElementById('user-text-input');
    const finalMessage = document.getElementById('final-message');
    const inputContainer = document.querySelector('.input-container');
    const actFour = document.getElementById('act-four');

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const userText = userInput.value.trim();

        if (userText) {
            // 1. Create a new element for the user's text
            const userStory = document.createElement('p');
            userStory.textContent = `"${userText}"`; // Add quotes for style
            userStory.id = 'user-story-text';

            // 2. Insert it before the final message paragraph
            actFour.insertBefore(userStory, finalMessage);

            // 3. Hide the input form
            inputContainer.style.transition = 'opacity 0.5s, transform 0.5s';
            inputContainer.style.opacity = '0';
            inputContainer.style.transform = 'scale(0.9)';
            setTimeout(() => {
                inputContainer.style.display = 'none';
            }, 500);

            // 4. Animate the user's text into view
            setTimeout(() => {
                userStory.classList.add('visible');
            }, 600); // Stagger after the form hides

            // 5. Set and fade in the final message
            finalMessage.textContent = "Happy Birthday, Isha. Keep building your incredible story.";
            setTimeout(() => {
                finalMessage.classList.add('visible');
            }, 2000); // Delay for dramatic effect after user text appears
        }
    });
});
