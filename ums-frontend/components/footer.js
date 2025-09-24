import { ROLES } from '../js/roles.js';

class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="logo">
          <div class="circle">
            <a href="index.html">
              <img src="./assets/images/logo.png" alt="UniManage Logo">
            </a>
          </div>
        </div>
        <nav> 
          <ul>
            <li><a href="#">FaceBook</a></li>
            <li><a href="#">Yotube</a></li>  
            <li><a href="#">Instagram</a></li>
            <li><a href="#">
            Tiktok
            img src="./assets/images/tiktok.png" alt="Tiktok Logo" style="width:20px; height:20px; vertical-align:middle;">
            </a></li>
            <li><a href="">contact.html</a>Contact</li>
          </ul>
        </nav>
      </footer>
    `;
  }
}
customElements.define('footer-app', FootterApp);
