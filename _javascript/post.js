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

const cardCache = new Map()

document.addEventListener('DOMContentLoaded', function () {
  if (!customElements.get('mtg-card')) {
    customElements.define('mtg-card', class extends HTMLElement {
      constructor() {
        super();
        this.previewImg = null; // Store reference to the image
        this.mouseMoveHandler = this.moveImage.bind(this); // Handler to update position
      }

      connectedCallback() {
        this.addEventListener('mouseover', this.showImage.bind(this));
        this.addEventListener('mouseout', this.hideImage.bind(this));
      }

      // Show the image on mouseover
      async showImage() {
        const baseUrl = 'https://api.scryfall.com/cards/named?exact=';

        // Avoid duplicate fetches
        if (!cardCache.has(this.textContent)) {
          const response = await fetch(`${baseUrl}${this.textContent}`, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'User-Agent': 'Testing for LordsOfLegacyBlog by Fureeish (https://github.com/lordsoflegacy/lordsoflegacy.github.io)'
            }
          });

          const data = await response.json();
          const imageUrl = data["image_uris"].normal;

          cardCache.set(this.textContent, imageUrl);
        }

        // Create the image container
        const container = document.createElement('div');
        container.id = 'mtg-card-hover-image-container';

        // Create the image
        const img = document.createElement('img');
        img.src = cardCache.get(this.textContent);
        img.style.maxWidth = '70%';
        img.style.maxHeight = 'auto';

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

      // Move the image to the bottom-right of the cursor
      moveImage(event) {
        if (this.previewImg) {
          const offsetX = 20; // Distance from cursor to image
          const offsetY = 20;

          // Set the position relative to the mouse cursor
          this.previewImg.style.left = `${event.pageX + offsetX}px`;
          this.previewImg.style.top = `${event.pageY + offsetY}px`;
        }
      }
    });
  }
});


