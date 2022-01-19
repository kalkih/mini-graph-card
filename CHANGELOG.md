# [0.11.0-dev.5](https://github.com/kalkih/mini-graph-card/compare/v0.11.0-dev.4...v0.11.0-dev.5) (2022-01-16)


### Bug Fixes

* **config:** Remove entity config error [#592](https://github.com/kalkih/mini-graph-card/issues/592) ([#593](https://github.com/kalkih/mini-graph-card/issues/593)) ([b3edf6a](https://github.com/kalkih/mini-graph-card/commit/b3edf6a00b9dd74c527f09bbd5fb1f32e3668fd7))


### Features

* Interpolate color threshold stops ([#596](https://github.com/kalkih/mini-graph-card/issues/596)) ([61e2d62](https://github.com/kalkih/mini-graph-card/commit/61e2d62b2b10464196468bb44897f28fd20b20c5))

# [0.11.0-dev.4](https://github.com/kalkih/mini-graph-card/compare/v0.11.0-dev.3...v0.11.0-dev.4) (2021-02-17)


### Bug Fixes

* Support for `fire-dom-event` ([bcf7ac4](https://github.com/kalkih/mini-graph-card/commit/bcf7ac46e1084817d6cdc394ce0abe6f99cad656)), closes [#563](https://github.com/kalkih/mini-graph-card/issues/563)

# [0.11.0-dev.3](https://github.com/kalkih/mini-graph-card/compare/v0.11.0-dev.2...v0.11.0-dev.3) (2021-02-14)


### Features

* **attribute:** Retrieve an attribute instead of the state ([#564](https://github.com/kalkih/mini-graph-card/issues/564)) ([3caafdb](https://github.com/kalkih/mini-graph-card/commit/3caafdb6f9b8d9fa1cb86b7ebc9872a79fcf5c19)), closes [#411](https://github.com/kalkih/mini-graph-card/issues/411) [#245](https://github.com/kalkih/mini-graph-card/issues/245) [#501](https://github.com/kalkih/mini-graph-card/issues/501)

# [0.11.0-dev.2](https://github.com/kalkih/mini-graph-card/compare/v0.11.0-dev.1...v0.11.0-dev.2) (2021-01-20)


### Bug Fixes

* display a warning if entity is not available ([#545](https://github.com/kalkih/mini-graph-card/issues/545)) ([38eddd0](https://github.com/kalkih/mini-graph-card/commit/38eddd095d852c6b44dd3b968799b271ce8549db)), closes [#487](https://github.com/kalkih/mini-graph-card/issues/487)
* Fix undefined variable introduced by [#545](https://github.com/kalkih/mini-graph-card/issues/545) ([d566b1b](https://github.com/kalkih/mini-graph-card/commit/d566b1bcf44faf27aef4ccb94f6aa4c140b84537))
* **log:** color_thresholds render incorectly with logaritmic on ([#542](https://github.com/kalkih/mini-graph-card/issues/542)) ([5ab70dc](https://github.com/kalkih/mini-graph-card/commit/5ab70dc5acb1ffb33e27fafa7c8dd1e9981f88a5)), closes [#531](https://github.com/kalkih/mini-graph-card/issues/531)


### Features

* **graph:** Add median aggregate function ([#521](https://github.com/kalkih/mini-graph-card/issues/521)) ([e5b3c19](https://github.com/kalkih/mini-graph-card/commit/e5b3c19e72e8779cdb9912799f7af429c4ef3b0b))

# [0.11.0-dev.1](https://github.com/kalkih/mini-graph-card/compare/v0.10.0...v0.11.0-dev.1) (2021-01-17)


### Bug Fixes

* icon will properly follow entity's device_class [[#484](https://github.com/kalkih/mini-graph-card/issues/484)] ([738a492](https://github.com/kalkih/mini-graph-card/commit/738a4927a3dab8223c97e49ce58fefc064a4df61))
* Time would sometime display 24:xx instead of 00:xx [[#536](https://github.com/kalkih/mini-graph-card/issues/536)] ([981fd91](https://github.com/kalkih/mini-graph-card/commit/981fd91deb8370a1039c80b28c4da4d17718fdc5))


### Features

* Format numbers according to selected language [[#495](https://github.com/kalkih/mini-graph-card/issues/495) [#509](https://github.com/kalkih/mini-graph-card/issues/509)] ([875b557](https://github.com/kalkih/mini-graph-card/commit/875b55743a0152e7630a6111d7128a2a28657c97))


# v0.10.0

### ✨ NEW
- Added logarithmic scale option (#468) @Hypfer
- Make card appear in lovelace card picker #493 (#492) @dcs8
- Display card documentation in HACS @jcgoette

### 🔨 FIXED
- Fix initial graph load when using 'update_interval' option #465 (#452) @PronkMedia

### 📝 DOCUMENTATION
- Refine & improve manual installation instructions (#416) @theFork
- Reorganize examples (#397) @agneevX
- Spelling fixes in docs (#497) @scop

# v0.9.4

### ✨ NEW
- Added soft bound support for lower & upper bounds #114 (#330) @Silencer2K
- Added delta option in aggregate_func (#329) @PierreB49
- Added `value_factor` option, to scale value shown in state label (#362) @dzikimarian
- Faster history & decreased data usage #373 (#392)

### 🔨 FIXED
- Fixed incorrect value for the first point #289 (#327) @maxwroc
- Reduce white space when extrema isn't enabled #320 (#325)
- Check for undefined hass before accessing it (#359)
- Readme typos & improvements (#340) (#356) @EpicLPer @mikalauskas


# v0.9.3

### FIXED
- HA 0.106.x compatible #274 (#276)


# v0.9.2

### ADDED
- Added sum aggregate function #257

### FIXED
- Fixed graph not rendering if the same entity is used multiple times in a config #263


# v0.9.1

### FIXED
- Fixed broken extrema


# v0.9.0

### ADDED
- New aggregate functions first & last #229 (#241)
- New bar spacing option #221 (#242)
- Added log of card version to the browser console
- Option to enable/disable caching (#212)
- Option to override default more-info entity (#202)
- Added missing option parameter `url` to tap action docs

### FIXED
- Graph date not calculated correctly around midnight in certain configurations (#253)
- Improved handling of out of bound history entries (#251)
- Initial graph entry not always correct (#251)
- Graph missing latest history entry after entity update (#250)
- Changes to min, max, avg not updating properly #248 (#249)
- Prevent tooltip from triggering multiple times on legend hover
- Fixed broken babel build (developers)
- Graphs not updating in time resulting in inconsistent x/y axis relation #194 #200 (#214)
- Graphs not updating in sync resulting in inconsistent x/y axis relation #194 #200 (#214)
- Missing and invalid/malformed graph data caused by caching #193 (#213)
- Fixed invalid rendering of bars when hiding certain entities
- Fill not showing when line is hidden & animate option is enabled


# v0.9.0-beta

### ADDED
- Option to enable/disable caching (#212)
- Option to override default more-info entity (#202)
- Missing option parameter `url` to tap action docs

### FIXED
- Graphs not updating in time resulting in inconsistent x/y axis relation #194 #200 (#214)
- Graphs not updating in sync resulting in inconsistent x/y axis relation #194 #200 (#214)
- Missing and invalid/malformed graph data caused by caching #193 (#213)
- Fixed invalid rendering of bars when hiding certain entities
- Fill not showing when line is hidden & animate option is enabled

# v0.8.2

### ADDED
- Support for config updates after initial render (e.g. card editor & lovelace-auto-entities) #184 (#185)
- Theme variable for title font weight
- Theme variable for title font letter-spacing
- Entity option `show_graph` to docs
- Small tooltip time reveal animation

### FIXED
- Invalid rendering when group by date missed data for complete date(s) #183 (#187)
- Rendering of additional bars in one bar graphs (#186)
- Increased default font weight of title to `500` from `400`
- Non-numeric states cut off at the bottom

# v0.8.1

### FIXED
- Reduced minimum bar height (#178)
- Parse commas in state (#177)

# v0.8.0

### ADDED
- Grouping by date (#78) (#165)- (@maxwroc)
- Grouping by hour (#172)
- Point calculation / aggregation functions (max, min, avg) (#78) (#165) - (@maxwroc)
- Smoothing setting (#170) - (@maxwroc)
- Rendering non-numeric sensor states e.g. binary sensors (#63) (#170) - (@maxwroc)

### FIXED
- Rendering initial cached state (#117) (#170) - (@maxwroc)
- Color threshold line with custom bounds (#166) (#174)
- Clipping of graph points at Y-axis extrema
- Graph margins & jumpy/jerky movements in certain browsers
- Threshold color when state is below minimum provided threshold stop

# v0.7.0

### BREAKING CHANGE
Dropped support for **custom_updater**, if you relied on **custom_updater**, consider switching to [**HACS**](https://github.com/custom-components/hacs).

### ADDED
- Custom tap/click action option `tap_action` (#94)
- More default colors (#149) - (@SNoof85)
- Default icons for more device classes (`pressure`, `power` & `signal_strength`) (#155)
- Option `url` to available tap actions (#160) (#164)

### CHANGED
- Color threshold gradient is now also applied to graph fill (vertically) (#112) (#152)
- Current state unit of measurement no longer wraps to the next line and is instead truncated with ellipsis if space is limited

### FIXED
- Not rendering extrema/average info container if not used, eliminates unwanted extra padding
- Invalid legend entry color when color thresholds (#151)
- Invalid graph fill color when color thresholds (#146)
- Preserve aspect ratio of legend indicators (#142)
- README layout and formatting (#162) - (@danstis)

# v0.6.0

### ADDED
- Option `fixed_value` to graph only the current state of an entity (#128) - (@snarky-snark)
- Average display option, similar to extrema (#135) - (@TheLastProject)
- Ability to press entity state for more info popup (#136) - (@jbalague)

### FIXED
- Invalid bar width when hiding entities (bar graph) (#124) - (@caphm)
- Fixed issue with color threshold when graph upper bound equaled graph lower bound (@michaelblight)
- Fixed invalid graph bounds when graph includes hidden entities (#130) - (@michaelblight)
- Pressing graph entries should now properly trigger the more-info popup
- Broken image link in README

# v0.5.0

### ADDED
- Compression of cached data (#98) - (@bramkragten)
- Added 'mcg-title-letter-spacing' theme variable (#111)
- Added `show_graph` option to entities, to show state but hide from graph (#82)
- Added `show_fill` option to entities (@michaelblight)
- Added `show_line` option to entities (#116) - (@michaelblight)
- Added `show_points` option to entities (#116) - (@michaelblight)
- Added `show_legend` option to entities (#116) - (@michaelblight)
- Added support for a secondary y-axis (#116, #113) - (@michaelblight)

### CHANGED
- Optimized caching (#98) - (@bramkragten)
- Line point fill is now based on theme variable `primary-background-color` instead of `paper-card-background-color`
- Removed letter-spacing from title (#111)

# v0.4.3

### ADDED
- Color threshold transition option, `color_thresholds_transition` (yeah...very long name) (#91)
- Added hover effect to legend to highlight entity and display current entity state
- Purging of old cached history (#96) - (@bramkragten)

### CHANGED
- Interpolate fill, name & icon color based on color thresholds
- Redesign of line point hover (#99)
- Moved to localForage for caching (#96) - (@bramkragten)

### FIXED
- Center state misalignment
- Interpolate color for out of bound thresholds (#91)
- Error when localStorage quota was exceeded (#95, #97)
- Empty graph when color thresholds wasn't being used (#92)
- Invisible graph lines when color thresholds where out of bounds (#91, #92)
- Invalid rendering of color thresholds when lower bound wasn't at zero (#91, #92)

# v0.4.3-beta2

### CHANGED
- Redesign of line point hover (#99)
- Moved to localForage for caching (#96) - (@bramkragten)

### FIXED
- Interpolate color for out of bound thresholds (#91)
- Error when localStorage quota was exceeded (#95, #97)

# v0.4.3-beta

### FIXED
- Empty graph when color thresholds wasn't being used (#92)
- Invisible graph lines when color thresholds where out of bounds (#91, #92)
- Invalid rendering of color thresholds when lower bound wasn't at zero (#91, #92)

# v0.4.2

### FIXED
- Issues related to color_thresholds (#91, #92, #93)

# v0.4.1

### CHANGED
- Changed/improved appearance of color thresholds
- Color thresholds are now rendered vertically instead of horizontally (#90)

### FIXED
- Broken line color thresholds

# v0.4.0
This version brings many improvements to how sensor history is fetched and handled, this should result in much quicker loading of the graph.
These improvements should also reduce stress on the HA backend, since the card now cache history data locally in the browser and only request data it's missing.

Thanks @bramkragten for the contributions!

### ADDED
- Local caching of history data (#88) - (@bramkragten)
- New `update_interval` option, set a custom update interval of history data, instead of on every state change (#88) - (@bramkragten)

### CHANGED
- Now only fetching new history since last update, instead of all history every time (#88) - (@bramkragten)

### FIXED
- Jitter when hovering over points in particular configs (#87)

# v0.3.3
- **Fixed:** Fixed values for missing history, was assigned the previous known average value instead of the previous known absolute value (#41)

# v0.3.2
- **New:** Dates are now formatted by locale
- **Fixed:** Improved secondary state text alignment (#75)
- **Fixed:** Max bars check in bar graph

# v0.3.1
- **New:** Options `name_adaptive_color`, `icon_adaptive_color` in `show` option object to display the name/icon in the entity color (#67, #50)
- **New:** Option `state_adaptive_color` in entity object, to display the state in the entity color (#67)
- **New:** Option `show_indicator` in entity object, to display a color indicator next to the state (#72)
- **New:** Option `font_size_header` added (#53)
- **New** Added date (day/weekday) to timestamps when timeframe > 24 (#61)
- **New** It's now possible to set `hours_to_show` to float values and values lower than one.
- **Changed** Legend color indicators are now circular instead of rectangular
- **Fixed:** Bar chart now shows correct amount of bars
- **Fixed:** Points should no longer be cut off when at the very bottom of the graph
- **Fixed:** Timestamps for bars
- **Fixed:** Missing paddings between card elements when group option was set to `true`
- **Fixed:** Unwanted overflow when border radius applied
- **Fixed:** Improved compatibility (#64)

# v0.3.0
- **New:** Support for bar charts (#49)
- **New:** Parameter `bar` added to `show` -> `graph`, display graph as a bar chart (#49)
- **New:** Option `unit` added to entity object, overrides `unit` set in base
- **Change:** `graph` option now defaults to `line` (#49)
- **Change:** Font size of additional displayed state to the same as the main state (when a single additional state is displayed).
- **Fixed:** Color thresholds not being applied correctly with several cards in the same view (#52, #54)
- **Fixed:** `height` option can now be set to zero
- **Fixed:** Timestamps are now properly center aligned if state is center aligned

# v0.2.4
- **New:** Parameter `fade` for `show` -> `fill` option, makes the fill fade out (#45)
- **Fixed:** History entries with `null` state breaking graph (#46)
- **Fixed:** compatibility issues with the custom swiper-card
- **Fixed:** Broken extrema

# v0.2.3
- **New:** Option `color_thresholds` (#45)
- **New:** Color thresholds now changes dynamically with the history (#45)
- **New:** Options `lower_bound` & `upper_bound` added (#40)
- **New:** Option `color` to entity object, overrides other color options
- **Change:** `entities` option now always requires a list, changed in order to be compatible with "Unused entities" UI (#44) **(BREAKING CHANGE)**
- **Change:** Default value for `points_per_hour` changed from `1` to `0.5`.
- **Fixed:** Updated lit-element to v2.0.1
- **Fixed:** Zero values show up as current value when hovered over (#41)
- **Fixed:** Added additional checks for empty history
- **Removed:** `entity` option, which was previously deprecated since v0.2.0, use `entities` option (#44) **(BREAKING CHANGE)**.
- **Removed:** `line_color_above` and `line_color_below`, see new `color_thresholds` option (#45) **(BREAKING CHANGE)**

# v0.2.2
- **New:** Label design (#35)
- **New:** Entity name now visible in title when graph point is hovered over (#39)
- **New:** `hover` parameter for labels
- **New:** Now rendering missing history as a horizontal line up to the first available history entry (similar to the default history-graph)
- **Change:** Made labels visible on hover by default
- **Change:** Label font size now has a min size and scales relative to the `font_size` option
- **Fixed:** Significantly improved accuracy of graph point values
- **Fixed:** Only fetch history for updated entities, use cache to update rest
- **Fixed:** Graph points not applying threshold color from `line_color_above` / `line_color_below` (#38)
- **Fixed:** Invalid timestamps when combining `points_per_hour` & `hours_to_show` (#37, #36)
- **Fixed:** Misaligned legend text
- **Fixed:** Missing bottom padding when graph is hidden
- **Fixed:** Invisible lines when graph was updated after not covering the full width on load
- **Fixed:** Align timestamps right when `align_state` is set to `right`

# v0.2.1
- **Added:** New `hour24` option to choose time format between 12-hour/24-hour clock
- **Added:** Support for showing multiple sensor states, see new `show_state` option for the entity object (#33)
- **Added:** Ability to press/click on entities in the graph legend to bring up their "more info" dialog (#31)
- **Fixed:** Responsive design of the graph legend
- **Fixed:** NaN values in extrema (#34)
- **Fixed:** Extrema not rendering (#32)
- **Fixed:** Times on points going backwards (#30)

# v0.2.0
- **UI redesign**
- **Added:** support for multiple entities (**BETA**) #28
- **Added:** support for multiple `line_color` entries
- **Added:** graph data points with information on hover, see `points` option under the `show` option
- **Added:** `animate` option to have the graph animated on initial load
- **Added:** `points_per_hour` option to specify amount of data points that should be rendered for each hour (basically the graph detail/accuracy).
- **Added:** support for multiple color thresholds with new `line_color_above` & `line_color_below` options
- **Added:** allocated space for the graph -> less jerky movements when loading in
- **Added:** graph legend, visible if multiple entities is present
- **Added:** `align_header`, `align_icon` & `align_state` options #27
- **Added:** `show` option, to manage visible/hidden UI elements
- **Added:** `entities` option
- **Added:** `group` option to remove paddings/box-shadow #26 (@iantrich)
- **Fixed:** bug were history data would be fetched when graph was hidden
- **Fixed:** `decimals` option not being applied to labels #19
- **Fixed:** Y-scale based on absolute extrema causing inconsistent results, now based on moving average same as the rest of the graph.
- **Deprecated:** `entity` option, use new `entities`, accepts string or list (**deprecated**)
- **Removed:** `detail` option, use new `points_per_hour` option (**Breaking change**)
- **Removed:** `hide` options, use new `show` option (**Breaking change**)
- **Removed:** `labels` option, use `labels` in new `show` option (**Breaking change**)
- **Removed:** `line_value_above`, `line_color_above`, `line_value_below` & `line_color_below` options (**Breaking change**)

# v0.1.0
- Added `hide` option to hide specific UI elements
- Removed `hide_icon`, use new `hide` option (**Breaking change**)
- Minor UI changes
- Fixed issue causing errors if all available history entries had the exact same state
- Updated dependencies

# v0.0.9
- Added `decimals` option to display specified amount of decimals for the current state #18
- Fixed issue where `line_value_above` and `line_value_below` would not work when set to `0` #13

# v0.0.8
- Major rework of the graph calculation, now taking moving average and timestamps into account
- Added bundle version
- Added `detail` option, to specify the detail level of the graph
- Added `labels` option to display min/max labels
- Removed `accuracy` option in favor for `detail`
- Changed the reported size of the card

# v0.0.7
- Improved responsive design
- Fixed overflow issue when stacking several cards in horizontal-stack #11
- Fixed default font-size when not specified in config

# v0.0.6
- Improved handling of unknown/unavailable history entries #8
- Fixed issue where `<path>` error would appear in some scenarios
- Refactored code responsible for building the line graph #9

# v0.0.5
- Added `hide_icon` option #5
- Fixed issue where unknown/unavailable history would make the graph not render #6
- Fixed issue where graph line would rendering outside svg boundary and get clipped
- Made graph line ends rounded
- Adjusted line Y-scale
- Updated to lit-element 0.6.2

# v0.0.4
- Added options to have the line change color if the state is above/below specified values
- Fixed graph when setting accuracy option to a higher value than the available data points in history

# v0.0.3
- Added option `font_size` to modify the font size scale of the state #4
- Fixed `<path> attribute d: Expected number` errors.
- Decreased the default font size slightly #4
- Changed default graph height from 150 to 100;
- Improved compatibility with other custom cards like vertical-card-stack #3

# v0.0.2
- Added option to set hours to show

# v0.0.1
- Initial release
