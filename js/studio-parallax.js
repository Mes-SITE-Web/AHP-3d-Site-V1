document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.studio-video');
    const container = document.querySelector('.studio-video-container');
    
    if (!video || !container) return;

    // Configuration
    const maxRotation = 15; // Degrés de rotation maximum
    const maxMovement = 10; // Mouvement en pixels
    const perspective = 1000; // Profondeur de la perspective
    let isHovering = false;

    // Fonction throttle
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

    // Gestionnaire de mouvement avec effet 3D
    const handleMouseMove = throttle((e) => {
        if (!isHovering) return;

        const rect = container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        // Calcul des rotations et translations
        const rotateY = mouseX * maxRotation;
        const rotateX = -mouseY * maxRotation;
        const translateX = mouseX * maxMovement;
        const translateY = mouseY * maxMovement;

        // Application des transformations avec effet 3D
        video.style.transform = `
            perspective(${perspective}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateX(${translateX}px)
            translateY(${translateY}px)
            scale3d(1.05, 1.05, 1.05)
        `;
    }, 16);

    // Gestionnaires d'événements pour le hover
    container.addEventListener('mouseenter', () => {
        isHovering = true;
        video.style.transition = 'transform 0.2s ease-out';
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
        video.style.transition = 'transform 0.5s ease-out';
        video.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)';
    });

    container.addEventListener('mousemove', handleMouseMove);
});
