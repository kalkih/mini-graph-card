# Lovelace Mini Graph Card
A minimalistic and customizable graph card for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI.

The card works with entities from within the **sensor** domain and displays the sensors current state as well as a line graph representation of the history.

![Preview](https://user-images.githubusercontent.com/457678/52006705-145c4e00-24cd-11e9-849a-063bc5d7c296.png)

## Install

### Simple install

1. Download and copy `mini-graph-card-bundle.js` from the [latest release](https://github.com/kalkih/mini-graph-card/releases/latest) into your `config/www` directory.

2. Add a reference to `mini-graph-card-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.2.0
      type: module
  ```

### CLI install

1. Move into your `config/www` directory

2. Grab `mini-graph-card-bundle.js`

  ```
  $ wget https://github.com/kalkih/mini-graph-card/releases/download/v0.2.0/mini-graph-card-bundle.js
  ```

3. Add a reference to `mini-graph-card-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.2.0
      type: module
  ```

### *(Optional)* Add to custom updater

1. Make sure you've the [custom_updater](https://github.com/custom-components/custom_updater) component installed and working.

2. Add a new reference under `card_urls` in your `custom_updater` configuration in `configuration.yaml`.

  ```yaml
  custom_updater:
    card_urls:
      - https://raw.githubusercontent.com/kalkih/mini-graph-card/master/tracker.json
  ```

## Updating
**If you have a version older than v0.0.8 installed, please delete the current files and follow the installation instructions again.**

1. Find your `mini-graph-card-bundle.js` file in `config/www` or wherever you ended up storing it.

2. Replace the local file with the latest one attached in the [latest release](https://github.com/kalkih/mini-graph-card/releases/latest).

3. Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below.

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.2.0
      type: module
  ```

*You may need to empty the browsers cache if you have problems loading the updated card.*

## Using the card

### Options

#### Card options
| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| type | string | **required** | v0.0.1 | `custom:mini-graph-card`.
| entities | string/list | **required** | v0.0.1 | Single entity id as a string or multiple entities in a list, see [entities object](#entities-object) for additional entity options.
| icon | string | optional | v0.0.1 | Set a custom icon from any of the available mdi icons.
| name | string | optional | v0.0.1 | Set a custom name which is displayed beside the icon.
| unit | string | optional | v0.0.1 | Set a custom unit of measurement.
| more_info | boolean | true | v0.0.1 | Set to `false` to disable the "more info" dialog when pressing the card.
| group | boolean | false | v0.2.0 | Disable paddings and box-shadow, useful when nesting the card.
| hours_to_show | integer | 24 | v0.0.2 | Specify how many hours the line graph should render.
| points_per_hour | integer | 1 | v0.2.0 | Specify amount of data points the graph should render for every hour, *(basically the detail/accuracy of the graph)*.
| show | list | optional | v0.2.0 | List of UI elements to display/hide, for available items see [available show options](#available-show-options).
| animate | boolean | false | v0.2.0 | Add a reveal animation to the graph.
| height | number | 150 | v0.0.1 | Set a custom height of the line graph.
| line_width | number | 5 | v0.0.1 | Set the thickness of the line.
| line_color | string/list | var(--accent-color) | v0.0.1 | Set a custom color for the graph line, provide a list of colors for multiple graph entries.
| decimals | integer | optional | v0.0.9 | Specify the exact number of decimals to show for states.
| font_size | number | 100 | v0.0.3 | Adjust the font size of the state displayed, as percentage of the original size.
| align_header | string | `default` | v0.2.0 | Set the alignment of the header, `left`, `right`, `center` or `default`.
| align_icon | string | `right` | v0.2.0 | Set the alignment of the icon, `left`, `right` or `state`.
| align_state | string | `left` | v0.2.0 | Set the alignment of the current state, `left`, `right` or `center`.
| line_color_above | list | optional | v0.2.0 | Set thresholds for different line graph colors, see [Line color object](#line-color-object).
| line_color_below | list | optional | v0.2.0 | Set thresholds for different line graph colors, see [Line color object](#line-color-object).

#### Entities object
Providing options are optional, entities can be listed directly, see example below.

| Name | Type | Default | Description |
|------|:----:|:-------:|:------------|
| entity | string | **required** | Entity id of the sensor
| name | string | optional | Set a custom display name, defaults to entity's friendly_name.

```yaml
entities:
  - sensor.temperature
  - entities: sensor.pressure
    name: Pressure
  - sensor.humidity
```

#### Available show options
All options are optional.

| Name | Default | parameter | Description |
|:----:|:-------:|:---------:|:-----------:|
| name | true | `true` / `false` | Display name
| icon | true | `true` / `false` | Display icon
| state | true | `true` / `false` | Display current state
| graph | true | `true` / `false` | Display the graph
| fill | true | `true` / `false` | Display the graph fill
| points | hover | `true` / `false` / `hover` | Display graph data points
| legend | true | `true` / `false` | Display the graph legend (only shown when graph contains multiple entities)
| extrema | false | `true` / `false` | Display max/min information
| labels | false | `true` / `false` | Display Y-axis labels

#### Line color object
See [adaptive line color](#adaptive-line-color) for example usage.

| Name | Type | Default | Description |
|------|:----:|:-------:|:------------|
| value | number | **required** | The threshold at where the color should apply if state is above/below.
| color | string | **required** | Color to apply to line graph, most formats supported (`hex`, `rgb`, `rgba` or just the name of the color etc.)

### Example usage

#### Single entity card
```yaml
- type: custom:mini-graph-card
  entities: sensor.illumination
```
![Single entity card](https://user-images.githubusercontent.com/457678/52009150-884d2500-24d2-11e9-9f2b-2981210d3897.png)

#### Alternative style
```yaml
# Example
- type: custom:mini-graph-card
  entities: sensor.illumination
  location_icon: left
  location_state: center
  show:
    fill: false
```
![Alternative style](https://user-images.githubusercontent.com/457678/52009161-8daa6f80-24d2-11e9-8678-47658a181615.png)

#### Multiple entities card
```yaml
- type: custom:mini-graph-card
  name: SERVER
  icon: mdi:server
  entities:
    - entity: sensor.server_total
      name: TOTAL
    - sensor.server_sent
    - sensor.server_received
```
![Multiple entities card](https://user-images.githubusercontent.com/457678/52009165-900cc980-24d2-11e9-8cc6-c77de58465b5.png)

#### Show data from the past week
Use the `hours_to_show` option to specify how many hours of history the graph should represent.
Use the `points_per_hour` option to specify the accuracy/detail of the graph.

```yaml
- type: custom:mini-graph-card
  entities: sensor.living_room_temp
  name: LIVONG ROOM
  hours_to_show: 168
  points_per_hour: 0.25
```
![Show data from the past week](https://user-images.githubusercontent.com/457678/52009167-913df680-24d2-11e9-8732-52fc65e3f0d8.png)

#### Graph only card
Use the `show` option to show/hide UI elements.

```yaml
- type: custom:mini-graph-card
  entities: sensor.humidity
  show:
    icon: false
    name: false
    state: false
```

#### Horizontally stacked cards
You can stack cards horizontally by using one or more `horizontal-stack(s)`.

```yaml
- type: horizontal-stack
  cards:
    - type: custom:mini-graph-card
      entities: sensor.humidity
      line_color: blue
      line_width: 8
      font_size: 75
    - type: custom:mini-graph-card
      entities: sensor.illumination
      line_color: '#e74c3c'
      line_width: 8
      font_size: 75
    - type: custom:mini-graph-card
      entities: sensor.temperature
      line_color: var(--accent-color)
      line_width: 8
      font_size: 75
```
![Horizontally stacked cards](https://user-images.githubusercontent.com/457678/52009171-926f2380-24d2-11e9-9dd4-28f010608858.png)

#### Adaptive line color
Have the line color change with the current state.
When listing more than one color entry, place them in order from *low -> high* for `line_color_above` and *high -> low* for `line_color_below`.

```yaml
- type: custom:mini-graph-card
  entities: sensor.sensor_temperature
  line_color_above:
    - value: 10
      color: yellow
    - value: 20
      color: orange
    - value: 30
      color: red
  line_color_below:
    - value: -10
      color: white
    - value: -20
      color: lightblue
    - value: -30
      color: blue
    - value: -50
      color: "#000000"
```


## Development

**Clone this repository into your `config/www` folder using git.**

```
$ git clone https://github.com/kalkih/mini-graph-card.git
```

**Add a reference to the card in your `ui-lovelace.yaml`.**

```yaml
resources:
  - url: /local/mini-graph-card/mini-graph-card-bundle.js
    type: module
```

### Generate the bundle

*Requires `nodejs` & `npm`*

**Move into the `mini-graph-card` repo, checkout the dev branch & install dependencies.**

```
$ cd mini-graph-card && git checkout dev && npm install
```

**Edit the source file `mini-graph-card.js`, build by running**
```
$ npm run build
```

The `mini-graph-card-bundle.js` will be rebuilt and ready.

**For convenience, you can have the source build itself on file change by running**
```
$ npm run watch
```

**If you plan to submit a PR, please base it on the .dev` branch**

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `mini-graph-card.js` & `mini-graph-lib.js`.

If you have issues after updating the card, try clearing your browser cache.

If you have issues displaying the card in older browsers, try changing `type: module` to `type: js` at the card reference in `ui-lovelace.yaml`.

## License
This project is under the MIT license.
