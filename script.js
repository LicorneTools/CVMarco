// Configuration
const CONFIG = {
    animationSpeed: 0.4,
    parallaxIntensity: 0.05,
    scrollThreshold: 0.1
};

// Éléments DOM
const elements = {
    mainMenu: document.getElementById('main-menu'),
    cvSection: document.getElementById('cv-section'),
    letterSection: document.getElementById('letter-section'),
    cvBtn: document.getElementById('cv-btn'),
    letterBtn: document.getElementById('letter-btn'),
    backFromCv: document.getElementById('back-from-cv'),
    backFromLetter: document.getElementById('back-from-letter'),
    cvOption: document.getElementById('cv-option'),
    letterOption: document.getElementById('letter-option')
};

// État de l'application
const state = {
    currentSection: 'menu',
    isAnimating: false,
    parallaxEnabled: window.innerWidth > 768,
    scrollY: 0
};

// Initialisation
function init() {
    console.log('Initialisation du système de présentation...');
    
    // Configuration des événements
    setupEventListeners();
    
    // Initialisation des animations
    initAnimations();
    
    // Optimisation des performances
    optimizePerformance();
    
    console.log('Système prêt pour l\'interaction');
}

// Configuration des événements
function setupEventListeners() {
    // Navigation vers CV
    elements.cvBtn.addEventListener('click', () => navigateTo('cv'));
    elements.cvOption.addEventListener('click', () => navigateTo('cv'));
    
    // Navigation vers Lettre
    elements.letterBtn.addEventListener('click', () => navigateTo('letter'));
    elements.letterOption.addEventListener('click', () => navigateTo('letter'));
    
    // Navigation retour
    elements.backFromCv.addEventListener('click', () => navigateTo('menu'));
    elements.backFromLetter.addEventListener('click', () => navigateTo('menu'));
    
    // Parallax sur les cartes du menu
    if (state.parallaxEnabled) {
        document.addEventListener('mousemove', handleParallax);
    }
    
    // Adaptation au redimensionnement
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Gestion du scroll pour les animations
    window.addEventListener('scroll', debounce(handleScroll, 16));
    
    // Touch events pour mobile
    document.addEventListener('touchstart', () => {
        state.parallaxEnabled = false;
    });
}

// Navigation entre sections
function navigateTo(section) {
    if (state.isAnimating || state.currentSection === section) return;
    
    state.isAnimating = true;
    const previousSection = state.currentSection;
    state.currentSection = section;
    
    // Masquer la section actuelle
    hideSection(previousSection);
    
    // Afficher la nouvelle section après un délai
    setTimeout(() => {
        showSection(section);
        state.isAnimating = false;
    }, 300);
}

function hideSection(section) {
    const sectionMap = {
        'menu': elements.mainMenu,
        'cv': elements.cvSection,
        'letter': elements.letterSection
    };
    
    const element = sectionMap[section];
    if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.display = 'none';
        }, 300);
    }
}

function showSection(section) {
    const sectionMap = {
        'menu': elements.mainMenu,
        'cv': elements.cvSection,
        'letter': elements.letterSection
    };
    
    const element = sectionMap[section];
    if (element) {
        element.style.display = 'block';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.transition = `opacity ${CONFIG.animationSpeed}s ease, transform ${CONFIG.animationSpeed}s ease`;
            
            // Animer les éléments de la nouvelle section
            if (section === 'cv') {
                animateCVElements();
            } else if (section === 'letter') {
                animateLetterElements();
            }
        }, 50);
    }
}

// Effet parallax sur les cartes du menu
function handleParallax(e) {
    if (!state.parallaxEnabled) return;
    
    const menuOptions = document.querySelectorAll('.menu-option');
    if (!menuOptions.length) return;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (e.clientX - centerX) * CONFIG.parallaxIntensity;
    const moveY = (e.clientY - centerY) * CONFIG.parallaxIntensity;
    
    requestAnimationFrame(() => {
        menuOptions.forEach((option, index) => {
            const intensity = 1 + (index * 0.1);
            option.style.transform = `
                translateY(-8px)
                perspective(1000px)
                rotateY(${moveX * intensity}deg)
                rotateX(${-moveY * intensity}deg)
            `;
        });
    });
}

// Animation des éléments du CV
function animateCVElements() {
    const elements = [
        ...document.querySelectorAll('.cv-card'),
        ...document.querySelectorAll('.timeline-item'),
        ...document.querySelectorAll('.rotary-card'),
        ...document.querySelectorAll('.gallery-item')
    ];
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    });
}

// Animation des éléments de la lettre
function animateLetterElements() {
    const elements = document.querySelectorAll('.letter-block');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    });
}

// Gestion du redimensionnement
function handleResize() {
    state.parallaxEnabled = window.innerWidth > 768;
    
    // Ajuster la hauteur des cartes du menu
    const menuOptions = document.querySelectorAll('.menu-option');
    if (window.innerWidth <= 768) {
        menuOptions.forEach(option => {
            option.style.height = '320px';
        });
    } else {
        menuOptions.forEach(option => {
            option.style.height = '380px';
        });
    }
}

// Gestion du scroll
function handleScroll() {
    state.scrollY = window.scrollY;
    
    // Effet de parallax léger sur le background
    const overlay = document.querySelector('.section-overlay');
    if (overlay) {
        const yPos = state.scrollY * 0.3;
        overlay.style.transform = `translateY(${yPos}px)`;
    }
}

// Initialisation des animations d'intersection
function initAnimations() {
    const observerOptions = {
        threshold: CONFIG.scrollThreshold,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observer les éléments
    document.querySelectorAll('.cv-card, .timeline-item, .gallery-item, .letter-block').forEach(element => {
        observer.observe(element);
    });
}

// Optimisation des performances
function optimizePerformance() {
    // Préchargement des images
    const images = ['img2.jpg', 'img3.jpg', 'img4.jpg'];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Optimisation pour mobile
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
        
        // Désactiver les animations lourdes sur mobile
        document.querySelectorAll('.menu-option, .cv-card').forEach(el => {
            el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        });
    }
}

// Fonction debounce pour optimiser les événements
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', init);

// Cleanup sur déchargement
window.addEventListener('beforeunload', () => {
    // Nettoyer les event listeners si nécessaire
    document.removeEventListener('mousemove', handleParallax);
});