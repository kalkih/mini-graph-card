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
      >
      <ha-svg-icon .path=${this.icon}></ha-svg-icon>
      <div class="header">
        ${this.name}
      </div>
      <ha-svg-icon .path=${mdiChevronRight}></ha-svg-icon>
    </div>
    `;
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

      .subElementLink > .header {
        flex: 1;
      }
    `;
  }
}

customElements.define('mini-graph-card-subpage-link', SubPageLink);
