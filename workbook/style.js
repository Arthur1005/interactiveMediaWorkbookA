const workspace = document.getElementById('projectWorkspace');
const modal = document.getElementById('modalOverlay');
const modalGallery = document.getElementById('modalGallery');
const modalTitle = document.getElementById('modalTitle');
const modalNotesPanel = document.getElementById('modalNotesPanel');
const notesToggleBtn  = document.getElementById('notesToggleBtn');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const btnResize = document.getElementById('btnResize');
const btnRotation = document.getElementById('btnRotation');
const btnGrid = document.getElementById('btnGrid');
const btnChaos = document.getElementById('btnChaos');
const btn2A = document.getElementById('btn2a');
const btn2B = document.getElementById('btn2b');

let currentCategory = null;
let step = 0;
let placeholder = document.createElement('div');
placeholder.className = 'dropPlaceholder';


let cursorX = 0;
let cursorY = 0;


function getAllCards() {
    return Array.from(document.querySelectorAll('.projectCard'));
}

function getVisibleCards() {
    return getAllCards().filter(card => !card.classList.contains('inactiveCategory'));
}

function updateVisibility() {
    const allCards = getAllCards();
    allCards.forEach(card => {
        const isMatch = currentCategory === null ||
                        (currentCategory === '2A' && card.classList.contains('dataCat2a')) ||
                        (currentCategory === '2B' && card.classList.contains('dataCat2b'));

        if (step < 3) card.style.display = 'block';

        if (isMatch) {
            card.classList.remove('inactiveCategory');
            card.style.zIndex = "10";
        } else {
            card.classList.add('inactiveCategory');
            card.style.zIndex = "0";
        }

        
    });

    if (step === 3) {
        applyGridLayout();
    }
}

function randomizeLayout() {
    step = 0;
    workspace.classList.remove('gridActive');
    const allCards = getAllCards();

    allCards.forEach((card) => {
        card.style.display = 'block';
        const randomTop = 10 + Math.random() * 65;
        const randomLeft = 10 + Math.random() * 70;
        const randomRotation = Math.floor(Math.random() * 80) - 40;
        const randomScale = 0.5 + Math.random() * 0.4;

        card.style.position = 'absolute';
        card.style.top = `${randomTop}%`;
        card.style.left = `${randomLeft}%`;
        card.style.transform = `rotate(${randomRotation}deg) scale(${randomScale})`;
        card.style.width = '320px';
    });

    btnResize.className = "controlBtn btnActiveGlow";
    btnRotation.className = "controlBtn btnDisabled";
    btnGrid.className = "controlBtn btnDisabled";
}

function handleResize() {
    if (step !== 0) return;
    step = 1;
    const allCards = getAllCards();
    allCards.forEach(card => {
        const currentTransform = card.style.transform;
        const rotateMatch = currentTransform.match(/rotate\([^)]+\)/);
        card.style.transform = rotateMatch ? `${rotateMatch[0]} scale(1)` : 'scale(1)';
    });
    btnResize.className = "controlBtn btnMuted";
    btnRotation.className = "controlBtn btnActiveGlow";
}

function handleRotation() {
    if (step !== 1) return;
    step = 2;
    const allCards = getAllCards();
    allCards.forEach(card => {
        card.style.transform = 'rotate(0deg) scale(1)';
    });
    btnRotation.className = "controlBtn btnMuted";
    btnGrid.className = "controlBtn btnActiveGlow";
}

function handleGrid() {
    if (step !== 2) return;
    step = 3;
    applyGridLayout();
    btnGrid.className = "controlBtn btnGridDone";
}

function applyGridLayout() {
    workspace.classList.add('gridActive');
    const allCards = getAllCards();
    allCards.forEach(card => {
        const isMatch = currentCategory === null ||
                        (currentCategory === '2A' && card.classList.contains('dataCat2a')) ||
                        (currentCategory === '2B' && card.classList.contains('dataCat2b'));

        if (isMatch) {
            card.style.display = 'block';
            card.style.position = 'relative';
            card.style.top = 'auto';
            card.style.left = 'auto';
            card.style.transform = 'none';
            card.style.width = '100%';
            card.classList.remove('inactiveCategory');
        } else {
            card.style.display = 'none';
            card.style.position = 'absolute';
            card.classList.add('inactiveCategory');
        }
    });
}


