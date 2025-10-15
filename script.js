document.addEventListener('DOMContentLoaded', () => {
    const coverScreen = document.getElementById('cover-screen');
    const openButton = document.getElementById('open-invitation');
    const container = document.querySelector('.container');

    const musicControlContainer = document.getElementById('music-control-container');
    const musicControlButton = document.getElementById('music-control');

    openButton.addEventListener('click', () => {
        coverScreen.style.opacity = '0';
        coverScreen.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            coverScreen.style.display = 'none';
            container.style.display = 'block';
            musicControlContainer.style.display = 'block';
            startMusic();
            musicControlButton.textContent = 'Pause Music';
        }, 1000); // Match timeout to the CSS transition duration
    });

    musicControlButton.addEventListener('click', () => {
        if (isPlaying) {
            stopMusic();
            musicControlButton.textContent = 'Play Music';
        } else {
            startMusic();
            musicControlButton.textContent = 'Pause Music';
        }
    });

    // Web Audio API for Procedural Music
    let audioCtx;
    let oscillator;
    let gainNode;
    let isPlaying = false;
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    let noteIndex = 0;
    let musicInterval;

    function playNote() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(notes[noteIndex % notes.length], audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.8);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.8);

        noteIndex++;
    }

    function startMusic() {
        if (isPlaying) return;
        isPlaying = true;
        playNote();
        musicInterval = setInterval(playNote, 600);
    }

    function stopMusic() {
        if (!isPlaying) return;
        isPlaying = false;
        clearInterval(musicInterval);
    }

    // Google Calendar Integration
    const addToCalendarButton = document.getElementById('addToCalendar');
    if (addToCalendarButton) {
        addToCalendarButton.addEventListener('click', (e) => {
            e.preventDefault();

            // Event details
            const eventName = "Wedding of Isha & Aarav";
            // Dates in YYYYMMDDTHHMMSSZ format. Note: This is in UTC.
            // Assuming the event is from 6:00 PM to 11:00 PM IST on Dec 28, 2024.
            // IST is UTC+5:30. So, 6:00 PM IST is 12:30 UTC.
            const eventStartDate = "20241228T123000Z";
            const eventEndDate = "20241228T173000Z";
            const eventLocation = "The Grand Palace, New Delhi";
            const eventDescription = "Join us to celebrate the wedding of Isha and Aarav.\n\nSchedule:\nMehendi: Saturday, 27th Dec, 4:00 PM\nSangeet: Saturday, 27th Dec, 7:00 PM\nWedding Ceremony: Sunday, 28th Dec, 6:00 PM\nReception: Sunday, 28th Dec, 8:00 PM";

            // Construct Google Calendar URL
            const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${eventStartDate}/${eventEndDate}&location=${encodeURIComponent(eventLocation)}&details=${encodeURIComponent(eventDescription)}`;

            // Open the URL in a new tab
            window.open(googleCalendarUrl, '_blank');
        });
    }

    // RSVP Form Handling
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSuccess = document.getElementById('rsvpSuccess');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const guestName = document.getElementById('guestName').value;
            const attending = document.getElementById('attending').value;

            if (guestName && attending) {
                // This is a serverless approach for a static site.
                // It constructs a mailto link to send the RSVP details to the host.
                const subject = "Wedding RSVP";
                const body = `Name: ${guestName}\nAttending: ${attending}`;
                window.location.href = `mailto:rsvp@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                // Hide the form and show the success message
                rsvpForm.style.display = 'none';
                rsvpSuccess.style.display = 'block';
            } else {
                // A more subtle way to ask for completion
                alert('Please fill in your name and whether you will be attending.');
            }
        });
    }
});