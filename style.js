import { html } from '@polymer/lit-element';

export function style() {
  return html`
    <style is="custom-style">
      :host {
        display: flex;
        flex: 1;
        flex-direction: column;
      }
      ha-card {
        flex-direction: column;
        flex: 1;
        padding: 16px 0;
        position: relative;
        overflow: visible;
      }
      ha-card[points] .line--points {
        opacity: 0;
        transition: opacity .25s;
        animation: none;
      }
      ha-card[points]:hover .line--points {
        opacity: 1;
      }
      ha-card[fill] {
        padding-bottom: 0;
      }
      ha-card[fill] .graph {
        padding: 0;
        order: 10;
      }
      ha-card[fill] path {
        stroke-linecap: initial;
        stroke-linejoin: initial;
      }
      ha-card[fill] .graph__legend {
        order: -1;
        padding: 0 16px 8px 16px;
      }
      ha-card[fill] .info {
        padding-bottom: 16px;
      }
      ha-card[group] {
        box-shadow: none;
        padding: 0;
      }
      ha-card[group] > div {
        padding: 0;
      }
      ha-card[group] .graph__legend {
        padding-left: 0;
        padding-right: 0;
      }
      ha-card[more-info] {
        cursor: pointer;
      }
      ha-card > div {
        padding: 0px 16px 16px 16px;
      }
      ha-card > div:last-child {
        padding-bottom: 0;
      }
      .flex {
        display: flex;
        display: -webkit-flex;
        min-width: 0;
      }
      .header {
        justify-content: space-between;
      }
      .header[loc="center"] {
        align-self: center;
      }
      .header[loc="left"] {
        align-self: flex-start;
      }
      .header[loc="right"] {
        align-self: flex-end;
      }
      .name {
        align-items: center;
        min-width: 0;
        opacity: .8;
      }
      .name > span {
        font-size: 1.2rem;
        font-weight: 400;
        max-height: 1.4rem;
        opacity: .75;
      }
      .icon {
        color: var(--paper-item-icon-color, #44739e);
        display: inline-block;
        flex: 0 0 24px;
        text-align: center;
        width: 24px;
        margin-left: auto;
      }
      .icon[loc="left"] {
        order: -1;
        margin-right: 8px;
        margin-left: 0;
      }
      .icon[loc="state"] {
        align-self: center;
      }
      .state {
        flex-wrap: wrap;
        font-weight: 300;
      }
      .state > .flex {
        position: relative;
      }
      .state[loc="center"] {
        align-self: center;
      }
      .state[loc="right"] {
        align-self: flex-end;
      }
      .state__value {
        display: inline-block;
        font-size: 2.4em;
        line-height: 1em;
        max-size: 100%;
        margin-right: .25rem;
      }
      .state__uom {
        align-self: flex-end;
        display: inline-block;
        font-size: 1.4em;
        font-weight: 400;
        line-height: 1.2em;
        margin-top: .1em;
        opacity: .6;
        vertical-align: bottom;
      }
      .state__time {
        white-space: nowrap;
        font-weight: 500;
        position: absolute;
        bottom: -1.1rem;
        left: 0;
        opacity: .75;
        font-size: 0.95rem;
      }
      .graph {
        align-self: flex-end;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        margin-top: auto;
        width: 100%;
      }
      .graph__container {
        display: flex;
        flex-direction: row;
      }
      .graph__container__svg {
        cursor: default;
        flex: 1;
      }
      svg {
        overflow: hidden;
      }
      path {
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .line--fill[anim="false"] {
        animation: reveal .25s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
      }
      .line--points[anim="false"],
      .line[anim="false"] {
        animation: pop .25s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
      }
      .line--point {
        cursor: pointer;
        fill: var(--paper-card-background-color, white);
        transition: fill .15s cubic-bezier(0.215, 0.61, 0.355, 1);
      }
      .line--point:hover {
        fill: inherit;
      }
      path,
      .line--points,
      .line--fill {
        opacity: 0;
      }
      .line--points[anim="true"][init] {
        animation: pop .5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
      }
      .line--fill[anim="true"][init] {
        animation: reveal .5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
      }
      .line[anim="true"][init] {
        animation: dash 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
      }
      .graph__labels {
        flex-direction: column;
        font-size: .8em;
        font-weight: 400;
        justify-content: space-between;
        margin-right: 10px;
        opacity: .75;
      }
      .graph__labels > span {
        align-self: flex-end;
        position: relative;
        width: 100%;
      }
      .graph__labels > span:after {
        position: absolute;
        right: -6px;
        content: ' -';
        opacity: .75;
      }
      .graph__legend {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        padding-top: 16px;
      }
      .graph__legend__item {
        cursor: pointer;
      }
      .graph__legend__item span {
        opacity: .75;
      }
      .info {
        justify-content: space-between;
        align-items: middle;
      }
      .info__item {
        display: flex;
        flex-flow: column;
        align-items: flex-end
      }
      .info__item:first-child {
        align-items: flex-start;
      }
      .info__item__type {
        text-transform: capitalize;
        font-weight: 500;
        opacity: .9;
      }
      .info__item__time,
      .info__item__value {
        opacity: .75;
      }
      .ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @keyframes reveal {
        0% { opacity: 0; }
        100% { opacity: .15; }
      }
      @keyframes pop {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes dash {
        0% {
          opacity: 0;
        }
        25% {
          opacity: 1;
        }
        100% {
          opacity: 1;
          stroke-dashoffset: 0;
        }
      }
    </style>`;
}
