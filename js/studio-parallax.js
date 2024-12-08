document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.studio-video');
    const container = document.querySelector('.studio-video-container');
    
    if (!video || !container) return;

    // Configuration
    const maxRotation = 12; // Réduit légèrement la rotation maximale
    const maxMovement = 8; // Réduit légèrement le mouvement
    const perspective = 1000;
    let isHovering = false;
    let rafId = null;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    const easing = 0.05; // Réduit l'easing pour une transition plus douce

    // Fonction d'interpolation cubique pour un mouvement plus naturel
    const cubicEasing = (t) => t * t * (3 - 2 * t);

    // Fonction pour une animation fluide avec easing cubique
    const lerp = (start, end, factor) => {
        const ease = cubicEasing(factor);
        return start + (end - start) * ease;
    };

    const animate = () => {
        if (!isHovering) return;

        const rect = container.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (event.clientY - rect.top) / rect.height - 0.5;

        // Calcul des rotations et translations cibles avec easing cubique
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

    // Gestionnaires d'événements pour le hover avec transitions douces
    container.addEventListener('mouseenter', (e) => {
        isHovering = true;
        event = e;
        video.style.transition = 'transform 0.2s ease-out'; // Transition douce à l'entrée
        rafId = requestAnimationFrame(animate);
    });

    container.addEventListener('mousemove', (e) => {
        event = e;
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        video.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'; // Transition plus douce à la sortie
        video.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)';
        currentRotateX = currentRotateY = currentTranslateX = currentTranslateY = 0;
    });
});
