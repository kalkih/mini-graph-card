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
  static get properties() {
    return {
      hass: { attribute: false },
      entities: { attribute: false },
    };
  }

  static get styles() {
    return css`
      .entity {
        display: flex;
      }
    `;
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
          @value-changed=${this.valueChanged}
        ></ha-form>
        <ha-icon-button
          .path=${mdiClose}
          .index=${index}
          @click=${this.removeRow}
        ></ha-icon-button>
        <ha-icon-button
          .path=${mdiPencil}
          .index=${index}
          @click=${this.editRow}
        ></ha-icon-button>
        </div>
      `)}
    </div>
    <ha-form
      .hass=${this.hass}
      .schema=${SCHEMA}
      @value-changed=${this.addEntity}
    ></ha-form>
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
    const value = ev.detail.value || '';
    if (value === '') {
      return;
    }
    console.log(ev);
    fireEvent(this, 'config-changed', [...this.entities, value]);
  }

  editRow(ev) {
    const index = (ev.currentTarget).index || undefined;
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

    console.log(newConfigEntities);
    fireEvent(this, 'config-changed', newConfigEntities);
  }
}

customElements.define('mini-graph-card-entities-editor', EntitiesEditor);
