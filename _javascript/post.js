import {basic, initTopbar, initSidebar} from './modules/layouts';

import {
  loadImg,
  imgPopup,
  initLocaleDatetime,
  initClipboard,
  initToc,
  loadMermaid
} from './modules/components';

loadImg();
initToc();
imgPopup();
initSidebar();
initLocaleDatetime();
initClipboard();
initTopbar();
loadMermaid();
basic();

// const cardCache = new Map();

class MtgCard extends HTMLElement {
  constructor() {
    super();
    this.cardPreviewImage = null;
    this.mouseMoveHandler = this.movePreviewImageAccordingToCursorMovement.bind(this);
    this.isVisible = false;
  }

  connectedCallback() {
    this.addEventListener('mouseover', this.showPreviewImageOnMouseHover.bind(this));
    this.addEventListener('mouseout', this.hidePreviewImageOnMouseHover.bind(this));
  }

  async showPreviewImageOnMouseHover(event) {
    this.isVisible = true;

    // Create the image container
    const container = document.createElement('div');
    container.classList.add('mtg-card-hover-image-container');

    let spinnerLoader = null;

    document.body.appendChild(container);

    // Store the reference to the image for removal later
    this.cardPreviewImage = container;

    // Add event listener to track mouse movement
    document.addEventListener('mousemove', this.mouseMoveHandler);

    const cardName = this.textContent;
    const locallyStoredCardName = `mtg-card:${cardName}`

    if (!localStorage.getItem(locallyStoredCardName)) {
      spinnerLoader = document.createElement('span');
      spinnerLoader.classList.add('spinner-loader')
      container.appendChild(spinnerLoader);

      const baseUrl = 'https://api.scryfall.com/cards/named?exact=';
      const response = await fetch(`${baseUrl}${cardName}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Testing for LordsOfLegacyBlog by Fureeish (https://github.com/lordsoflegacy/lordsoflegacy.github.io)'
        }
      });

      const data = await response.json();
      const imageUrl = data["image_uris"].normal;

      localStorage.setItem(locallyStoredCardName, imageUrl);
    }

    if (!this.isVisible) return;

    // Create the image
    const img = document.createElement('img');
    img.onload = () => {
        if (spinnerLoader) {
          container.removeChild(spinnerLoader)
        }
        container.appendChild(img);
        setTimeout(() => {
          this.movePreviewImageAccordingToCursorMovement(event)
        }, 0);
    };
    img.src = localStorage.getItem(locallyStoredCardName);
  }

  // Hide the image on mouseout
  hidePreviewImageOnMouseHover() {
    this.isVisible = false;
    if (this.cardPreviewImage) {
      this.cardPreviewImage.remove();
      this.cardPreviewImage = null;

      // Remove the mousemove listener when done
      document.removeEventListener('mousemove', this.mouseMoveHandler);
    }
  }

  movePreviewImageAccordingToCursorMovement(event) {
    if (!this.isVisible) return;

    if (this.cardPreviewImage) {
      const xOffsetFromCursor = 5;
      const yOffsetFromCursor = 5;

      const imageWidth = this.cardPreviewImage.offsetWidth;
      const imageHeight = this.cardPreviewImage.offsetHeight;

      // By default, the preview image is displayed in the bottom-right offset
      const freeSpaceToTheRight = window.innerWidth - event.pageX;
      const freeSpaceBelow = window.innerHeight - event.clientY;

      if (freeSpaceToTheRight < imageWidth + xOffsetFromCursor) {
        this.cardPreviewImage.style.left = `${event.pageX - imageWidth - xOffsetFromCursor}px`;
      } else {
        this.cardPreviewImage.style.left = `${event.pageX + xOffsetFromCursor}px`;
      }

      if (freeSpaceBelow < imageHeight + yOffsetFromCursor) {
        this.cardPreviewImage.style.top = `${event.pageY - imageHeight - yOffsetFromCursor}px`;
      } else {
        this.cardPreviewImage.style.top = `${event.pageY + yOffsetFromCursor}px`;
      }
    }
  }
}

if (!customElements.get('mtg-card')) {
  customElements.define('mtg-card', MtgCard);
}
