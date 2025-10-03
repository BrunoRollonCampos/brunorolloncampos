// JavaScript for interactivity and accessibility
// This script controls the main navigation, the drop‑down submenu, the
// image carousel and the email sending mechanism.  Interactive elements
// update their ARIA attributes as required and can be operated via
// keyboard (e.g. arrow keys for the carousel).

document.addEventListener('DOMContentLoaded', () => {
  /* Navigation menu toggling for mobile */
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open');
  });

  /* Submenu toggle */
  const submenuToggle = document.querySelector('.submenu-toggle');
  const submenu = document.getElementById('trayectoria-submenu');
  submenuToggle.addEventListener('click', (e) => {
    const parent = e.currentTarget.parentElement;
    const isOpen = parent.classList.contains('open');
    if (isOpen) {
      parent.classList.remove('open');
      submenuToggle.setAttribute('aria-expanded', 'false');
    } else {
      parent.classList.add('open');
      submenuToggle.setAttribute('aria-expanded', 'true');
    }
  });

  /* Close submenu when clicking outside or navigating with Tab */
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.has-submenu')) {
      // close submenu
      const parent = submenuToggle.parentElement;
      parent.classList.remove('open');
      submenuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* Carousel functionality
     --------------------------------------------------
     The carousel shows three images at a time and allows
     continuous navigation in both directions.  Instead of
     cloning elements, we keep a fixed number of list items
     (equal to the number of images visible).  On each
     navigation action we slide the track by one third of
     its width and then rearrange the items in the DOM,
     updating only the image that enters the carousel.  This
     approach avoids jumps and ensures a smooth, infinite
     scrolling experience.
  */
  const track = document.querySelector('.carousel-track');
  const prevButton = document.querySelector('.carousel-control.prev');
  const nextButton = document.querySelector('.carousel-control.next');
  const slidesToShow = 4;
  // Read image data from the initial markup
  const slidesData = Array.from(track.querySelectorAll('li')).map((li) => {
    const img = li.querySelector('img');
    return {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
    };
  });
  // Remove original children from the track
  track.innerHTML = '';
  // Create a fixed set of list items for visible slides
  const items = [];
  for (let i = 0; i < slidesToShow; i++) {
    const li = document.createElement('li');
    li.className = 'carousel-item';
    const img = document.createElement('img');
    li.appendChild(img);
    track.appendChild(li);
    items.push(li);
  }
  // Current index points to the first visible slide in slidesData
  let currentIndex = 0;
  // Flag to prevent overlapping animations
  let isAnimating = false;
  // Each slide occupies 1/`slidesToShow` of the track
  const slideWidthPercent = 100 / slidesToShow;

  // Populate the visible items with the appropriate images
  function updateItems() {
    for (let i = 0; i < slidesToShow; i++) {
      const data = slidesData[(currentIndex + i) % slidesData.length];
      const img = items[i].querySelector('img');
      img.setAttribute('src', data.src);
      img.setAttribute('alt', data.alt);
    }
  }
  // Initial population of items
  updateItems();

  function goToNext() {
    // Advance the index and update visible images.  No animation is used
    // here to keep the navigation simple and free of unintended
    // bouncing effects.
    currentIndex = (currentIndex + 1) % slidesData.length;
    updateItems();
  }

  function goToPrevious() {
    // Move the index backwards and update visible images.  The modulo
    // arithmetic wraps the index around the ends of the slidesData array.
    currentIndex = (currentIndex - 1 + slidesData.length) % slidesData.length;
    updateItems();
  }
  // Attach event listeners for navigation
  prevButton.addEventListener('click', goToPrevious);
  nextButton.addEventListener('click', goToNext);
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    }
  });


  /*
    Image enlargement functionality
    --------------------------------
    When the user clicks on the centre image of the carousel (the element
    with the "active" class), a modal overlay is displayed showing the
    selected image at a larger size.  Clicking anywhere outside the image
    closes the modal.  This improves usability and allows visitors to
    examine portfolio items without distraction.
  */
  const imageModal = document.getElementById('image-modal');
  const modalContent = imageModal.querySelector('.modal-content');
  const modalImage = modalContent.querySelector('img');

  // Helper to open the modal with the clicked image.  The function
  // receives the <img> element that was clicked, uses its source
  // and alt attributes and calculates a modest zoom based on its
  // displayed size.  The enlarged image never exceeds 90% of the
  // viewport dimensions.
  function openModal(imgElement) {
    modalImage.setAttribute('src', imgElement.getAttribute('src'));
    modalImage.setAttribute('alt', imgElement.getAttribute('alt'));

    // Compute the bounding rectangle of the clicked image and apply
    // a moderate zoom (40% larger).  This ensures the enlarged view
    // is slightly bigger than its on‑page size but still fits
    // comfortably within the viewport.
    const rect = imgElement.getBoundingClientRect();
    let desiredWidth = rect.width * 1.8;
    let desiredHeight = rect.height * 1.8;
    // Constrain modal dimensions to a fraction of the viewport
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    const widthRatio = desiredWidth / maxWidth;
    const heightRatio = desiredHeight / maxHeight;
    const scaleDown = Math.max(widthRatio, heightRatio, 1);
    desiredWidth = desiredWidth / scaleDown;
    desiredHeight = desiredHeight / scaleDown;
    modalContent.style.width = `${desiredWidth}px`;
    modalContent.style.height = `${desiredHeight}px`;
    modalImage.style.width = '100%';
    modalImage.style.height = '100%';
    imageModal.classList.add('open');
    imageModal.setAttribute('aria-hidden', 'false');
    //document.body.style.overflow = 'hidden';
    modalContent.focus();
  }

  // Helper to close the modal
  function closeModal() {
    imageModal.classList.remove('open');
    imageModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Reset modal dimensions so next open recalculates size
    modalContent.style.width = '';
    modalContent.style.height = '';
  }

  // Delegate click events from the carousel to handle image enlargement.
  // Instead of attaching listeners to each image individually (which would
  // need to be re-bound whenever the carousel items change), we listen
  // once on the track.  If the user clicks an <img> inside the track, the
  // modal opens with that image.
  track.addEventListener('click', (event) => {
    const target = event.target;
    if (target && target.tagName === 'IMG') {
      openModal(target);
    }
  });

  // Close modal when clicking outside the image
  imageModal.addEventListener('click', (event) => {
    // If the click target is not the image itself, close the modal
    if (!modalContent.contains(event.target)) {
      closeModal();
    }
  });

  /* Contact form submission */
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Gather form values: only subject (asunto) and message
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    // Basic validation
    if (!asunto || !mensaje) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }
    // Define recipient(s) – actual email addresses should be set by the site owner
    const recipients = ['brunorolloncampos@gmail.com'];
    const subject = encodeURIComponent(asunto);
    const body = encodeURIComponent(mensaje);
    // Compose the mailto link
    const mailtoLink = `mailto:${recipients.join(',')}?subject=${subject}&body=${body}`;
    // Open the mailto link in a new window/tab; this triggers the default email client
    window.location.href = mailtoLink;
  });
});