import { mdiArrowLeft, mdiEye } from '@mdi/js';
import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, css } from 'lit-element';
import { localize } from '../localize/localize';
import './colorSelector';

const SCHEMA = [
  {
    name: '',
    type: 'grid',
    schema: [
      {
        name: 'entity',
        selector: { entity: {} },
      },
      {
        name: 'attribute',
        selector: { attribute: {} },
        context: { filter_entity: 'entity' },
      },
      {
        name: 'name',
        selector: { text: {} },
      },
      {
        name: 'color',
        selector: { hex_color: { clearable: true } },
      },
      {
        name: 'state_adaptive_color',
        selector: { boolean: {} },
      },
      {
        name: 'unit',
        selector: { text: {} },
      },
      {
        name: 'aggregate_func',
        selector: {
          select: {
            options: [
              { label: 'Average', value: 'avg' },
              { label: 'Median', value: 'median' },
              { label: 'Minimum', value: 'min' },
              { label: 'Maximum', value: 'max' },
              { label: 'First', value: 'first' },
              { label: 'Last', value: 'last' },
              { label: 'Sum', value: 'sum' },
            ],
            mode: 'dropdown',
          },
        },
      },
    ],
  },
  {
    name: '',
    type: 'expandable',
    iconPath: mdiEye,
    title: 'Display',
    schema: [
      {
        name: '',
        type: 'grid',
        schema: [
          {
            name: 'show_state',
            selector: { boolean: {} },
          },
          {
            name: 'show_indicator',
            selector: { boolean: {} },
          },
          {
            name: 'show_graph',
            selector: { boolean: {} },
          },
          {
            name: 'show_line',
            selector: { boolean: {} },
          },
          {
            name: 'show_fill',
            selector: { boolean: {} },
          },
          {
            name: 'show_points',
            selector: { boolean: {} },
          },
          {
            name: 'show_legend',
            selector: { boolean: {} },
          },
          {
            name: 'show_adaptive_color',
            selector: { boolean: {} },
          },
          {
            name: 'smoothing',
            selector: { boolean: {} },
          },
        ],
      },
    ],
  },
  {
    name: 'y_axis',
    selector: {
      select: {
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ],
      },
    },
  },
];

class EntityEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
    };
  }

  computeLabel(schema) {
    const localized = this.hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    if (localized === '') {
      return localize(`editor.form.entity.${schema.name}`, this.hass);
    } else {
      return localized;
    }
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const isObject = typeof this.config === 'object';

    const DATA = {
      entity: this.config,
    };

    return html`
      <div class="header">
        <div class="back-title">
          <ha-icon-button
            .path=${mdiArrowLeft}
            @click=${this.goBack}
          ></ha-icon-button>
          <span>${localize('editor.edit_entity', this.hass)}</span>
        </div>
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${isObject ? this.config : DATA}
        .schema=${SCHEMA}
        .computeLabel=${this.computeLabel}
        @value-changed=${this.valueChanged}
      ></ha-form>
      `;
  }

  goBack() {
    fireEvent(this, 'go-back');
  }

  valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }
    const target = ev.target || '';

    const value = target.checked !== undefined ? target.checked : ev.detail.value;

    fireEvent(this, 'config-changed', value);
  }

  static get styles() {
    return css`
      .back-title {
        display: flex;
        align-items: center;
        font-size: 18px;
      }
    `;
  }
}

customElements.define('mini-graph-card-entity-editor', EntityEditor);
