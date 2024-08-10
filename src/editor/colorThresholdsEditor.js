import { css, html, LitElement } from 'lit-element';
import { mdiArrowLeft, mdiClose, mdiPlus } from '@mdi/js';
import { fireEvent } from 'custom-card-helpers';
import './colorSelector';

const SCHEMA = [
  {
    name: '',
    type: 'grid',
    schema: [
      {
        name: 'value',
        selector: { number: {} },
      },
      {
        name: 'color',
        selector: { hex_color: {} },
      },
    ],
  },
];

class ColorThresholdsEditor extends LitElement {
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
      <div class="header">
        <div class="back-title">
          <ha-icon-button
              .path=${mdiArrowLeft}
              @click=${this.goBack}
          ></ha-icon-button>
        </div>
        <ha-icon-button
          .path=${mdiPlus}
          @click=${this.addRow}
        ></ha-icon-button>
      </div>`;
    }

    return html`
    <div class="header">
      <div class="back-title">
        <ha-icon-button
            .path=${mdiArrowLeft}
            @click=${this.goBack}
        ></ha-icon-button>
      </div>
      <ha-icon-button
        .path=${mdiPlus}
        @click=${this.addRow}
      ></ha-icon-button>
    </div>
    <div class="thresholds">
    ${this.config.map((threshold, index) => html`
      <div class="threshold">
      <ha-form
        .hass=${this.hass}
        .schema=${SCHEMA}
        .data=${threshold}
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

  removeRow(ev) {
    ev.stopPropagation();
    if (!this.config || !this.hass) {
      return;
    }
    const index = (ev.currentTarget).index || '';
    const newColorThresholds = this.config.concat();

    newColorThresholds.splice(index, 1);

    fireEvent(this, 'config-changed', newColorThresholds);
  }

  addRow(ev) {
    ev.stopPropagation();
    const value = { value: 0, color: '#000000' };
    if (!this.config || !this.hass) {
      return;
    }
    fireEvent(this, 'config-changed', [...this.config, value]);
  }

  valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }
    const value = ev.detail.value || '';
    const index = (ev.target).index || 0;
    const newColorThresholds = this.config.concat();

    newColorThresholds[index] = value;

    fireEvent(this, 'config-changed', newColorThresholds);
  }

  static get styles() {
    return css`
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .threshold-header {
        display: flex;
        gap: 10px;
      }

      .threshold {
        display: flex;
        align-items: center;
      }

      .threshold > ha-form {
        flex-grow: 1;
      }

      .circle-color {
        display: block;
        background-color: #ffffff;
        border-radius: 10px;
        width: 20px;
        height: 20px;
      }
    `;
  }
}

customElements.define('color-thresholds-editor', ColorThresholdsEditor);
