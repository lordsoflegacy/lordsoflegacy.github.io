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
        this.previewImg = null;
        this.mouseMoveHandler = this.moveImage.bind(this);
        this.imageScalePercent = 70;
      }

      connectedCallback() {
        this.addEventListener('mouseover', this.showImage.bind(this));
        this.addEventListener('mouseout', this.hideImage.bind(this));
      }

      // Show the image on mouseover
      async showImage() {
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
        this.previewImg = container;

        // Add event listener to track mouse movement
        document.addEventListener('mousemove', this.mouseMoveHandler);
      }

      // Hide the image on mouseout
      hideImage() {
        if (this.previewImg) {
          this.previewImg.remove();
          this.previewImg = null;

          // Remove the mousemove listener when done
          document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
      }

      // Move the image to the bottom-right (or left) of the cursor
      moveImage(event) {
        if (this.previewImg) {
          const offsetX = 5;
          const offsetY = 5;

          // Get the scaled width and height of the image
          const imgWidth = this.previewImg.offsetWidth;
          const imgHeight = this.previewImg.offsetHeight;

          // Check space on the right and left of the cursor
          const spaceRight = window.innerWidth - event.pageX;
          const spaceDown = window.innerHeight - event.pageY;

          // Position the image to the left if there's not enough space on the right
          if (spaceRight < imgWidth + offsetX) {
            // Position the image to the left of the cursor without extra gap
            this.previewImg.style.left = `${event.pageX - (imgWidth/* * (this.imageScalePercent / 100)*/) - offsetX}px`; // Left of the cursor
          } else {
            this.previewImg.style.left = `${event.pageX + offsetX}px`; // Right of the cursor
          }

          // Position the image vertically based on the cursor
          if (spaceDown < imgHeight + offsetY) {
            this.previewImg.style.top = `${event.pageY - (imgHeight) - offsetY}px`;
          } else {
            this.previewImg.style.top = `${event.pageY + offsetY}px`;
          }
        }
      }
    });
  }
});

