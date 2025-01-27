import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import {
  configureTableGeneration,
  generateColumns,
  generateRows,
  resetTableGenerationConfig,
} from 'dummy/utils/generators';

// reexport for use in tests
export { configureTableGeneration, resetTableGenerationConfig, generateColumns, generateRows };

const fullTable = hbs`
  <div style="height: 500px;">
    {{#ember-table data-test-ember-table=true as |t|}}
      {{#ember-thead
        api=t

        columns=this.columns
        columnKeyPath=this.columnKeyPath
        containerWidthAdjustment=this.containerWidthAdjustment
        enableReorder=this.enableReorder
        enableResize=this.enableResize
        scrollIndicators=this.scrollIndicators
        fillColumnIndex=this.fillColumnIndex
        fillMode=this.fillMode
        initialFillMode=this.initialFillMode
        resizeMode=this.resizeMode
        sorts=this.sorts
        sortEmptyLast=this.sortEmptyLast
        widthConstraint=this.widthConstraint
        onUpdateSorts=(action this.onUpdateSorts)
        onReorder=(action this.onReorder)
        onResize=(action this.onResize)

        as |h|
      }}
        {{#ember-tr api=h as |r|}}
          {{ember-th
            api=r
            onContextMenu=(action this.onHeaderCellContextMenu)
          }}
        {{/ember-tr}}
      {{/ember-thead}}

      {{#ember-tbody
        api=t
        rows=this.rows
        estimateRowHeight=this.estimateRowHeight
        staticHeight=this.staticHeight
        enableCollapse=this.enableCollapse
        enableTree=this.enableTree
        key=this.key
        bufferSize=this.bufferSize
        idForFirstItem=this.idForFirstItem
        onSelect=(action this.onSelect)
        selectingChildrenSelectsParent=this.selectingChildrenSelectsParent
        checkboxSelectionMode=this.checkboxSelectionMode
        rowSelectionMode=this.rowSelectionMode
        rowToggleMode=this.rowToggleMode
        selection=this.selection
        selectionMatchFunction=this.selectionMatchFunction
        as |b|
      }}
        {{#component this.rowComponent
          api=b
          onClick=(action this.onRowClick)
          onDoubleClick=(action this.onRowDoubleClick)

          as |r|
        }}
          {{#ember-td
            api=r
            onClick=(action this.onCellClick)
            onDoubleClick=(action this.onCellDoubleClick)
            as |value|
          }}
            {{value}}
          {{/ember-td}}
        {{/component}}
      {{/ember-tbody}}

      {{#ember-tfoot
        api=t
        rows=this.footerRows
        as |f|
      }}
        {{#ember-tr api=f as |r|}}
          {{#ember-td api=r as |value|}}
            {{value}}
          {{/ember-td}}
        {{/ember-tr}}
      {{/ember-tfoot}}
    {{/ember-table}}
  </div>
`;

const defaultActions = {
  onSelect(newRows) {
    this.set('selection', newRows);
  },

  onUpdateSorts(sorts) {
    this.set('sorts', sorts);
  },

  onDropdownAction() {},
  onColumnHeaderAction() {},
  onHeaderCellContextMenu() {},
  onReorder() {},
  onResize() {},

  onCellClick() {},
  onCellDoubleClick() {},

  onRowClick() {},
  onRowDoubleClick() {},
};

export function generateTableValues(
  testContext,
  {
    rows,
    footerRows,
    columns,
    rowCount = 10,
    rowDepth = 1,
    footerRowCount = 0,
    columnCount = 10,
    columnOptions,

    rowComponent = 'ember-tr',

    ...options
  } = {}
) {
  for (let property in options) {
    testContext.set(property, options[property]);
  }
  testContext.set('rowComponent', rowComponent);

  columns = columns || generateColumns(columnCount, columnOptions);

  rows = rows || generateRows(rowCount, rowDepth, (row, key) => `${row.id}${key}`);
  footerRows = footerRows || generateRows(footerRowCount, (row, key) => `${row.id}${key}`);

  testContext.set('columns', columns);
  testContext.set('rows', rows);
  testContext.set('footerRows', footerRows);

  for (let action in defaultActions) {
    if (!testContext[action]) {
      testContext.set(action, defaultActions[action].bind(testContext));
    }
  }
}

export async function generateTable(testContext, ...args) {
  generateTableValues(testContext, ...args);

  testContext.render(fullTable);

  await wait();
}
