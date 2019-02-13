import { css } from 'lit-element';

const style = css`
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
  ha-card > div {
    padding: 0px 16px 16px 16px;
  }
  ha-card > div:last-child {
    padding-bottom: 0;
  }
  ha-card[points] .line--points,
  ha-card[labels] .graph__labels {
    opacity: 0;
    transition: opacity .25s;
    animation: none;
  }
  ha-card[points]:hover .line--points,
  ha-card:hover .graph__labels {
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
  .states {
    align-items: flex-start;
    font-weight: 300;
    justify-content: space-between;
    flex-wrap: nowrap;
  }
  .states .icon {
    align-self: center;
    margin-left: 0;
  }
  .states[loc="center"] {
    justify-content: space-around;
  }
  .states[loc="right"] > .state {
    margin-left: auto;
    order: 2;
  }
  .states[loc="right"] > .icon {
    margin-left: 0;
  }
  .states[loc="center"] .states--secondary,
  .states[loc="right"] .states--secondary {
    margin-left: 0;
  }
  .states--secondary {
    display: flex;
    font-size: 0.6em;
    flex-flow: column;
    flex-wrap: wrap;
    margin-left: 1rem;
    min-width: 0;
  }
  .states--secondary:empty {
    display: none;
  }
  .state {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    max-width: 100%;
    min-width: 0;
  }
  .state--small {
    margin-bottom: .6rem;
    flex-wrap: nowrap;
  }
  .state__value {
    display: inline-block;
    font-size: 2.4em;
    line-height: 1em;
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
  .state--small .state__uom {
    flex: 1;
  }
  .state__time {
    font-size: .95rem;
    font-weight: 500;
    bottom: -1.1rem;
    left: 0;
    opacity: .75;
    position: absolute;
    white-space: nowrap;
  }
  .states[loc="right"] .state__time {
    left: initial;
    right: 0;
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
    position: relative;
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
    stroke-width: inherit;
    transition: fill .15s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  .line--point:hover {
    fill: inherit;
  }
  ha-card[gradient] .line--point:hover {
    fill: var(--primary-text-color, white);
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
    align-items: flex-start;
    flex-direction: column;
    font-size: calc(.15em + 8.5px);
    font-weight: 400;
    justify-content: space-between;
    margin-right: 10px;
    padding: .6em;
    position: absolute;
    pointer-events: none;
    top: 0; bottom: 0;
    opacity: .75;
  }
  .graph__labels > span {
    cursor: pointer;
    background: var(--primary-background-color, white);
    border-radius: 1em;
    padding: .2em .6em;
    box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24);
  }
  .graph__legend {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    padding-top: 16px;
    flex-wrap: wrap;
  }
  .graph__legend__item {
    cursor: pointer;
    display: flex;
    min-width: 0;
    margin: .4em;
    align-items: center
  }
  .graph__legend__item span {
    opacity: .75;
    margin-left: .4em;
  }
  .info {
    justify-content: space-between;
    align-items: middle;
  }
  .info__item {
    display: flex;
    flex-flow: column;
    align-items: flex-end;
    text-align: right;
  }
  .info__item:first-child {
    align-items: flex-start;
    text-align: left;
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
  }`;

export default style;
