import { mdiArrowLeft } from '@mdi/js';
import { fireEvent } from 'custom-card-helpers';
import { LitElement, html } from 'lit-element';

class EntityEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
    };
  }

  render() {
    return html`
      <div class="header">
        <div class="back-title">
          <ha-icon-button
            .path=${mdiArrowLeft}
            @click=${this.goBack}
          ></ha-icon-button
        </div>
      </div>
      `;
  }

  goBack() {
    fireEvent(this, 'go-back');
  }
}

customElements.define('mini-graph-card-entity-editor', EntityEditor);
