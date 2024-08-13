import { css, html, LitElement } from 'lit-element';
import { mdiClose } from '@mdi/js';
import { fireEvent } from 'custom-card-helpers';
import { localize } from '../../localize/localize';
import './colorSelector';
import './subPageHeader';

const SCHEMA = [
  {
    name: '',
    type: 'grid',
    schema: [
      {
        name: 'value',
        selector: { number: { step: 0.1 } },
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

  computeLabel(schema) {
    return localize(`editor.form.color_thresholds.${schema.name}`, this.hass);
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    if (!this.config) {
      return html`
      <mini-graph-card-subpage-header
        adding=true
        .name=${localize('editor.edit_color_thresholds', this.hass)}
        @go-back=${this.goBack}
        @add-row=${this.addRow}
      ></mini-graph-card-subpage-header>
      `;
    }

    return html`
    <mini-graph-card-subpage-header
      adding=true
      .name=${localize('editor.edit_color_thresholds', this.hass)}
      @go-back=${this.goBack}
      @add-row=${this.addRow}
    ></mini-graph-card-subpage-header>
    <div class="thresholds">
    ${this.config.map((threshold, index) => html`
      <div class="threshold">
      <ha-expansion-panel outlined>
      <span slot="header"><span class="circle-color" style="background-color: ${threshold.color}"></span>${threshold.value}</span>
      <ha-form
        .hass=${this.hass}
        .schema=${SCHEMA}
        .data=${threshold}
        .index=${index}
        .computeLabel=${this.computeLabel}
        @value-changed=${this.valueChanged}
      ></ha-form>
      </ha-expansion-panel>
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
    if (!this.config) {
      fireEvent(this, 'config-changed', [value]);
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
      .threshold-header {
        display: flex;
        gap: 10px;
      }

      .threshold {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      ha-expansion-panel > span {
        display: flex;
        gap: 1rem;
      }

      .threshold > ha-expansion-panel {
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
