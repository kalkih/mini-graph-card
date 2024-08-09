import { fireEvent } from 'custom-card-helpers';
import { LitElement, html } from 'lit-element';
import './entitiesEditor';
import './entityEditor';
import { mdiAlignHorizontalLeft, mdiEye, mdiPalette } from '@mdi/js';
import { localize } from '../localize/localize';

const SCHEMA = [
  {
    name: '',
    type: 'expandable',
    iconPath: mdiPalette,
    title: 'Appearance',
    schema: [
      {
        name: '',
        type: 'grid',
        schema: [
          {
            name: 'name',
            label: 'Name',
            selector: { text: {} },
          },
          {
            name: 'icon',
            selector: { icon: {} },
          },
          {
            name: 'unit',
            selector: { text: {} },
          },
          {
            name: 'hour24',
            selector: { boolean: {} },
          },
          {
            type: 'integer',
            name: 'hours_to_show',
            default: 24,
          },
          {
            type: 'float',
            name: 'points_per_hour',
            default: 0.5,
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
          {
            name: 'group_by',
            selector: {
              select: {
                options: [
                  { label: 'Interval', value: 'interval' },
                  { label: 'Date', value: 'date' },
                  { label: 'Hour', value: 'hour' },
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
        iconPath: mdiAlignHorizontalLeft,
        title: 'Alignment',
        schema: [
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'align_header',
                selector: {
                  select: {
                    options: [
                      { label: 'Default', value: 'default' },
                      { label: 'Left', value: 'left' },
                      { label: 'Right', value: 'right' },
                      { label: 'Center', value: 'center' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'align_icon',
                selector: {
                  select: {
                    options: [
                      { label: 'Left', value: 'left' },
                      { label: 'Right', value: 'right' },
                      { label: 'State', value: 'state' },
                    ],
                    mode: 'dropdown',
                    default: 'right',
                  },
                },
              },
              {
                name: 'align_state',
                selector: {
                  select: {
                    options: [
                      { label: 'Left', value: 'left' },
                      { label: 'Right', value: 'right' },
                      { label: 'Center', value: 'center' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        name: 'show',
        type: 'expandable',
        iconPath: mdiEye,
        title: 'Display',
        schema: [
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'name',
                selector: { boolean: {} },
              },
              {
                name: 'icon',
                selector: { boolean: {} },
              },
              {
                name: 'state',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Last', value: 'last' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'graph',
                selector: {
                  select: {
                    options: [
                      { label: 'Line', value: 'line' },
                      { label: 'Bar', value: 'bar' },
                      { label: 'Hide', value: false },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'fill',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Fade', value: 'fade' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'points',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'legend',
                selector: { boolean: {} },
              },
              {
                name: 'average',
                selector: { boolean: {} },
              },
              {
                name: 'extrema',
                selector: { boolean: {} },
              },
              {
                name: 'labels',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'labels_secondary',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'name_adaptive_color',
                selector: { boolean: {} },
              },
              {
                name: 'icon_adaptive_color',
                selector: { boolean: {} },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'tap_action',
    selector: { ui_action: {} },
  },
];

class MiniGraphCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      subElementEditorConfig: {},
    };
  }

  setConfig(config) {
    this._config = config;
    this._entities = config.entities;
  }

  valueChanged(ev) {
    const config = ev.detail.value || '';
    if (!this._config || !this.hass) {
      return;
    }
    // this._config = { config, ...this._entities };
    fireEvent(this, 'config-changed', { config });
  }

  entitiesChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    fireEvent(this, 'config-changed', { config: { ...this._config, entities: ev.detail } });
  }

  computeLabel(schema) {
    const localized = this.hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    if (localized === '') {
      return localize(`editor.form.card.${schema.name}`, this.hass);
    } else {
      return localized;
    }
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }


    if (this.subElementEditorConfig !== undefined) {
      return html`
        <mini-graph-card-entity-editor
          .hass=${this.hass}
          .config=${this._entities[this.subElementEditorConfig.index]}
          @go-back=${this.goBack}
          @config-changed=${this.subElementChanged}
        >
        </mini-graph-card-entity-editor>
      `;
    }

    const data = {
      ...this._config,
    };

    return html`
    <div>
      <mini-graph-card-entities-editor
        .hass=${this.hass}
        .entities=${this._entities}
        @config-changed=${this.entitiesChanged}
        @edit-row=${this.editRow}
      ></mini-graph-card-entities-editor>
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${SCHEMA}
        .computeLabel=${this.computeLabel}
        @value-changed=${this.valueChanged}
      ></ha-form>
    </div>
    `;
  }

  goBack() {
    this.subElementEditorConfig = undefined;
  }

  subElementChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const index = this.subElementEditorConfig.index || 0;
    if (index !== undefined) {
      const configentities = [...this._entities];
      configentities[index] = ev.detail;
      fireEvent(this, 'config-changed', { config: { ...this._config, entities: configentities } });
    }
  }

  editRow(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const id = ev.detail;
    this.subElementEditorConfig = { type: 'entity', index: id };
  }
}

customElements.define('mini-graph-card-editor', MiniGraphCardEditor);
