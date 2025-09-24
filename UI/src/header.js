// header-component.js
class MyHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `

      <header>
        <nav>
          <ul>
            <li><a href="index.html">Trang chủ</a></li>
            <li><a href="about.html">Giới thiệu</a></li>
            <li><a href="contact.html">Liên hệ</a></li>
          </ul>
        </nav>
      </header>
    `;
  }
}

customElements.define('my-header', MyHeader);
