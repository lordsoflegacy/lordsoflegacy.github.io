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

document.addEventListener('DOMContentLoaded', function () {
  if (!customElements.get('mtg-card')) {
    customElements.define('mtg-card', class extends HTMLElement {
      connectedCallback() {
        this.addEventListener('mouseover', async () => {
          const baseUrl = 'https://api.scryfall.com/cards/named?exact='

          const response = await fetch(`${baseUrl}Forging the Anchor`, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'User-Agent': 'Testing for LordsOfLegacyBlog by Fureeish (https://github.com/lordsoflegacy/lordsoflegacy.github.io)'
            }
          })

          console.log(response)
        });
      }
    });
  }
});