function openModal(card) {
    const galleryEls = Array.from(card.querySelectorAll('.cardGallery img, .cardGallery video'));
    const slides = galleryEls.length > 0
        ? galleryEls.map(el => el.tagName === 'VIDEO'
            ? `<div class="modalImageSlide"><video class="modalImage" src="${el.src}" autoplay loop muted></video></div>`
            : `<div class="modalImageSlide"><img class="modalImage" alt="Detail" src="${el.src}"/></div>`)
        : [`<div class="modalImageSlide"><img class="modalImage" alt="Detail" src="${card.dataset.img}"/></div>`];
    modalGallery.innerHTML = slides.join('');
    modalTitle.innerText = card.dataset.title;
    modalCategory.innerText = card.dataset.category ?? `Workbook ${card.classList.contains('dataCat2a') ? 'A' : 'B'}`;
    const descEl = card.querySelector('.cardDescription');
    modalDescription.innerHTML = descEl ? descEl.innerHTML : '';
    modal.classList.add('active');

    modalGallery.addEventListener('mouseenter', () => { isOverImg = true; });
    modalGallery.addEventListener('mouseleave', () => { isOverImg = false; });

    requestAnimationFrame(() => {
        const paneHeight = document.querySelector('.modalMediaPane').clientHeight;
        modalGallery.querySelectorAll('.modalImageSlide').forEach(slide => {
            slide.style.height = paneHeight + 'px';
        });
    });
}

function closeModal() {
    modal.classList.remove('active');
    modalNotesPanel.classList.remove('active');
    isOverImg = false;

    notesToggleBtn.classList.remove('active');
    setTimeout(() => {
        modalGallery.innerHTML = '';
    }, 300);
}

modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });


let draggedElement = null;
let startX = 0;
let startY = 0;
let isDragging = false;
let offset = { x: 0, y: 0 };
const THRESHOLD = 8;

workspace.addEventListener('mousedown', (e) => {
    const card = e.target.closest('.projectCard');
    if (!card || card.classList.contains('inactiveCategory')) return;

    draggedElement = card;
    startX = e.clientX;
    startY = e.clientY;

    const rect = card.getBoundingClientRect();
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
});

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;

    if (!draggedElement) return;

    const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));

    if (!isDragging && dist > THRESHOLD) {
        isDragging = true;
        draggedElement.classList.add('dragging');

        if (step === 3) {
            draggedElement.after(placeholder);
            draggedElement.style.position = 'fixed';
            draggedElement.style.width = `${placeholder.offsetWidth}px`;
            draggedElement.style.height = `${placeholder.offsetHeight}px`;
            draggedElement.style.zIndex = "1000";
        }
    }

    if (isDragging) {
        if (step < 3) {
            const wsRect = workspace.getBoundingClientRect();
            const leftPercent = ((e.clientX - offset.x - wsRect.left) / wsRect.width) * 100;
            const topPercent = ((e.clientY - offset.y - wsRect.top) / wsRect.height) * 100;
            draggedElement.style.left = `${leftPercent}%`;
            draggedElement.style.top = `${topPercent}%`;
        } else {
            draggedElement.style.left = `${e.clientX - offset.x}px`;
            draggedElement.style.top = `${e.clientY - offset.y}px`;

            const visibleCards = getVisibleCards();
            let hoveredCard = null;

            for (let card of visibleCards) {
                if (card === draggedElement) continue;
                const rect = card.getBoundingClientRect();
                if (e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top && e.clientY < rect.bottom) {
                    hoveredCard = card;
                    break;
                }
            }

            if (hoveredCard) {
                const rect = hoveredCard.getBoundingClientRect();
                const isAfter = (e.clientX > rect.left + rect.width / 2);
                if (isAfter) {
                    hoveredCard.after(placeholder);
                } else {
                    hoveredCard.before(placeholder);
                }
            }
        }
    }
});

