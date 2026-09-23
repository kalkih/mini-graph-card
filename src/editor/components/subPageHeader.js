import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, css } from 'lit-element';
import { mdiPlus, mdiArrowLeft } from '@mdi/js';

class SubPageHeader extends LitElement {
  static get properties() {
    return {
      name: {},
      adding: { reflect: true },
    };
  }

  render() {
    return html`
      <div class="header">
        <div class="back-title">
          <ha-icon-button
            .path=${mdiArrowLeft}
            @click=${this.goBack}
          ></ha-icon-button>
          <span>${this.name}</span>
        </div>
        ${this.adding ? html`
        <ha-icon-button
        .path=${mdiPlus}
        @click=${this.addRow}
        ></ha-icon-button>
        ` : html``}
      </div>
    `;
  }

  goBack() {
    fireEvent(this, 'go-back');
  }

  addRow() {
    fireEvent(this, 'add-row');
  }

  static get styles() {
    return css`
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .back-title {
        display: flex;
        align-items: center;
        font-size: 18px;
      }
    `;
  }
}

customElements.define('mini-graph-card-subpage-header', SubPageHeader);
