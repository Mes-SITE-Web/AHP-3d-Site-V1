document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.studio-video');
    const container = document.querySelector('.studio-video-container');
    
    if (!video || !container) return;

    // Configuration
    const maxRotation = 15; // Degrés de rotation maximum
    const maxMovement = 10; // Mouvement en pixels
    const perspective = 1000; // Profondeur de la perspective
    let isHovering = false;
    let rafId = null;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    const easing = 0.1; // Facteur de lissage

    // Fonction pour une animation fluide
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
        if (!isHovering) return;

        const rect = container.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (event.clientY - rect.top) / rect.height - 0.5;

        // Calcul des rotations et translations cibles
        const targetRotateY = mouseX * maxRotation;
        const targetRotateX = -mouseY * maxRotation;
        const targetTranslateX = mouseX * maxMovement;
        const targetTranslateY = mouseY * maxMovement;

        // Animation fluide
        currentRotateX = lerp(currentRotateX, targetRotateX, easing);
        currentRotateY = lerp(currentRotateY, targetRotateY, easing);
        currentTranslateX = lerp(currentTranslateX, targetTranslateX, easing);
        currentTranslateY = lerp(currentTranslateY, targetTranslateY, easing);

        // Application des transformations avec effet 3D
        video.style.transform = `
            perspective(${perspective}px)
            rotateX(${currentRotateX}deg)
            rotateY(${currentRotateY}deg)
            translateX(${currentTranslateX}px)
            translateY(${currentTranslateY}px)
            scale3d(1.05, 1.05, 1.05)
        `;

        rafId = requestAnimationFrame(animate);
    };

    // Gestionnaires d'événements pour le hover
    container.addEventListener('mouseenter', (e) => {
        isHovering = true;
        event = e; // Stocke l'événement pour l'animation
        video.style.transition = 'none';
        rafId = requestAnimationFrame(animate);
    });

    container.addEventListener('mousemove', (e) => {
        event = e; // Met à jour l'événement pour l'animation
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        video.style.transition = 'transform 0.5s ease-out';
        video.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)';
        currentRotateX = currentRotateY = currentTranslateX = currentTranslateY = 0;
    });
});
