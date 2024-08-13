import { fireEvent } from 'custom-card-helpers';
import { LitElement, css, html } from 'lit-element';
import { mdiClose } from '@mdi/js';
import { localize } from '../../localize/localize';
import './subPageHeader';

const SCHEMA = [
  {
    name: '',
    type: 'grid',
    schema: [
      {
        name: 'value',
        selector: { text: {} },
      },
      {
        name: 'label',
        selector: { text: {} },
      },
    ],
  },
];

class StateMapEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
    };
  }

  render() {
    if (!this.hass) {
      return html``;
    }
    if (!this.config) {
      return html`
      <mini-graph-card-subpage-header
        adding=true
        .name=${localize('editor.edit_state_map', this.hass)}
        @go-back=${this.goBack}
        @add-row=${this.addRow}
      ></mini-graph-card-subpage-header>
      `;
    }

    return html`
    <mini-graph-card-subpage-header
      adding=true
      .name=${localize('editor.edit_state_map', this.hass)}
      @go-back=${this.goBack}
      @add-row=${this.addRow}
    ></mini-graph-card-subpage-header>
    <div class="state-maps">
    ${this.config.map((state_map, index) => html`
      <div class="state-map">
        <ha-form
          .hass=${this.hass}
          .schema=${SCHEMA}
          .data=${state_map}
          .index=${index}
          @value-changed=${this.valueChanged}
        ></ha-form>
        <ha-icon-button
        .label=${this.hass.localize('ui.components.entity.entity-picker.clear')}
        .path=${mdiClose}
        .index=${index}
        @click=${this.removeRow}
        ></ha-icon-button>
      </div>
    `)}
    </div>
    `;
  }

  goBack() {
    fireEvent(this, 'go-back');
  }

  addRow() {
    const value = { value: '', label: '' };
    if (!this.config) {
      fireEvent(this, 'config-changed', [value]);
      return;
    }
    fireEvent(this, 'config-changed', [...this.config, value]);
  }

  removeRow(ev) {
    ev.stopPropagation();
    if (!this.config || !this.hass) {
      return;
    }
    const index = (ev.currentTarget).index || '';
    const newStateMaps = this.config.concat();

    newStateMaps.splice(index, 1);

    fireEvent(this, 'config-changed', newStateMaps);
  }

  valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }
    const value = ev.detail.value || '';
    const index = (ev.target).index || 0;
    const newStateMaps = this.config.concat();

    newStateMaps[index] = value;

    fireEvent(this, 'config-changed', newStateMaps);
  }

  static get styles() {
    return css`
    .state-map {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .state-map > ha-form {
      flex-grow: 1;
    }
    `;
  }
}

customElements.define('state-map-editor', StateMapEditor);
