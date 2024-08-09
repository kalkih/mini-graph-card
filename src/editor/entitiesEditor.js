import { mdiPencil, mdiClose } from '@mdi/js';
import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, css } from 'lit-element';

const SCHEMA = [
  {
    name: 'entity',
    selector: { entity: {} },
  },
];

class EntitiesEditor extends LitElement {
  constructor() {
    super();
    this.newEntity = {};
  }

  static get properties() {
    return {
      hass: { attribute: false },
      entities: { attribute: false },
      newEntity: {},
    };
  }

  computeLabel(schema) {
    return this.hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
  }

  render() {
    if (!this.entities || !this.hass) {
      return;
    }
    return html`
    <div class="entities">
      ${this.entities.map((entity, index) => html`
        <div class="entity">
          <ha-form
            .hass=${this.hass}
            .data=${entity}
            .schema=${SCHEMA}
            .index=${index}
            .computeLabel=${this.computeLabel}
            @value-changed=${this.valueChanged}
          ></ha-form>
          <ha-icon-button
            .label=${this.hass.localize('editor.actions.remove')}
            .path=${mdiClose}
            .index=${index}
            @click=${this.removeRow}
          ></ha-icon-button>
          <ha-icon-button
            .label=${this.hass.localize('editor.actions.edit')}
            .path=${mdiPencil}
            .index=${index}
            @click=${this.editRow}
          ></ha-icon-button>
        </div>
      `)}
    </div>
    <div class="entity add-item">
      <ha-form
        .hass=${this.hass}
        .data=${this.newEntity}
        .schema=${SCHEMA}
        .computeLabel=${this.computeLabel}
        @value-changed=${this.addEntity}
      ></ha-form>
    </div>
    `;
  }

  removeRow(ev) {
    ev.stopPropagation();
    if (!this.entities || !this.hass) {
      return;
    }
    const index = (ev.currentTarget).index || '';
    const newConfigEntities = this.entities.concat();

    newConfigEntities.splice(index, 1);

    fireEvent(this, 'config-changed', newConfigEntities);
  }

  addEntity(ev) {
    ev.stopPropagation();
    const value = ev.detail.value || '';
    if (value === '' || value.entity === undefined) {
      return;
    }
    fireEvent(this, 'config-changed', [...this.entities, value]);
  }

  editRow(ev) {
    const index = (ev.currentTarget).index || 0;
    fireEvent(this, 'edit-row', index);
  }

  valueChanged(ev) {
    if (!this.entities || !this.hass) {
      return;
    }
    const value = ev.detail.value.entity || '';
    const index = (ev.target).index || 0;
    const newConfigEntities = this.entities.concat();

    newConfigEntities[index] = {
      ...newConfigEntities[index],
      entity: value || '',
    };

    fireEvent(this, 'config-changed', newConfigEntities);
  }

  static get styles() {
    return css`
      .entity {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .entity > ha-form {
        flex-grow: 1;
      }

      .add-item {
        margin-bottom: 16px;
      }
    `;
  }
}

customElements.define('mini-graph-card-entities-editor', EntitiesEditor);
