document.addEventListener('DOMContentLoaded', () => {
    const coverScreen = document.getElementById('cover-screen');
    const openButton = document.getElementById('open-invitation');
    const container = document.querySelector('.container');

    const backgroundMusic = document.getElementById('background-music');
    const musicControlContainer = document.getElementById('music-control-container');
    const musicControlButton = document.getElementById('music-control');

    openButton.addEventListener('click', () => {
        coverScreen.style.opacity = '0';
        coverScreen.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            coverScreen.style.display = 'none';
            container.style.display = 'block';
            musicControlContainer.style.display = 'block';
            backgroundMusic.play();
            musicControlButton.textContent = 'Pause Music';
        }, 1000); // Match timeout to the CSS transition duration
    });

    musicControlButton.addEventListener('click', () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            musicControlButton.textContent = 'Pause Music';
        } else {
            backgroundMusic.pause();
            musicControlButton.textContent = 'Play Music';
        }
    });

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
                const message = `RSVP\nName: ${guestName}\nAttending: ${attending}`;
                const whatsappUrl = `https://wa.me/917355556366?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');

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