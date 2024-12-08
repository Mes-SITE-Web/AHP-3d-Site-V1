document.addEventListener('DOMContentLoaded', () => {
    // Configuration de l'Intersection Observer
    const observerOptions = {
        root: null, // utilise le viewport
        rootMargin: '0px',
        threshold: 0.3 // déclenche quand 30% de l'élément est visible
    };

    const handleIntersection = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Une fois animé, on arrête d'observer
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observer la section studio
    const studioSection = document.querySelector('.section-2-studio');
    if (studioSection) {
        observer.observe(studioSection);
        console.log('Observing studio section');
    } else {
        console.log('Studio section not found');
    }
});
