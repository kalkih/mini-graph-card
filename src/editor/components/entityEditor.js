import { fireEvent } from 'custom-card-helpers';
import { LitElement, html } from 'lit-element';
import { ENTITYSCHEMA } from '../editorConst';
import './colorSelector';
import './subPageHeader';

class EntityEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
    };
  }

  computeLabel(schema) {
    const localized = this.hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    if (localized !== '') {
      return localized;
    }
    return this.hass.localize(`ui.panel.lovelace.editor.card.mgc.${schema.name}`);
  }

  computeHelper(schema, data) {
    if (schema.name === 'entity') {
      return data.entity;
    }
    return '';
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
      <mini-graph-card-subpage-header
        .name=${this.hass.localize('ui.panel.lovelace.editor.card.mgc.edit_entity')}
        @go-back=${this.goBack}
      ></mini-graph-card-subpage-header>
      <ha-form
        .hass=${this.hass}
        .data=${isObject ? this.config : DATA}
        .schema=${ENTITYSCHEMA}
        .computeLabel=${this.computeLabel}
        .computeHelper=${schema => this.computeHelper(schema, isObject ? this.config : DATA)}
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
}

customElements.define('mini-graph-card-entity-editor', EntityEditor);
