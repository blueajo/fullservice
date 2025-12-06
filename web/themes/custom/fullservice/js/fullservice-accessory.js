// ========================
//  DOT CURSOR
// ========================
// Animated cursor objects
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const animatedCursor = {
    el: cursor,
    dot: cursorDot,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    state: 'default',
    update: function () {
        this.x = mouseX;
        this.y = mouseY;
        this.el.style.left = this.x + 'px';
        this.el.style.top = this.y + 'px';
    },
    setState: function (newState) {
        if (this.state === newState) return;

        // Remove all state classes
        this.dot.classList.remove('default', 'link', 'hidden');

        // Add new state class
        this.dot.classList.add(newState);
        this.state = newState;

    }
};

document.addEventListener('mousemove', () => {
    animatedCursor.addClass('visible');
}, {once: true});

// Mouse move tracking
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    animatedCursor.update();
});

var pointerDown = false;

// Cursor state management
document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a');
    const button = e.target.closest('button, input.button');
    const editable = e.target.closest('input, #message');

    if (animatedCursor.dot.classList.contains('clicking')) return;

    if (link || button) {
        animatedCursor.setState('link');
    } else if ( editable ) {
        animatedCursor.setState('hidden');
    } else {
        animatedCursor.setState('default');
    }
});

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    animatedCursor.update();
});

// Specialized states

window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && !e.toElement) {
        animatedCursor.setState('hidden');
    }
});

document.addEventListener('pointerdown', (e) => {
    animatedCursor.dot.classList.add('clicking');
});

document.addEventListener('pointerup', (e) => {
    animatedCursor.dot.classList.remove('clicking');
});

// Initialize cursor
animatedCursor.update();