document.addEventListener('mouseup', () => {
    if (!draggedElement) return;

    // disable for now, I'll turn it back on when workbook B is relavent :)
    if (!isDragging && !draggedElement.classList.contains('dataCat2b')) {
        openModal(draggedElement);
    } else {
        if (step === 3) {
            placeholder.replaceWith(draggedElement);
            draggedElement.style.position = 'relative';
            draggedElement.style.width = '100%';
            draggedElement.style.left = 'auto';
            draggedElement.style.top = 'auto';
            draggedElement.style.zIndex = "10";
        }
    }

    draggedElement.classList.remove('dragging');
    draggedElement = null;
    isDragging = false;
    if (placeholder.parentNode) placeholder.remove();
});


function openCategory(event, category) {
    currentCategory = category;
    document.querySelectorAll('.catBtn').forEach(btn => {
        btn.classList.remove('catBtnActiveGreen');
        btn.classList.add('catBtnInactive');
    });
    event.currentTarget.classList.remove('catBtnInactive');
    event.currentTarget.classList.add('catBtnActiveGreen');
    updateVisibility();
}

btn2A.addEventListener('click', (e) => openCategory(e, '2A'));
btn2B.addEventListener('click', (e) => openCategory(e, '2B'));


notesToggleBtn.onclick = () => {
    if (modalNotesPanel.classList.contains('active')) {
        modalNotesPanel.classList.remove('active');
        notesToggleBtn.classList.remove('active');
    } else {
        modalNotesPanel.classList.add('active');
        notesToggleBtn.classList.add('active');
    }
};

btnResize.addEventListener('click', handleResize);
btnRotation.addEventListener('click', handleRotation);
btnGrid.addEventListener('click', handleGrid);
btnChaos.addEventListener('click', () => { randomizeLayout(); updateVisibility(); });

let isOverB = false;
let isOverImg = false;

window.addEventListener('load', () => {
    randomizeLayout();

    document.querySelectorAll('.projectCard').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('inactiveCategory')) {
                card.style.zIndex = '100';
            }
        });
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('inactiveCategory')) {
                card.style.zIndex = '10';
            }
        });
    });

    document.querySelectorAll('.dataCat2b').forEach(card => {
        card.addEventListener('mouseenter', () => { isOverB = true; });
        card.addEventListener('mouseleave', () => { isOverB = false; });
    });

    document.querySelectorAll('.cardGallery').forEach(img => {
        const imgs = img.querySelectorAll('img');
        if (imgs.length > 1) {
            img.addEventListener('mouseenter', () => { isOverImg = true; });
            img.addEventListener('mouseleave', () => { isOverImg = false; });
        };
    });


});




// p5
function setup() {
   let canvas = createCanvas(windowWidth, windowHeight);
   canvas.style("position", "fixed");
   canvas.style("top", "0");
   canvas.style("left", "0");
   canvas.style("z-index", "1000");
   canvas.style("pointer-events", "none");
}

function draw() {  
  fill('#2ff801');
  noStroke();
  clear();
  circle(pmouseX, pmouseY, 10);

  if (isOverB) {
        noAccess();
  }

  if (isOverImg && modal.classList.contains('active')) {
    scrollDown();
  }
}

function noAccess() {
    textSize(16);
    rectMode(CENTER);

    fill(255, 255, 255);
    noStroke();
    rect(mouseX - 2, mouseY - 2, 200, 40);

    fill('#2ff801');
    textAlign(CENTER, CENTER);
    text('No Access Now', mouseX, mouseY);
}

function scrollDown() {
    textSize(16);
    rectMode(CENTER);

    fill(0, 0, 0);
    noStroke();
    rect(mouseX - 2, mouseY - 2, 200, 40);

    fill('#2ff801');
    textAlign(CENTER, CENTER);
    text('Scroll Down', mouseX, mouseY);
}




// Declaration

// I acknowledge the use of Stitch to draft my website's initial layout, and I build beyond that; 12 hours image is made on the purpose of experimentation with Stitch.
// I acknowledge the use of Claude to fetch code from my other project; answer questions when I asked; indentify bug in code; change large amount of code at once (e.g. path of images).
// I prompted the model to ask me clarifying questions about my draft and the flow of my logic. I used the output to refine my central thesis statement and to decide how to order the argument for my essay.
// A full record of prompts and outputs is available upon request.