document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.studio-video');
    const container = document.querySelector('.studio-video-container');
    
    if (!video || !container) return;

    // Configuration
    const maxMovement = 10; // Réduit à 5px maximum
    let lastUpdate = 0;
    const throttleMs = 16; // environ 60fps

    // Fonction throttle simple
    const throttle = (callback, limit) => {
        let waiting = false;
        return function () {
            if (!waiting) {
                callback.apply(this, arguments);
                waiting = true;
                setTimeout(() => {
                    waiting = false;
                }, limit);
            }
        };
    };

    // Gestionnaire de mouvement simplifié
    const handleMouseMove = throttle((e) => {
        const rect = container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        // Simplifie la transformation en utilisant uniquement translate
        const translateX = mouseX * maxMovement;
        const translateY = mouseY * maxMovement;

        video.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }, throttleMs);

    // Réinitialisation simplifiée
    const handleMouseLeave = () => {
        video.style.transform = 'translate(0, 0)';
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
});
