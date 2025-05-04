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

class MtgCard extends HTMLElement {
  constructor() {
    super();
    this.cardPreviewImage = null;
    this.mouseMoveHandler = this.movePreviewImageAccordingToCursorMovement.bind(this);
    this.isVisible = false;
  }

  connectedCallback() {
    this.addEventListener('mouseover', this.showPreviewImageOnMouseHover.bind(this));
    this.addEventListener('mouseout', this.hidePreviewImageOnMouseExiting.bind(this));
  }

  async showPreviewImageOnMouseHover(event) {
    this.isVisible = true;

    this.cardPreviewImage = document.createElement('div');
    this.cardPreviewImage.classList.add('mtg-card-hover-image-container');

    let spinnerLoader = null;

    document.body.appendChild(this.cardPreviewImage);

    document.addEventListener('mousemove', this.mouseMoveHandler);

    const cardName = this.textContent;
    const locallyStoredCardName = `mtg-card:${cardName}`

    if (!localStorage.getItem(locallyStoredCardName)) {
      spinnerLoader = document.createElement('span');
      spinnerLoader.classList.add('spinner-loader')
      this.cardPreviewImage.appendChild(spinnerLoader);

      const apiBaseUrlForExactSearch = 'https://api.scryfall.com/cards/named?exact=';
      const response = await fetch(`${apiBaseUrlForExactSearch}${cardName}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'LordsOfLegacy blog by Fureeish (https://github.com/lordsoflegacy/lordsoflegacy.github.io)'
        }
      });

      const cardData = await response.json();
      const cardImageURI = cardData["image_uris"].normal;

      localStorage.setItem(locallyStoredCardName, cardImageURI);
    }

    // we no longer are hovering over the card name
    if (!this.isVisible) return;

    const cardImage = document.createElement('img');
    cardImage.onload = () => {
        if (spinnerLoader) {
          this.cardPreviewImage.removeChild(spinnerLoader)
        }

        this.cardPreviewImage.appendChild(cardImage);
        setTimeout(() => {
          this.movePreviewImageAccordingToCursorMovement(event)
        }, 0);
    };
    cardImage.src = localStorage.getItem(locallyStoredCardName);
  }

  hidePreviewImageOnMouseExiting() {
    this.isVisible = false;

    if (this.cardPreviewImage) {
      this.cardPreviewImage.remove();
      this.cardPreviewImage = null;

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
