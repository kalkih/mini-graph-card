# Lovelace Mini Graph Card
A minimalistic and customizable graph card for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI.

The card works with entities from within the **sensor** & **binary_sensor** domain and displays the sensors current state as well as a line graph representation of the history.

![Preview](https://user-images.githubusercontent.com/457678/52977264-edf34980-33cc-11e9-903b-cee43b307ed8.png)

## Table of Contents:

   * [Install](#install)
      + [HACS (recommended)](#hacs-recommended)
      + [Manual install](#manual-install)
      + [CLI install](#cli-install)
      + [Add resource reference](#add-resource-reference)
   * [Updating](#updating)
   * [Using the card](#using-the-card)
      + [Card options](#card-options)
      + [Entities object](#entities-object)
      + [Available show options](#available-show-options)
      + [Graph types](#graph-types)
      + [Y-axis object](#y-axis-object)
      + [Line color object](#line-color-object)
      + [Action object options](#action-object-options)
      + [State map object](#state-map-object)
      + [Value factor](#value-factor)
      + [Aggregate functions](#aggregate-functions)
      + [Alignment for "name" & "icon" elements](#alignment-for-name--icon-elements)
      + [Structured names](#structured-names)
      + [Static values](#static-values)
      + [Number format](#number-format)
      + [Custom format for datetime values](#custom-format-for-datetime-values)
      + [Logarithmic options](#logarithmic-options)
      + [Line styles](#line-styles)
      + [Baseline](#baseline)
      + [Inverted graphs](#inverted-graphs)
      + [Force a zero vertical position](#force-a-zero-vertical-position)
      + [Graphs order](#graphs-order)
      + [Configuration validation](#configuration-validation)
         - [Error severity levels](#error-severity-levels)
         - [Validation rules](#validation-rules)
      + [Supported color formats](#supported-color-formats)
      + [Theme variables](#theme-variables)
   * [Example usage](#example-usage)
      + [Single entity card](#single-entity-card)
      + [Multiple entities card](#multiple-entities-card)
      + [Different graph types](#different-graph-types)
      + [Bar spacing](#bar-spacing)
      + [Show data from the past week](#show-data-from-the-past-week)
      + [Graph only card](#graph-only-card)
      + [Horizontally stacked cards](#horizontally-stacked-cards)
      + [Dynamic line color](#dynamic-line-color)
      + [Alternate Y-axis](#alternate-y-axis)
      + [Custom styles for line graphs](#custom-styles-for-line-graphs)
      + [Displaying static values](#displaying-static-values)
      + [Custom baseline](#custom-baseline)
      + [Inverted Y-axis](#inverted-y-axis)
      + [Opposing dual-axis graphs](#opposing-dual-axis-graphs)
      + [Grouping by date](#grouping-by-date)
      + [Data aggregation functions](#data-aggregation-functions)
      + [Using state_map](#using-state_map)
      + [Showing additional info on the card](#showing-additional-info-on-the-card)
      + [Accessing attributes in complex structures](#accessing-attributes-in-complex-structures)
         - [Accessing dictionary attributes](#accessing-dictionary-attributes)
         - [Accessing list attributes](#accessing-list-attributes)
   * [Development](#development)
      + [Instructions](#instructions)
   * [Getting errors?](#getting-errors)
   * [License](#license)

---

## Install

### HACS (recommended)

This card is available in [HACS](https://hacs.xyz/) (Home Assistant Community Store).

<small>*HACS is a third party community store and is not included in Home Assistant out of the box.*</small>

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=kalkih&repository=mini-graph-card)

### Manual install

1. Download and copy `mini-graph-card-bundle.js` from the [latest release](https://github.com/kalkih/mini-graph-card/releases/latest) into your `config/www` directory.

2. Add the resource reference as decribed below.


### CLI install

1. Move into your `config/www` directory.

2. Grab `mini-graph-card-bundle.js`:

  ```console
  $ wget https://github.com/kalkih/mini-graph-card/releases/download/v0.13.0/mini-graph-card-bundle.js
  ```

3. Add the resource reference as decribed below.

### Add resource reference

Note: If you install the card via HACS, you do not need to add the resource reference manually; HACS handles this automatically during the installation process.

If you configure Lovelace via YAML, add a reference to `mini-graph-card-bundle.js` inside your `configuration.yaml`:

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.13.0
      type: module
  ```

Else, if you prefer the graphical editor, use the menu to add the resource:

1. Make sure, advanced mode is enabled in your user profile (click on your user name to get there)
2. Navigate to Configuration -> Lovelace Dashboards -> Resources Tab. Hit orange (+) icon
3. Enter URL `/local/mini-graph-card-bundle.js` and select type "JavaScript Module".
4. Restart Home Assistant.

## Updating
**If you have a version older than v0.0.8 installed, please delete the current files and follow the installation instructions again.**

1. Find your `mini-graph-card-bundle.js` file in `config/www` or wherever you ended up storing it.

2. Replace the local file with the latest one attached in the [latest release](https://github.com/kalkih/mini-graph-card/releases/latest).

3. Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below:

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.13.0
      type: module
  ```

*You may need to empty the browsers cache if you have problems loading the updated card.*

## Using the card

We recommend looking at the [Example usage section](#example-usage) to understand the basics to configure this card.
(also) pay attention to the **required** options mentioned below.

> [!NOTE]
> It is highly recommended to have your server's & client's system time synchronized with NTP servers.
> Otherwise, you may observe glitches.
> A possible glitch occurs when a client's time is 10 sec behind: assume there is a sensor with a high update frequency, and after a value's change (let it be an "increase" for instance) a corresponding "peak" is like "stuck" to a right edge instead of moving to the left, and is instantly shifted only after 10 sec.

### Card options
| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| type ***(required)*** | string |  | v0.0.1 | `custom:mini-graph-card`.
| entities ***(required)*** | list |  | v0.2.0 | One or more sensor entities (along with [static values](#static-values)) in a list, see [entities object](#entities-object) for additional entity/static value options.
| icon | string |  | v0.0.1 | Set a custom icon from any of the available mdi icons.
| icon_color | string |  | v0.14.0 | Set a custom icon color. Takes precedence over `icon_adaptive_color`. See [Supported color formats](#supported-color-formats).
| icon_image | string |  | v0.12.0 | Override icon with an image url.
| name | string |  | v0.0.1 | Set a custom name which is displayed beside the icon.
| unit | string |  | v0.0.1 | Set a custom unit of measurement (`''` value for an empty unit).
| tap_action | [action object](#action-object-options) |  | v0.7.0 | Action on click/tap.
| group | boolean | `false` | v0.2.0 | Disable paddings and box-shadow, useful when nesting the card.
| hours_to_show | integer | `24` | v0.0.2 | Specify how many hours of history the graph should present.
| points_per_hour | number | `0.5` | v0.2.0 | Specify amount of data points the graph should display for each hour, *(basically the detail/accuracy/smoothing of the graph)*.
| aggregate_func | string | `avg` | v0.8.0 | Specify [aggregate function](#aggregate-functions) used to calculate point/bar in the graph.
| group_by | string | `interval` | v0.8.0 | Specify type of grouping of data, dynamic `interval`, `week`, `date`, `hour`, `30min` or `15min`.
| update_interval | number |  | v0.4.0 | Specify a custom update interval of the history data (in seconds), instead of on every state change.
| cache | boolean | `true` | v0.9.0 | Enable/disable local caching of history data.
| show | [show object](#available-show-options) |  | v0.2.0 | UI elements display/hide options.
| y_axis | [Y-axis config object](#y-axis-object) |  | v0.14.0 | Settings related to Y-axes.
| animate | boolean | `false` | v0.2.0 | Add a reveal animation to the graph.
| height | number | `150` | v0.0.1 | Set a custom height of the line graph.
| bar_spacing | number | `4` | v0.9.0 | Set the spacing between bars in bar graph. Value `-1` is used to place bars on each other. See [examples](#bar-spacing-examples).
| bar_spacing_group | number |   | 0.14.0 | Set an additional spacing between bar groups (multiple entities) in bar graph. Fallback to `bar_spacing` if undefined; if `bar_spacing: -1` - then a default `4` value is used. See [examples](#bar-spacing-examples).
| line_width | number | `5` | v0.0.1 | Set the thickness of the line.
| line_style | string |  | v0.14.0 | Set the style of the line (see [Line styles](#line-styles)).
| line_color | string/list | `var(--accent-color)` | v0.0.1 | Set a custom color for the graph line, provide a list of colors for multiple graph entries. See [Supported color formats](#supported-color-formats).
| color_thresholds | list |  | v0.2.3 | Set thresholds for dynamic graph colors, see [Line color object](#line-color-object).
| color_thresholds_transition | string | `smooth` | v0.4.3 | Color threshold transition, `smooth` or `hard`.
| decimals | integer |  | v0.0.9 | Specify the exact number of decimals to show for number values, see [Number format](#number-format).
| hour24 | boolean |  | v0.2.1 | Set to `true` to display times in 24-hour format. See more details [here](#custom-format-for-datetime-values).
| datetime_format | string | | v.0.14.0 | Set a custom [format](#custom-format-for-datetime-values) for datetime values.
| font_size | number | `100` | v0.0.3 | Adjust the font size of the state, as percentage of the original size.
| font_size_header | number | `14` | v0.3.1 | Adjust the font size of the header, size in pixels.
| align_header | string |  | v0.2.0 | Set the alignment of the name in the header, `left`, `right` or `center`. See more details [here](#alignment-for-name--icon-elements).
| align_icon | string | `right` | v0.2.0 | Set the alignment of the icon, `left`, `right` or `state`. See more details [here](#alignment-for-name--icon-elements).
| align_state | string | `left` | v0.2.0 | Set the alignment of the current state, `left`, `right` or `center`.
| smoothing | boolean | `true` | v0.8.0 | Whether to make graph line smooth.
| state_map | [state map object](#state-map-object) |  | v0.8.0 | List of entity states to convert.
| logarithmic | boolean | `false` | v0.10.0 | Use a logarithmic scale for the graph (see [Logarithmic options](#logarithmic-options)).
| baseline | number |  | v0.14.0 | Set a custom baseline for the graph (see [Baseline](#baseline)).
| static_value_label_offset | number |  `20` | v0.14.0 | Set a custom horizontal offset for the [static value line label](#static-values), as percentage of the graph area's width.


These options are legacy and moved into [Y-axis config object](#y-axis-object):

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| decimals_primary_labels | integer |  | v0.14.0-dev.1  | Specify the exact number of decimals to show for primary Y-axis labels, see [Number format](#number-format).
| decimals_secondary_labels | integer |  | v0.14.0-dev.1  | Specify the exact number of decimals to show for secondary Y-axis labels, see [Number format](#number-format).
| lower_bound | number *or* string |  | v0.2.3 | Set a fixed lower bound for the graph Y-axis. String value starting with ~ (e.g. `~50`) specifies soft bound.
| upper_bound | number *or* string |  | v0.2.3 | Set a fixed upper bound for the graph Y-axis. String value starting with ~ (e.g. `~50`) specifies soft bound.
| min_bound_range | number |  | v0.x.x | Applied after everything, makes sure there's a minimum range that the Y-axis will have. Useful for not making small changes look large because of scale.
| lower_bound_secondary | number *or* string |  | v0.5.0 | Set a fixed lower bound for the graph secondary Y-axis. String value starting with ~ (e.g. `~50`) specifies soft bound.
| upper_bound_secondary | number *or* string |  | v0.5.0 | Set a fixed upper bound for the graph secondary Y-axis. String value starting with ~ (e.g. `~50`) specifies soft bound.
| min_bound_range_secondary | number |  | v0.x.x | Applied after everything, makes sure there's a minimum range that the secondary Y-axis will have. Useful for not making small changes look large because of scale.
| value_factor | number or object |   | v0.9.4<br>v0.14.0-dev.1 | Scale a value, see [Value factor](#value-factor).
| value_factor_secondary | number or object |   | v0.14.0-dev.1  | Scale a value, see [Value factor](#value-factor).

Card config can still keep legacy options, yet it is recommended to upgrade.

### Entities object
Entities may be listed directly (as per `sensor.temperature` in the example below), or defined using
properties of the Entity object detailed in the following table (as per `sensor.pressure` in the example below).

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| entity ***(required)*** | string |         | Entity id of the sensor. Either `entity` or `static_value` must be defined.
| attribute | string |         | Retrieves an attribute or [sub-attribute (attr1.attr2...)](#accessing-attributes-in-complex-structures) instead of the state
| static_value | number |         | Set a value for a [static line or bar](#static-values). Either `entity` or `static_value` must be defined.
| name | string / list |         | Set a custom display name, defaults to entity's name or a `Static` label for a [static value](#static-values). Accepts a [structured name](#structured-names) on Home Assistant 2026.4 and later.
| animate    | boolean |        | Override for a reveal animation to the graph.
| graph | string |         | Override for a graph type, `line` or `bar` (see [Graph types](#graph-types)).
| line_width | number |         | Override for a thickness of the line.
| line_style | string |   | Override the style of the line (see [Line styles](#line-styles)).
| color | string |         | Set a custom color, overrides all other color options including thresholds. See [Supported color formats](#supported-color-formats).
| color_thresholds | list |  | v0.14.0 | Override the thresholds for dynamic graph colors.
| color_thresholds_transition | string |  | v0.14.0 | Override the color threshold transition.
| unit | string |         | Set a custom unit of measurement, overrides `unit` set in base config (`''` value for an empty unit).
| aggregate_func | string |         | Override for aggregate function used to calculate point on the graph, `avg`, `median`, `min`, `max`, `first`, `last`, `sum`.
| decimals | integer |    | Override the exact number of decimals to show for number values, see [Number format](#number-format).
| show_state | boolean |         | Display the current state.
| show_legend_state | boolean |  `false`  | Display the current state as part of the legend.
| show_indicator | boolean |   `false`      | Display a color indicator next to the state.
| show_graph | boolean |         | Set to false to completely hide the graph.
| show_line | boolean |         | Set to false to hide the line.
| show_fill | boolean |         | Set to false to hide the fill.
| show_points | boolean |         | Set to false to hide the points (see a note below).
| show_legend | boolean |         | Set to false to turn hide from the legend.
| show_static_value_label | boolean | v0.14.0 | Set to false to hide the [static value line label](#static-values).
| show_static_inactive | boolean |         | Set to true to disable hiding the line when a point of a line of another entity selected; meaningful for a [static value](#static-values) only.
| state_adaptive_color | boolean |         | Make the color of the state & the [static value line label](#static-values) adapt to the entity/static value color.
| y_axis | string |         | If 'secondary', displays using the secondary Y-axis on the right.
| fixed_value | boolean |         | Set to true to graph the entity's current state as a fixed value instead of graphing its state history.
| smoothing | boolean |         | Override for a flag indicating whether to make graph line smooth.
| state_map | [state map object](#state-map-object) |         | List of entity states to convert.
| logarithmic | boolean |         | Override logarithmic scaling for this entity only (see [Logarithmic options](#logarithmic-options)).
| baseline | number |   | Set a custom baseline for the graph or override a global `baseline` option (see [Baseline](#baseline)).

Note: the "points" term is only applicable to a "line" graph, not to a "bar" graph.

```yaml
entities:
  - sensor.temperature
  - entity: sensor.pressure
    name: Pressure
    show_state: true
  - sensor.humidity
```

### Available show options
All properties are optional.

| Name | Default | Options | Description |
|------|:-------:|:-------:|-------------|
| name | `true` | `true` / `false` | Display name.
| icon | `true` | `true` / `false` | Display icon.
| state | `true` | `true` / `false` / `last` | Display current state. `last` will show the last graph point's or bar's value (fallback to `true` if points are not shown for a line graph).
| graph | `line` | `line` / `bar` / `false` | Display option for the graph. If set to `bar` a maximum of `96` bars will be displayed. See [Graph types](#graph-types).
| fill | `true` | `true` / `false` / `fade` | Display the line graph fill.
| points | `hover` | `true` / `false` / `hover` | Display graph data points (for a line graph only).
| legend | `true` | `true` / `false` / `below` | Display the graph legend (only shown when graph contains multiple entities); `below` - place below a graph.
| average | `false` | `true` / `false` / `below` | Display average information; `below` - place below a graph.
| extrema | `false` | `true` / `false` / `below` | Display max/min information; `below` - place below a graph.
| info_hide_unit | `false` | `true` / `false` | Do not show a unit for the average & max/min information.
| labels | `hover` | `true` / `false` / `hover` | Display Y-axis labels.
| labels_secondary | `hover` | `true` / `false` / `hover` | Display secondary Y-axis labels.
| static_value_labels | `false` | `left` / `right` / `false` | Display [static value lines labels](#static-values) either on the left or right side, or do not display.
| name_adaptive_color | `false` | `true` / `false` | Make the name color adapt with the primary entity/static value color.
| icon_adaptive_color | `false` | `true` / `false` | Make the icon color adapt with the primary entity/static value color.
| loading_indicator | `true` | `true` / `false` | Show loading indicator while attempting to retrieve a history.
| graph_order | `direct` | `direct` / `reversed` | Define an order of displaying graphs (see [Graphs order](#graphs-order)).

### Graph types

Two graph types are supported - linear & bars.
By default, all graphs have a `line` type.
To set a common type for all graphs - use a `show.graph` option (see [Available show options](#available-show-options)).
To set an individual type for a particular graph, use a per-entity `graph` option (see [Entities object](#entities-object)).
See examples [below](#different-graph-types).


### Y-axis object

The `y_axis` option has an object structure with optional `zero_position`, `primary` & `secondary` keys:

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| zero_position | number |  | Set a vertical position of a zero baseline (0..1, measured from a top edge of a graph area), see [Force a zero vertical position](#force-a-zero-vertical-position).
| primary | object |  | Specify options for a `primary` axis, see below.
| secondary | object |  | Specify options for a `secondary` axis, see below.

The `primary` & `secondary` keys may contain optional properties listed below:

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| invert | boolean |  `false` | Make the Y-axis inverted, see [Inverted graphs](#inverted-graphs).
| decimals | integer |  | Specify the exact number of decimals to show for the Y-axis labels, see [Number format](#number-format).
| value_factor | number or object |   | Scale a value, see [Value factor](#value-factor).
| state_map | [state map object](#state-map-object) |   | List of entity states to convert.
| lower_bound | number *or* string |   | Set a fixed lower bound for the Y-axis. String value starting with ~ (e.g. `~50`) specifies soft bound.
| upper_bound | number *or* string |   | Set a fixed upper bound for the Y-axis. String value starting with ~ (e.g. `~50`) specifies soft bound.
| min_bound_range | number |   | Applied after everything, makes sure there's a minimum range that the Y-axis will have. Useful for not making small changes look large because of scale.
| labels | list | `['min', 'max']`  | Set types of Y-axis labels to display. Possible values are `max`, `min`, `zero`, `all` (includes all of them); `max` & `min` stand for a max & min Y-axis labels correspondingly, `zero` - for a 0 label. The 0 label is only shown if max & min labels have different signs.

```yaml
y_axis:
  primary:
    decimals: ...
    value_factor: ...
    lower_bound: ...
    upper_bound: ...
    min_bound_range: ...
    labels: ...
  secondary:
    decimals: ...
    value_factor: ...
    lower_bound: ...
    upper_bound: ...
    min_bound_range: ...
    labels: ...
```


### Line color object
See [dynamic line color](#dynamic-line-color) for example usage.

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| value ***(required [except in interpolation (see below)](#line-color-interpolation-of-stop-values))*** | number |  | The threshold for the color stop.
| color ***(required)*** | string |  | Color. See [Supported color formats](#supported-color-formats).

Line color interpolation of stop values:
As long as the first and last threshold stops have `value` properties, intermediate stops can exclude `value`; they will be interpolated linearly. For example, given stops like:

```yaml
color_thresholds:
  - value: 0
    color: "#ff0000"
  - color: "#ffff00"
  - color: "#00ff00"
  - value: 4
    color: "#0000ff"
```

The values will be interpolated as:

```yaml
color_thresholds:
  - value: 0
    color: "#ff0000"
  - value: 1.333333
    color: "#ffff00"
  - value: 2.666667
    color: "#00ff00"
  - value: 4
    color: "#0000ff"
```
The example above will result in the following colors of the graph: if value is
* between `0` (including this value) and  `1.33333`, the color is `#ff0000`,
* between `1.33333` (including this value) and `2.666667`, the color is `#ffff00`,
* between `2.666667` (including this value) and `4`, the color is `#00ff00`,
* equal to or more than `4`, the color is `#0000ff`.

As a shorthand, you can just use a color string for the stops that you want interpolated:

```yaml
  - value: 0
    color: "#ff0000"
  - "#ffff00"
  - "#00ff00"
  - value: 4
    color: "#0000ff"
```

### Action object options

All card's area - except a graph part - supports processing of actions.
By default, tapping on an element opens a `more-info` dialog:
1. For "state" elements - the dialog is opened for a corresponding graph entity (not processed for a [static value](#static-values)).
2. For "legend" elements - same as above.
3. For other card's areas (except a graph part) - the dialog is opened for the 1st graph entity (not processed for a [static value](#static-values)).

| Name | Type | Default | Options | Description |
|------|:----:|:-------:|:-----------:|-------------|
| action | string | `more-info` | `more-info` / `navigate` / `call-service`  / `url` / `none` | Action to perform.
| entity | string |  | Any entity id | Override default entity of `more-info`, when  `action` is defined as `more-info`.<br>Note that this override is not applied when a "state" or a "legend" elements are tapped - in these cases always a corresponding graph entity is processed.
| service | string |  | Any service | Service to call (e.g. `media_player.toggle`) when `action` is defined as `call-service`.
| service_data | object |  | Any service data | Service data to include with the service call (e.g. `entity_id: media_player.office`).
| navigation_path | string |  | Any path | Path to navigate to (e.g. `/lovelace/0/`) when `action` is defined as `navigate`.
| url | string |  | Any URL | URL to open when `action` is defined as `url`.

#### State map object

State map object is defined by a `state_map` option and allows users to map values from an entity's history to specific graph coordinates and labels. It operates in two modes:
* **strict mode** (default, when `keep_values: false` or undefined): converts original text values (e.g., `on`, `off`) from a history to sequential numbers (0, 1, ...) to render them on a graph. Unmapped values are left in the history array "as is"; if these unmapped values are numeric - they are shown on a graph & thus may cause a distortion since the properly mapped values are like "0, 1, ..." and can be much smaller than the unmapped values; if the unmapped values are non-numeric - these values are not shown on a graph (since graph is created using _numbers_), and an unmapped value can only be displayed for a **current** value in a "state display" area (since the current value is not taken from a history but is a "live" state).
* **relaxed mode** (when `keep_values: true`): is only meaningful for entities with numeric values, retains original numeric history values (i.e. the history data is untouched) while replacing custom text labels for specific numbers (like `Danger` instead of `1000`). Supports an optional `tolerance` parameter to match numeric values within a defined range `[value ± tolerance]`, both bounds are "included". Alternatively, `min` & `max` parameters can be used instead to match numeric values in a defined range `[min, max)`, a right bound is not "included". For matched values, user-defined (or automatically generated) labels are shown instead (like a `Danger` label or a complex dynamically created `Danger: 810 (700..900)` label).

In the description above, a "label" term stands for a text displayed on a card:
* current state displayed in a "state display" area;
* state for a selected point/bar in a "state display" area;
* current state displayed in a "legend" area (if `show_legend_state: true`);
* Y-axis "min/max" labels.

In case of using a mapping with a `state_map` object, these labels contain a mapped value (e.g. `off` & `on` in case of a strict mapping, `Danger` in case of a relaxed mapping, see examples above).
Note that Y-axis labels will contain mapped values only for a strict mapping (see more details below) like `off` & `on`, and in case of a relaxed mapping the Y-axis labels still contain original unmapped values.
Also, both strict & relaxed mappings are not applied to "extrema/average" values, original values are shown there.

The `state_map` option can be defined in 2 ways:
* short (or legacy) syntax - the `state_map` option is an array of mappings, this creates "strict" mappings.
* full syntax - the `state_map` option is an object, this may be used to define either "strict" or "relaxed" mappings.

The `state_map` option in a "full syntax" has an object structure with mandatory `map` & other optional keys:

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| map | list |  | Array of mappings between a historical value and a graph coordinate or a displayed label.
| keep_values | boolean |  `false` | Set to `true` for the "relaxed" mapping.
| hide_unit | boolean |  `false` | Set to `true` to hide a native or a custom unit for a mapped value (e.g. to show a `Danger` label instead of `Danger %`) for ALL mappings (unless it is overridden by setting the `hide_unit` option for a particular mapping).
| label | string |   | Set to define a common label for all mappings (see more details about labels below).

The `map` key contains a list of entries.
When `keep_values` is not `true` (or in case of the "short/legacy syntax") - the **order of entries matters** as the entry's index determines its position (Y-value) on the graph.
Each entry may contain properties listed below:

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| value ***(required)*** | string |  | Value to convert.
| label | string | same as value | String to show as a label, overrides a common `label` if defined.
| tolerance | number |  | Absolute numeric deviation allowed when matching values, e.g. a value `3.14` in a history & a `value` option's value `3.142` are matched with a `tolerance: 0.005`. Only accounted when `keep_values: true`.
| min | number |  | Left bound of a range of matching values. Only accounted when `keep_values: true`.
| max | number |  | Right bound of a range of matching values. Only accounted when `keep_values: true`.
| hide_unit | boolean | `false` | Hide a unit for a mapped value (overrides a common `hide_unit` if defined).

Example of a "short/legacy syntax":
```yaml
state_map:
  - value: off
    label: Switched off
  - value: on
    label: Switched on
```
Example of a "full syntax":
```yaml
state_map:
  keep_values: true
  map:
    - value: 123
    - value: 456
  label: Danger
  hide_unit: true
```
As a shorthand, you can just use a string as a value to convert (then a label is defined automatically or using a possibly defined common `label` option):
```yaml
  map:
    - value: red
      label: Red
    - green
    - value: blue
      label: Blue
```
It is recommended to only use the "strict mode" for entities with non-numeric values & provide a mapping for all possible values.

The `tolerance`, `min` & `max` options can only be used in the "relaxed mode" as meaningful for numeric values only.
There are 2 ways of matching - either define a `value` (with a possibly defined `tolerance`, otherwise a default "0" tolerance is used) to match values in `[value ± tolerance]` range (both bounds are "included"), or define `min` & `max` to match values in `[min, max)` range (right bound is not included).

The `label` option is processed as follows:
1. In "strict mode": if `label` is defined - then it is used; otherwise:
* if a common `label` is defined - it is used;
* otherwise - a displayed label is same as `value`.
2. In "relaxed mode": if `label` is defined - then it is used; otherwise:
* if a common `label` is defined - it is used;
* if a `value` option is defined - then a displayed label is same as `value`;
* if `min` & `max` options are defined - then an automatically generated `${min} .. ${max}` label is used.

It is possible to define the `label` option as a template like `${min} .. ${max}`, `${raw}, range [${min} .. ${max}]` - a combination of a user-defined text & tokens.
Here the `${...}` part can contain tokens like `value`, `tolerance`, `min`, `max` & `raw`, where the `raw` token stands for a matched value, and other tokens stand for corresponding options; note that if some option (e.g. `min`) is not defined for a particular mapping entry - then a corresponding template (`${min}` in this case) is processed as "empty string".
Also, in the "strict mode", only `value` token can be used, other tokens are processed as "empty string".
Also note that JS templates are not supported inside the `${...}` part.

The `state_map` option can be defined per-entity, per-axis or globally for all entities:
* global strict `state_map` is used when all entities on a card have non-numeric values & have a same set of possible values. Applying a global strict `state_map` for numeric entities on a card makes no sense - it may cause a distortion on a graph & numerous "value not found in state_map" warnings in a browser's console. Also, a global strict `state_map` can be used when there is only one entity (which is non-numeric) on a card.
* global relaxed `state_map` is used when all entities on a card have numeric values to define custom labels for some numeric values. Applying a global relaxed `state_map` with numeric mappings makes no sense for non-numeric entities on a card - the mapping will not change a presentation of these non-numeric entities, it will be just a useless job for CPU. Also, a global relaxed `state_map` can be used when there is only one entity (which is numeric) on a card.
* per-entity strict `state_map` is used when a particular mapping must be applied for one particular non-numeric entity only, and there are no other numeric entities on the same Y-axis (e.g. all non-numeric entities are on a `primary` axis, all numeric entities - on a `secondary` axis). Also, can be used when there is only one entity (which is non-numeric) on a card.
* per-entity relaxed `state_map` is used when a particular mapping must be applied for one particular numeric entity only. Also, can be used when there is only one entity (which is numeric) on a card.
* per-axis strict `state_map` is used when a particular mapping must be applied for all non-numeric entities on some particular Y-axis (and there are no numeric entities on the same axis). Important note: this is the only way to apply a mapping to Y-axis labels when an axis contains several entities (they are not mapped in other cases, see below). Also, can be used when there is only one entity (which is non-numeric) on a card (although, ideologically it makes little sense to define a per-axis mapping instead of a per-entity or a global one).
* per-axis relaxed `state_map` is used when a particular mapping must be applied for all numeric entities on some particular Y-axis (and there are no non-numeric entities on the same axis). Also, can be used when there is only one entity (which is numeric) on a card (although, ideologically it makes little sense to define a per-axis mapping instead of a per-entity or a global one).

Mapped values (like `off` & `on` in case of a strict mapping; the relaxed mapping is not considered) are used as Y-axis labels only if (note: logic is a bit simplified below):
* there is only one entity associated with the axis and it has own per-entity strict `state_map`;
* none entity associated with the axis has own per-entity `state_map`, then a per-axis strict `state_map` is applied (if defined);
* none entity associated with the axis has own per-entity `state_map` & there is no per-axis `state_map` defined, then a global strict `state_map` is applied (if defined).

If an order of entries is changed in a "strict" `state_map` mapping array and a `cache` option is not set to `false`, it is recommended to purge a browser's cache - otherwise old cached history data (generated for the old order in `state_map` mapping array) might become wrong for the new config.

See examples [below](#using-state_map).

### Value factor

Defines a coefficient (factor) applied to displayed values (including Y-axis labels).
There are two available options per each Y-axis - `y_axis.primary.value_factor` & `y_axis.secondary.value_factor`:
1. If none option is defined, a default "1" factor is used (values are shown w/o any conversion).
2. If only `y_axis.primary.value_factor` is defined - it is applied to all entities except entities with `y_axis: secondary`; for other entities a default "1" factor is used.
3. If only `y_axis.secondary.value_factor` is defined - it is applied to all entities with `y_axis: secondary`; for other entities a default "1" factor is used.
4. If both `y_axis.primary.value_factor` & `y_axis.secondary.value_factor` are defined - they are applied to entities without `y_axis: secondary` & with `y_axis: secondary` correspondingly.

Each option can be defined either as a `number` or an `object` (see below).

A `number` value is a legacy format and defines an "exponent". Can be used for a unit conversion (e.g. convert Watts to kilo Watts); a negative value can be used to scale down (e.g. convert kilo Watts to Watts).
Any non-numerical value leads to a fallback to a default "1" factor.

An `object` value can be used to define either an "exponent" factor or a "scale" factor, see below:

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| type ***(required)*** | string |  | `exponent` or `scale`.<br>`exponent` - factor is an exponent (can be negative to scale down).<br>`scale` - factor is a multiplier (can be negative to get a negative value).
| factor ***(required)*** | number |  | A value of an exponent or a scale.

Invalid values (absent/undefined/invalid `type` or `factor`) passed in the object lead to a fallback to a default "1" factor.


### Aggregate functions
Recorded values are grouped in time buckets which are determined by `group_by`, `points_per_hour` configuration.
These buckets are converted later to single point/bar on the graph. Aggregate function defines the methods of that conversion.

| Name | Since | Description |
|------|:-------:|-------------|
| `avg` | v0.8.0 | Average
| `median` | v0.11.0 | Median
| `min` | v0.8.0 | Minimum - lowest value
| `max` | v0.8.0 | Maximum - largest value
| `first` | v0.9.0 |
| `last` | v0.9.0 |
| `sum` | v0.9.2 |
| `delta` | v0.9.4 | Calculates difference between max and min value
| `diff` | v0.11.0 | Calculates difference between first and last value

### Alignment for "name" & "icon" elements

Depending on the configuration, the "name" & "icon" elements are aligned as follows:

1. If the icon is hidden (`show.icon: false`) & `align_header` is not defined — the "name" is aligned to the left.
2. If the icon is hidden (`show.icon: false`) & `align_header` is defined — the "name" is aligned to the left/center/right depending on `align_header`.
3. If the icon is shown (here and below) & both `align_header` and `align_icon` are not defined — the "name" is on the left, and the "icon" is on the right.
4. If `align_header` is defined & the name is hidden (`show.name: false`) & `align_icon` is not defined — the "icon" is aligned to the right.
5. If `align_header` is defined & the name is shown & `align_icon` is not defined — the "name" is aligned to the left/center/right depending on `align_header`, and the "icon" is placed on the left (if `align_header: right`) or on the right (if `align_header: left/center`).
6. If both `align_header` & `align_icon` are defined — the "icon" is aligned to the left/right depending on `align_icon`, and the "name" is placed on the left (if `align_icon: right`), on the right (if `align_icon: left`), or in the center (if `align_header: center`), meaning `align_icon` takes precedence.
7. If `align_header` is not defined & `align_icon` is defined — the "icon" is aligned to the left/right depending on `align_icon`, and the "name" is placed on the left (if `align_icon: right`) or on the right (if `align_icon: left`).



### Structured names

*Requires Home Assistant 2026.4 or later. On earlier versions a structured `name` falls back to the entity's friendly name.*

Home Assistant composes an entity's display name out of its registry context (entity, device, area, floor) rather than one `friendly_name` string. A `name` option can be a list of those parts instead of a plain string, so the name keeps following renames and matches what the built-in cards show:
```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.living_room_thermostat_temperature
    name:
      - type: area
      - type: entity
```
Available part types are `entity`, `device`, `area`, `floor`, and `text` (a literal, written as `{type: text, text: 'Indoor'}`). Parts that resolve to nothing are dropped, so the surrounding parts still render. A plain string `name` keeps working exactly as before.

See the [Home Assistant developer documentation](https://developers.home-assistant.io/docs/frontend/data#hassformatentitynamestateobj-name-options)
for details.

### Static values

A static horizontal line is drawn for a user-defined static value.
Can be used in various applications like drawing a threshold line or a zeroth X-axis.

Notes:
1. Like a dynamic graph for an entity (defined by an `entity` option), a static value (defined by a `static_value` option) can use other applicable options: `name`, `line_width`, `line_style`, `color`, `unit`, `decimals`, `show_...`, `state_adaptive_color`, `y_axis`.
2. When a `static_value` entry has a `bar` type (either individually set or inherited from a global `show.graph` option), a `static_value` entry is rendered as a set of constant bars.
3. Displaying extrema/average values is not supported for `static_value` entries.
4. It is possible to display a static value's badge on a corresponding static line: the `show.static_value_labels` option (see [Available show options](#available-show-options)) allows to display the badge either on the left or on the right side of the card; the per-entity `show_static_value_label` option (see [Entities object](#entities-object)) can be used to hide a label for a particular static line; the `static_value_label_offset` global option can be used to define a custom horizontal offset for the static value line label. Also, if a `static_value` entry has a `bar` type (either individually set or inherited from a global `show.graph` option) then a static label cannot not displayed.

See examples [below](#displaying-static-values).

### Number format

Options `decimals` defined "card-wide" and/or for some entity/[static value](#static-values) are used to set an exact number of decimals according to the following rules:
1. For state & attribute values, static values:
- if none `decimals` option is defined - a default presentation (see a note below) is used;
- if `decimals` for some entity is defined - this value is used for this entity;
- if "card-wide" `decimals` is defined - this value is used.
2. For extrema & average values (supported for the 1st entity only):
- if none `decimals` option is defined - a default presentation is used;
- if `decimals` is defined for the 1st entity - this value is used;
- if "card-wide" `decimals` is defined - this value is used.
3. For primary Y-axis labels:
- if "card-wide" `decimals` & `y_axis.primary.decimals` options are not defined - a default presentation is used;
- if `y_axis.primary.decimals` option is defined - this value is used;
- if "card-wide" `decimals` option is defined - this value is used.
4. For secondary Y-axis labels:
- if "card-wide" `decimals` & `y_axis.secondary.decimals` options are not defined - a default presentation is used;
- if `y_axis.secondary.decimals` option is defined - this value is used;
- if "card-wide" `decimals` option is defined - this value is used.
  
A "default presentation" refers to a default look in HA:
1. For a state value (also for extrema & average): if accuracy settings are defined for an entity - these settings are used, otherwise some default HA settings (depend on many factors incl. a `device_class`; for template sensors - a user-defined accuracy set in jinja templates is used).
2. For an attribute value (also for extrema & average): default HA settings are used (for template sensors - a user-defined accuracy set in jinja templates is used).
3. For Y-axis labels, [static values](#static-values): "maximum 2 decimals" accuracy is used.
And for all values, HA number format settings (like `xxxx.xx` or `x xxx.x` or `x,xxx.x`) are used.


### Custom format for datetime values

By default, the card uses global HA Frontend settings for date & time values. An explicitly defined `datetime_format` option overrides the default format.

Note that the same approach is applied to `hour24` option: if the option is not defined, default settings are used. An explicitly defined `hour24` option overrides the default format.

Here are possible values for the `datetime_format` option:
```
DD/MM/YYYY HH:mm  DD.MM.YYYY HH:mm  DD-MM-YYYY HH:mm
MM/DD/YYYY HH:mm  MM.DD.YYYY HH:mm  MM-DD-YYYY HH:mm
YYYY/MM/DD HH:mm  YYYY.MM.DD HH:mm  YYYY-MM-DD HH:mm
```
where can be used `YYYY` or `YY`, `MM` or `M`, `DD` or `D`, `HH` or `H`.
A singular whitespace must be used to separate date & time formats. Letter case does matter.

Any values which do not match the pattern - lead to a fallback to a "day weekday" format (used as the only and default format till v.0.13).
For clarity, it is recommended to explicitly define a `day_weekday` value in case the legacy "day weekday" format is needed.

### Logarithmic options

Normally gaps between numbers on the graph are equal; the gap between 1 and 2 on the graph is the same as the gap between 100 and 101. The `logarithmic` option applies a [logarithmic transformation](https://en.wikipedia.org/wiki/Log_transformation_(statistics)) to the graph. With `logarithmic`, the graph is scaled by powers of 10, so the gap between 1, 10, 100, etc are equal. This is useful when your values span a wide range. Illuminance, for example, can swing from 1 to 5000 over the course of a day, and without a transformation it's hard to read the smaller values on the graph.

Note that this option rounds up the input to 1 so negative numbers or numbers less than 1 are rendered as 0; this is different from the formal definition of logarithm, where `log(x) < 0` when `x > 0 && x < 1` and $\infty$ or `NaN` when `x <= 0`.

### Line styles

A default line style is a "solid line". A style should be defined in a format used for a standard CSS `stroke-dasharray` property. Examples: `10,10` (dashes), `20,10` (long dashes); see cards examples [below](#custom-styles-for-line-graphs). It is better to use along with a `line_width` option.
Warning: the `line_style` option is not accounted if `animation: true` option is set.

### Baseline

The `baseline` option is only meaningful for linear graphs with a fill and bar graphs.

For a linear graph: by default, a fill is applied to an area between a curve and a bottom edge.
With the `baseline` option set, areas between a curve & a baseline are filled.
This can be useful to show a deviation of a value near some basis (like for entities which can be both positive & negative).

For a bar graph: with the `baseline` option set, a bar graph has bars growing upward or downward from the defined baseline. Typically, this can be used with `baseline: 0` to show deviations from zero (positive & negative), although any non-zero value can be defined.

Additionally, the `baseline` option can be set individually for entities; may not be meaningful for bar graphs.

See examples [below](#custom-baseline).

### Inverted graphs

An inverted graph has a vertically flipped Y-scale: lower values are shown at the top, higher values are shown at the bottom.

This type of graph is mainly used when smaller values need to be shown at the top of the scale.

Examples: a ping value (smaller ping is better), a water level in a well (0 level means "well is full", higher values mean "well is empty").

See examples [below](#inverted-y-axis).

### Force a zero vertical position

The `zero_position` option defines a vertical offset of a "Y=0" baseline from a top edge of a graph area.
Although any number `[0..1]` (incl. `0` & `1`) can be set, only values like `0.5` (symmetric split), `0.25` (more attention to a bottom part) or `0.75` (more attention to a top part) should be set.

After fixing a zero vertical position, all upper/lower bounds (including ones defined by a user with `lower_bound` & `upper_bound` options) are automatically re-calculated to fit in new proportions.

Could be useful for these scenarios:
1. Fix a vertical position of a 0-baseline for a rapidly changing graph (although positive & negative peaks will be re-scaled automatically). So it is up to a user whether to see a 0-baseline moving up/down or peaks re-scaled.
2. More interesting case - use for 2 graphs, one graph is inverted, see examples [below](#opposing-dual-axis-graphs).

### Graphs order

Note: this section only applies to line graphs & overlapping bars graphs (with `bar_spacing: -1`).

For each entity/[static value](#static-values), a `line` graph consists of 3 basic parts: a "line" part (curve), a "fill" part (if displaying a fill is configured), a "points" part (if displaying points is configured).

By default, graphs are shown in the following order:
1. All "fill" parts are shown (if configured).
2. All "line" parts are shown.
3. All "points" parts are shown (if configured).

Within each category, parts are shown in the following order:
1. First, a part for the 1st entity/static value in the `entities` list is processed.
2. Last, a part for the last entity/static value in the `entities` list is processed.

I.e. the last entity's/static value's graph will be shown as topmost.

This can be altered by setting a `graph_order` option: `direct` (default) stands for the described default order, `reversed` stands for "1st entity's/static value's graph is topmost".

Similarly for overlapping bars graphs (when `bar_spacing: -1`): by default (or with `graph_order: direct`), bars for each point are processed in the following order:
1. First, a bar for the 1st entity/static value in the `entities` list is processed.
2. Last, a bar for the last entity/static value in the `entities` list is processed.

With `graph_order: reversed`, bars for the 1st entity/static value become topmost.

### Configuration validation

Before the 1st rendering, the card performs a validation of some settings provided in the YAML configuration.
If a misconfigured option is detected, the card reacts dynamically based on the severity of the error.

#### Error severity levels

1. **Critical errors:**
Occurs when the basic configuration is broken (e.g., passing a plain string instead of an array to `entities`). In this case, the card completely blocks its rendering process.
2. **Non-critical warnings:**
If a parameter contains an incorrect data type or an invalid value (e.g., a negative `decimals`), the card outputs a detailed warning to the browser console, assigns that specific option to its safe default value, and then continues to render the card.

#### Validation rules

The list below is not comprehensive:

* **Numeric values**: all numeric options (like `baseline`) are validated against numeric types (`number`).
* **Integers:** all integer numeric options (like `decimals`) are additionally validated to ensure they are integers rather than floating-point values.
* **Quoted numbers**: the card allows numeric values wrapped in quotes (like `hours_to_show: "24"`). The internal parser will safely convert them to numbers, but it will emit a warning in the browser console prompting you to fix the type in your YAML file.
* **Complex config objects**: Complex objects (like `color_thresholds` or `state_map`) undergo a deeper structural audit: the card verifies not only the overall container structure but also the presence, validity, and precise data types of all important inner options .
* **Feature-specific**: check values using more specific criteria (like "`hours_to_show`, `points_per_hour` & `group_by` should match with each other").
  

> **Troubleshooting tip:** If your card is shown blank or behaves unexpectedly, press `F12` to open your browser's Developer Tools, navigate to the **Console** tab and check the logged warnings emitted by `mini-graph-card`.


### Supported color formats
Color can be defined as:
- `red` (available web colors)
- `#ff0000` (HEX format, values must be provided in quotes)
- `#ff000055` (HEX format with opacity, values must be provided in quotes)
- `rgb(255, 0, 0)` (RGB format)
- `rgba(255, 0, 0, 0.2)` (RGB format with opacity)
- `var(--primary-text-color)`, `var(--red-color)` (or any other theme variable supported by HA Frontend)



### Theme variables
The following theme variables can be set in your HA theme to customize the appearance of the card.

| Name | Default | Description |
|------|:-------:|-------------|
| mcg-title-letter-spacing |  | Letter spacing of the card title (`name` option).
| mcg-title-font-weight | 500 | Font weight of the card title.
| mcg-label-axis-opacity | 0.75 | Opacity of the Y-axis labels.
| mcg-label-static-opacity | 0.75 | Opacity of the static values' labels.
| mcg-label-axis-border-radius | 1em | Border radius of the Y-axis labels.
| mcg-label-static-border-radius | 1em | Border radius of the static values' labels.
| mcg-bar-seam-opacity | 0.3 | Bar stroke opacity (see a note below).
| mcg-bar-seam-width | 0.5px | Bar stroke width (see a note below).

Note: Bar stroke is added to a bar for a better presentation if `bar_spacing: 0`.
The opacity is applied for a color defined as `stroke-color: var(--card-background-color, white)`.
Customizing these 2 variables may be desirable for some client devices.


---

## Example usage

### Single entity card

![Single entity card](https://user-images.githubusercontent.com/457678/52009150-884d2500-24d2-11e9-9f2b-2981210d3897.png)

```yaml
type: custom:mini-graph-card
entities:
 - sensor.illumination
```

Alternative style:

![Alternative style](https://user-images.githubusercontent.com/457678/52009161-8daa6f80-24d2-11e9-8678-47658a181615.png)

```yaml
type: custom:mini-graph-card
entities:
 - sensor.illumination
align_icon: left
align_state: center
show:
  fill: false
```

---

### Multiple entities card

![Multiple entities card](https://user-images.githubusercontent.com/457678/52009165-900cc980-24d2-11e9-8cc6-c77de58465b5.png)

```yaml
type: custom:mini-graph-card
name: SERVER
icon: mdi:server
entities:
  - entity: sensor.server_total
    name: TOTAL
  - sensor.server_sent
  - sensor.server_received
```

---

### Different graph types

See above for simple "Only linear graphs" examples.

Bar graph:

![Bar chart card](https://user-images.githubusercontent.com/457678/52970286-985e7300-33b3-11e9-89bc-1278c4e2ecf2.png)

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.energy_consumption
name: ENERGY CONSUMPTION
show:
  graph: bar
```

Linear & bar graphs:

<img width="479" height="305" alt="image" src="https://github.com/user-attachments/assets/0e0874f5-8e5d-4854-be58-8a65e14b4fbb" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.system_monitor_memory_use
  - entity: sensor.system_monitor_processor_use
    show_state: true
    y_axis: secondary
    graph: bar
height: 200
y_axis:
  secondary:
    lower_bound: 0
points_per_hour: 2
bar_spacing: 1
show:
  labels: true
  labels_secondary: true
  name: false
  icon: false
```

---

### Bar spacing

Custom `bar_spacing` & `bar_spacing_group`:

<img width="476" height="305" alt="image" src="https://github.com/user-attachments/assets/0f0bd87b-13d0-4237-b8ab-0c457d3df1d5" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.ac68u_cpu_usage
    state_adaptive_color: true
  - entity: sensor.system_monitor_processor_use
    show_state: true
    state_adaptive_color: true
hours_to_show: 0.75
points_per_hour: 60
height: 200
smoothing: false
aggregate_func: last
bar_spacing: 1
bar_spacing_group: 4
show:
  graph: bar
  icon: false
  name: false
```
Placing bars on each other with `bar_spacing: -1`:

<img width="485" height="311" alt="image" src="https://github.com/user-attachments/assets/8fd8bdae-cd0e-4519-860c-b0bf54e824f4" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.ac68u_cpu_usage
    state_adaptive_color: true
  - entity: sensor.system_monitor_processor_use
    show_state: true
    state_adaptive_color: true
hours_to_show: 0.75
points_per_hour: 60
height: 200
smoothing: false
aggregate_func: last
bar_spacing: -1
show:
  graph: bar
  icon: false
  name: false
```

---

### Show data from the past week
![Show data from the past week](https://user-images.githubusercontent.com/457678/52009167-913df680-24d2-11e9-8732-52fc65e3f0d8.png)

Use the `hours_to_show` option to specify how many hours of history the graph should represent.
Use the `points_per_hour` option to specify the accuracy/detail of the graph.

```yaml
type: custom:mini-graph-card
entities:
  - sensor.living_room_temp
name: LIVING ROOM
hours_to_show: 168
points_per_hour: 0.25
```

---

### Graph only card
Use the `show` option to show/hide UI elements.

<img width="482" height="127" alt="image" src="https://github.com/user-attachments/assets/95196d3b-4de9-49a1-ae88-72bf19b3f3d2" />

```yaml
type: custom:mini-graph-card
entities:
  - sensor.humidity
show:
  icon: false
  name: false
  state: false
```

---

### Horizontally stacked cards
You can stack cards horizontally by using one or more `horizontal-stack(s)`.

![Horizontally stacked cards](https://user-images.githubusercontent.com/457678/52009171-926f2380-24d2-11e9-9dd4-28f010608858.png)

```yaml
type: horizontal-stack
cards:
  - type: custom:mini-graph-card
    entities:
      - sensor.humidity
    line_color: blue
    line_width: 8
    font_size: 75
  - type: custom:mini-graph-card
    entities:
      - sensor.illumination
    line_color: '#e74c3c'
    line_width: 8
    font_size: 75
  - type: custom:mini-graph-card
    entities:
      - sensor.temperature
    line_color: var(--accent-color)
    line_width: 8
    font_size: 75
```

---

### Dynamic line color
Have the graph change line color dynamically.

![Dynamic line color](https://user-images.githubusercontent.com/457678/52573150-cbd05900-2e19-11e9-9e01-740753169093.png)

```yaml
type: custom:mini-graph-card
entities:
  - sensor.sensor_temperature
show:
  labels: true
color_thresholds:
  - value: 20
    color: "#f39c12"
  - value: 21
    color: "#d35400"
  - value: 21.5
    color: "#c0392b"
```

With `color_thresholds_transition: hard`:

<img width="479" height="220" alt="image" src="https://github.com/user-attachments/assets/1e976185-3c0d-4ce8-89cc-d0be99bcdb8a" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.xiaomi_cg_1_co2
color_thresholds:
 - value: 400
   color: green
 - value: 780
   color: orange
 - value: 850
   color: red
color_thresholds_transition: hard   
hours_to_show: 1
points_per_hour: 60
height: 200
show:
  name: false
  icon: false
  labels: true
  state: false
```

---

### Alternate Y-axis
Have one or more series plot on a separate Y-axis, which appears on the right side of the graph. This example also
shows turning off the line, points and legend.

![Alternate Y-axis](https://user-images.githubusercontent.com/373079/60764115-63cf2780-a0c6-11e9-8b9a-97fc47161180.png)

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.verandah
    name: Verandah
  - entity: sensor.lounge
    name: Lounge
  - entity: sensor.kitchen
    name: Kitchen
  - color: gray
    entity: input_number.nighttime
    name: Night
    show_line: false
    show_points: false
    show_legend: false
    y_axis: secondary
show:
  labels: true
  labels_secondary: true
```

---

### Custom styles for line graphs

Set a custom line style globally for a whole card or per-entity:

<img width="478" height="221" alt="image" src="https://github.com/user-attachments/assets/daafee31-dec7-42bf-afa4-a3393755fbae" />

```
type: custom:mini-graph-card
entities:
  - entity: sensor.xiaomi_cg_1_temperature
line_style: 20,10
```

<img width="485" height="259" alt="image" src="https://github.com/user-attachments/assets/ce67cc56-b7eb-448f-aa7f-1ad48f3a65e1" />

```
type: custom:mini-graph-card
entities:
  - entity: sensor.xiaomi_cg_1_temperature
    line_style: 20,10
  - entity: sensor.xiaomi_cg_2_temperature
    line_style: 6,6
```

---

### Displaying static values

Threshold line:

<img width="485" height="257" alt="image" src="https://github.com/user-attachments/assets/7d668913-1811-48e8-9a24-d6bed93f7ee9" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.system_monitor_processor_use
  - static_value: 50
    name: Threshold
    unit: "%"
    show_legend_state: true
    show_state: false
    show_points: false
    show_fill: false
    line_width: 1
    line_style: 4,7
    color: red
y_axis:
  primary:
    lower_bound: ~0
show:
  labels: true
```

Zeroth X-axis:

<img width="480" height="219" alt="image" src="https://github.com/user-attachments/assets/2fe260f2-439c-4652-b817-feec461cbee8" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.temperature
  - static_value: 0
    show_state: false
    show_points: false
    show_fill: false
    show_legend: false
    line_width: 1
    color: grey
show:
  labels: true
```

Static line which is not hidden when a point of a line of another entity selected:

<img width="481" height="353" alt="изображение" src="https://github.com/user-attachments/assets/bc11d3c1-c557-46e0-afe9-b7d2e17b35be" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.system_monitor_processor_use
    line_width: 4
  - static_value: 50
    name: Threshold
    unit: "%"
    show_legend_state: true
    show_state: false
    show_points: false
    line_width: 1
    line_style: 4,7
    color: red
    show_static_inactive: true
y_axis:
  primary:
    lower_bound: ~0
points_per_hour: 60
hours_to_show: 3
height: 200
show:
  labels: true
  fill: false
```

Static line with labels:

<img width="481" height="306" alt="image" src="https://github.com/user-attachments/assets/405e3e3a-ef84-46b0-a48b-67fbf40c79ce" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.system_monitor_processor_use
    color: red
  - static_value: 10
    unit: "%"
    show_fill: false
    show_points: false
    show_legend: false
    color: red
    line_width: 1
    line_style: 4,7
    state_adaptive_color: true
  - entity: sensor.system_monitor_memory_use
    color: green
    show_state: true
    y_axis: secondary
  - static_value: 1700
    unit: MiB
    show_fill: false
    show_points: false
    show_legend: false
    color: green
    line_width: 1
    line_style: 4,7
    state_adaptive_color: true
    y_axis: secondary
hours_to_show: 3
points_per_hour: 120
height: 200
static_value_label_offset: 7
show:
  name: false
  icon: false
  legend: true
  fill: false
  static_value_labels: right
  labels: true
  labels_secondary: true
```

---

### Custom baseline

Baseline is set to 0:

<img width="480" height="402" alt="image" src="https://github.com/user-attachments/assets/3b38e7dd-d5e6-4b9c-b75c-b6b53c07f04c" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.xxx
baseline: 0
height: 400
show:
  labels: true
  name: false
  icon: false
  state: false
  fill: fade
```

Individual baselines for entities (along with displaying static lines):

<img width="488" height="309" alt="image" src="https://github.com/user-attachments/assets/a93ddf8f-eaf3-4d63-8e15-720e69fe3470" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.xiaomi_cg_1_co2
    baseline: 800
    color: orange
    name: Room 1
  - static_value: 800
    line_width: 1
    color: orange
    show_fill: false
    show_legend: false
    show_static_inactive: true
  - entity: sensor.xiaomi_cg_2_co2
    show_state: true
    baseline: 1000
    color: green
    name: Room 2
  - static_value: 1000
    line_width: 1
    color: green
    show_fill: false
    show_legend: false
    show_static_inactive: true
height: 200
show:
  static_value_labels: left
  name: false
  icon: false
  labels: true
```

Bar graph with a baseline set to 0:

<img width="474" height="265" alt="image" src="https://github.com/user-attachments/assets/1bd4029b-d086-4748-add0-f7408551f147" />


```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.xxx
baseline: 0
height: 200
show:
  graph: bar
  name: false
  icon: false
  labels: true
```

---

### Inverted Y-axis

Water level in a well: a 0 value means "well is full", a higher value - "well is depleted/empty":

<img width="477" height="272" alt="image" src="https://github.com/user-attachments/assets/446013ca-eca8-4344-85e4-d20d18c189f3" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.water_level
    baseline: 100
height: 200
y_axis:
  primary:
    invert: true
show:
  name: false
  icon: false
  state: true
  labels: true
```

Example for a bar graph:

<img width="480" height="274" alt="image" src="https://github.com/user-attachments/assets/25c95530-a71d-4b3f-81c0-f4ca594ae9cf" />

```yaml

type: custom:mini-graph-card
entities:
  - entity: sensor.water_level
height: 200
y_axis:
  primary:
    invert: true
show:
  name: false
  icon: false
  state: true
  labels: true
  graph: bar
```

---

### Opposing dual-axis graphs

Linear graphs (a static line stands for a 0-baseline, only `max` & `zero` labels are shown):

<img width="480" height="307" alt="image" src="https://github.com/user-attachments/assets/9e951595-f9bd-4aff-9047-bbc464039a9a" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.ac68u_download
    state_adaptive_color: true
  - entity: sensor.ac68u_upload
    y_axis: secondary
    show_state: true
    state_adaptive_color: true
  - static_value: 0
    line_width: 1
    line_style: 2,4
    show_state: false
    show_fill: false
    show_legend: false
    color: red
    graph: line
height: 200
show:
  name: false
  icon: false
  labels: true
  labels_secondary: true
baseline: 0
y_axis:
  zero_position: 0.75
  primary:
    labels: ['max','zero']
  secondary:
    invert: true
    labels: ['max','zero']
```

A similar presentation with bar graphs (a "zero" label is added as a static line label):

<img width="480" height="310" alt="image" src="https://github.com/user-attachments/assets/43f292ea-a645-4f44-98c8-0fd91c50328a" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.ac68u_download
    state_adaptive_color: true
  - entity: sensor.ac68u_upload
    y_axis: secondary
    show_state: true
    state_adaptive_color: true
  - static_value: 0
    line_width: 1
    line_style: 2,4
    show_state: false
    show_fill: false
    show_legend: false
    color: red
    graph: line
height: 200
bar_spacing: -1
static_value_label_offset: 10
show:
  graph: bar
  static_value_labels: left
  name: false
  icon: false
baseline: 0
y_axis:
  zero_position: 0.75
  secondary:
    invert: true
```

---

### Grouping by date

![mini_energy_daily](https://user-images.githubusercontent.com/8268674/66688605-3ffc1e80-ec7f-11e9-872e-935870a542f3.png)

You can group values by date, this way you can visualize for example daily energy consumption.

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.energy_daily
name: Energy consumption
hours_to_show: 168
aggregate_func: max
group_by: date
show:
  graph: bar
```

---

### Data aggregation functions
You can decide how values are aggregated for points on graph. Example how to display min, max, avg temperature per day
from last week.

![mini_temperature_aggregate_daily](https://user-images.githubusercontent.com/8268674/66688610-44c0d280-ec7f-11e9-86c2-a728da239dab.png)

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.outside_temp
    aggregate_func: max
    name: Max
    color: "#e74c3c"
  - entity: sensor.outside_temp
    aggregate_func: min
    name: Min
  - entity: sensor.outside_temp
    aggregate_func: avg
    name: Avg
    color: green
name: Temp outside daily (last week)
hours_to_show: 168
group_by: date
```

---

### Using `state_map`

Show data coming from binary sensors:

![mini_binary_sensor](https://user-images.githubusercontent.com/8268674/66825779-e1ff5d80-ef42-11e9-89eb-673d2ada8d34.png)

```yaml
type: custom:mini-graph-card
entities:
  - entity: binary_sensor.living_room_motion
    name: Living room
  - entity: binary_sensor.corridor_motion
    name: Corridor
  - entity: binary_sensor.master_bed_motion
    name: Master bed.
    color: green
  - entity: binary_sensor.bedroom_motion
    name: Bedroom
name: Motion last hour
hours_to_show: 1
points_per_hour: 60
update_interval: 30
aggregate_func: max
line_width: 2
smoothing: false
state_map:
  - value: "off"
    label: Clear
  - value: "on"
    label: Detected
```

Show a custom label for numeric values:

<img width="484" height="181" alt="image" src="https://github.com/user-attachments/assets/a9260a39-b4a1-423f-9ef5-649a4bdbcc0c" />

```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.xiaomi_cg_1_co2
state_map:
  keep_values: true
  map:
    - min: 650
      max: 750
      label: Warning - ${raw}
show:
  name: false
  icon: false
  labels: true
```

---

### Showing additional info on the card

![изображение](https://user-images.githubusercontent.com/71872483/170584118-ef826b60-dce3-42ec-a005-0f467616cd37.png)

It is possible to show a state without displaying a graph for a sensor.
Imagine there are two CO-2 sensors & one humidity sensor; graphs are displayed for the CO-2 only, and the humidity is shown as a state only.
```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.xiaomi_cg_1_humidity
    show_state: true
    show_graph: false
  - entity: sensor.xiaomi_cg_1_co2
    color: green
    show_state: false
    name: CO2-1
  - entity: sensor.xiaomi_cg_2_co2
    color: orange
    show_state: false
    name: CO2-2
name: Humidity
hours_to_show: 4
points_per_hour: 60
show:
  name: true
  legend: true
  icon: false
  labels: true
```
This method may be also used to add a calculated value with it's own `aggregate_func` option.

---

### Accessing attributes in complex structures

When using the `attribute` option in the [entities object](#entities-object), you can access data in structured attributes, such as dictionaries and lists.

#### Accessing dictionary attributes
Suppose you have data stored inside a *dictionary* attribute named `dict_attribute`
```yaml
dict_attribute:
  value_1: 53
  value_2: 64
  value_3: 72
```
Such data should be addressed as `dict_attribute.sub_attribute`:
```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.testing_object_data
    attribute: dict_attribute.value_1
    name: value_1 from dictionary attribute
```
![image](https://github.com/ildar170975/mini-graph-card/assets/71872483/0549afd5-901e-4e86-a144-edc4cd207440)

#### Accessing list attributes

Suppose you have data stored inside a *list* attribute named `list_attribute`:
```yaml
list_attribute:
  - value_1: 67
    value_2: 65
    value_3: 93
  - value_1: 134
    value_2: 130
    value_3: 186
  - value_1: 201
    value_2: 195
    value_3: 279
```
Such data should be addressed as `list_attribute.index.sub_attribute`:
```yaml
type: custom:mini-graph-card
entities:
  - entity: sensor.testing_object_data_list
    attribute: list_attribute.0.value_1
    name: value_1 from first element of list attribute
```
![image](https://github.com/ildar170975/mini-graph-card/assets/71872483/eebd0cea-da93-4bf5-97a1-118edd2a9c5e)

---

## Development

1. Clone this repository into your `config/www` folder using git:

```console
$ git clone https://github.com/kalkih/mini-graph-card.git
```

2. Add a reference to the card in your `ui-lovelace.yaml`:

```yaml
resources:
  - url: /local/mini-graph-card/dist/mini-graph-card-bundle.js
    type: module
```

### Instructions

*Requires `nodejs` & `npm`.*

1. Move into the `mini-graph-card` repo, checkout the *dev* branch & install dependencies:
```console
$ cd mini-graph-card && git checkout dev && npm install
```

2. Make changes to the source code.

3. Build the source by running:
```console
$ npm run build
```

4. Refresh the browser to see changes.

    *Make sure cache is cleared or disabled.*

5. *(Optional)* Watch the source and automatically rebuild on save:
```console
$ npm run watch
```

*The new `mini-graph-card-bundle.js` will be build and ready inside `/dist`.*

Note that the `dev` branch is the most up-to-date and matches our beta releases.

Please refer to the [Contribution Guidelines](./CONTRIBUTING.md) if you're interested in contributing to the project. (And thanks for considering!)

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `mini-graph-card.js` & `mini-graph-lib.js`.

If you have issues after updating the card, try clearing your browser cache.

If you have issues displaying the card in older browsers, try changing `type: module` to `type: js` at the card reference in `ui-lovelace.yaml`.

## License
This project is under the MIT license.
