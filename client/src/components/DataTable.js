import React from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { useTable, usePagination, useRowSelect } from 'react-table';

const DataTable = ({ animals, loading, onRowSelect }) => {
  const columns = React.useMemo(
    () => [
      { Header: 'ID', accessor: 'animal_id' },
      { Header: 'Name', accessor: 'name' },
      { Header: 'Type', accessor: 'animal_type' },
      { Header: 'Breed', accessor: 'breed' },
      { Header: 'Color', accessor: 'color' },
      { Header: 'Age', accessor: 'age_upon_outcome' },
      { Header: 'Sex', accessor: 'sex_upon_outcome' },
      { Header: 'Outcome', accessor: 'outcome_type' },
    ],
    []
  );

  const data = React.useMemo(() => animals, [animals]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 7 },
    },
    usePagination,
    useRowSelect
  );

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div>
      <Table striped bordered hover {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr 
                {...row.getRowProps()}
                onClick={() => onRowSelect(row.original)}
                style={{ cursor: 'pointer' }}
              >
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[7, 10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DataTable;