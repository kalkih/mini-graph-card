import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, css } from 'lit-element';
import { mdiChevronRight } from '@mdi/js';

class SubPageLink extends LitElement {
  static get properties() {
    return {
      name: {},
      icon: {},
    };
  }

  render() {
    return html`
    <div class="subElementLink"
      @click=${this.openPage}
      @keydown=${this.openPage}
      @focus=${this.focusChanged}
      @blur=${this.focusChanged}
      tabindex="0"
      role="button"
      >
      <ha-svg-icon .path=${this.icon}></ha-svg-icon>
      <div class="header">
        ${this.name}
      </div>
      <ha-svg-icon .path=${mdiChevronRight}></ha-svg-icon>
    </div>
    `;
  }

  focusChanged(ev) {
    this.shadowRoot.querySelector('.subElementLink').classList.toggle(
      'focused',
      ev.type === 'focus',
    );
  }

  openPage() {
    fireEvent(this, 'click');
  }

  static get styles() {
    return css`
      .subElementLink {
        display: flex;
        width: 100%;
        min-height: 48px;
        gap: 1rem;
        align-items: center;
        cursor: pointer;
        margin-top: 24px;
      }

      .subElementLink ha-svg-icon {
        color: var(--secondary-text-color);
        margin-left: 1rem;
      }

      .subElementLink > .header {
        flex: 1;
      }
    `;
  }
}

customElements.define('mini-graph-card-subpage-link', SubPageLink);
