import {
  mdiAlignHorizontalLeft, mdiArrowExpandVertical, mdiEye,
  mdiFormatColorFill,
  mdiPalette,
  mdiStateMachine,
} from '@mdi/js';

const MAINSCHEMA = [
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
            name: 'hours_to_show',
            selector: { number: { min: 1 } },
          },
          {
            name: 'points_per_hour',
            selector: { number: { min: 0.1, step: 0.1 } },
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
          {
            name: 'value_factor',
            selector: { number: {} },
          },
          {
            name: 'bar_spacing',
            selector: { number: { min: 0.1, step: 0.1 } },
          },
          {
            name: 'line_width',
            selector: { number: { min: 0.1, step: 0.1 } },
          },
          {
            name: 'color_thresholds_transition',
            selector: {
              select: {
                options: [
                  { label: 'Smooth', value: 'smooth' },
                  { label: 'Hard', value: 'hard' },
                ],
                mode: 'dropdown',
              },
            },
          },
          {
            name: 'animate',
            selector: { boolean: {} },
          },
          {
            name: 'logarithmic',
            selector: { boolean: {} },
          },
        ],
      },
      {
        name: '',
        type: 'expandable',
        iconPath: mdiArrowExpandVertical,
        title: 'Bounds',
        schema: [
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'lower_bound',
                selector: { text: {} },
              },
              {
                name: 'upper_bound',
                selector: { text: {} },
              },
              {
                name: 'min_bound_range',
                selector: { number: { step: 0.1 } },
              },
            ],
          },
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'lower_bound_secondary',
                selector: { text: {} },
              },
              {
                name: 'upper_bound_secondary',
                selector: { text: {} },
              },
              {
                name: 'min_bound_range_secondary',
                selector: { number: { step: 0.1 } },
              },
            ],
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
                default: true,
                selector: { boolean: {} },
              },
              {
                name: 'icon',
                default: true,
                selector: { boolean: {} },
              },
              {
                name: 'state',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: 'show' },
                      { label: 'Hide', value: 'hide' },
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
                      { label: 'Hide', value: 'hide' },
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
                      { label: 'Show', value: 'show' },
                      { label: 'Hide', value: 'hide' },
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
                      { label: 'Show', value: 'show' },
                      { label: 'Hide', value: 'hide' },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'labels',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: 'show' },
                      { label: 'Hide', value: 'hide' },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'labels_secondary',
                default: 'burba',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: 'show' },
                      { label: 'Hide', value: 'hide' },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'legend',
                default: true,
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
    name: 'color_thresholds',
    type: 'expandable',
    flatten: true,
    iconPath: mdiFormatColorFill,
    schema: [
      {
        name: 'color_thresholds',
        type: 'mgc-list',
        schema: [
          {
            name: '',
            type: 'grid',
            column_min_width: '100px',
            schema: [
              {
                name: 'value',
                selector: { number: { step: 0.1 } },
              },
              {
                name: 'color',
                selector: { hex_color: {} },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'state_map',
    type: 'expandable',
    flatten: true,
    iconPath: mdiStateMachine,
    schema: [
      {
        name: 'state_map',
        type: 'mgc-list',
        schema: [
          {
            name: '',
            type: 'grid',
            column_min_width: '100px',
            schema: [
              {
                name: 'value',
                selector: { text: {} },
              },
              {
                name: 'label',
                selector: { text: {} },
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

const ENTITYSCHEMA = [
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
        name: 'unit',
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
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_indicator',
            selector: { boolean: {} },
          },
          {
            name: 'show_graph',
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_line',
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_fill',
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_points',
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_legend',
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_adaptive_color',
            selector: { boolean: {} },
          },
          {
            name: 'smoothing',
            default: true,
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

const BOOLEANS = [
  'name',
  'icon',
  'legend',
  'average',
  'extrema',
  'name_adaptive_color',
  'icon_adaptive_color',
];

export {
  MAINSCHEMA,
  ENTITYSCHEMA,
  BOOLEANS,
};
