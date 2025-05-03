import { basic, initTopbar, initSidebar } from './modules/layouts';

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

const cardCache = new Map();

document.addEventListener('DOMContentLoaded', function () {
  if (!customElements.get('mtg-card')) {
    customElements.define('mtg-card', class extends HTMLElement {
      constructor() {
        super();
        this.cardPreviewImage = null;
        this.mouseMoveHandler = this.movePreviewImageAccordingToCursorMovement.bind(this);
      }

      connectedCallback() {
        this.addEventListener('mouseover', this.showPreviewImageOnMouseHover.bind(this));
        this.addEventListener('mouseout', this.hidePreviewImageOnMouseHover.bind(this));
      }

      async showPreviewImageOnMouseHover() {
        const cardName = this.textContent;

        if (!cardCache.has(cardName)) {
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

          cardCache.set(cardName, imageUrl);
        }

        // Create the image container
        const container = document.createElement('div');
        container.id = 'mtg-card-hover-image-container';

        // Create the image
        const img = document.createElement('img');
        img.src = cardCache.get(this.textContent);

        // Apply the scaling to the image
        // img.style.width = `${this.imageScalePercent}%`;
        // img.style.width = `${this.imageScalePercent}%`;
        // img.style.height = 'auto'; // Explicit height to maintain aspect
        // img.style.display = 'block'; // Remove stray spacing

        // Append image to container and container to body
        container.appendChild(img);
        document.body.appendChild(container);

        // Store the reference to the image for removal later
        this.cardPreviewImage = container;

        // Add event listener to track mouse movement
        document.addEventListener('mousemove', this.mouseMoveHandler);
      }

      // Hide the image on mouseout
      hidePreviewImageOnMouseHover() {
        if (this.cardPreviewImage) {
          this.cardPreviewImage.remove();
          this.cardPreviewImage = null;

          // Remove the mousemove listener when done
          document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
      }

      movePreviewImageAccordingToCursorMovement(event) {
        if (this.cardPreviewImage) {
          const xOffsetFromCursor = 5;
          const yOffsetFromCursor = 5;

          const imageWidth  = this.cardPreviewImage.offsetWidth;
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
    });
  }
});

