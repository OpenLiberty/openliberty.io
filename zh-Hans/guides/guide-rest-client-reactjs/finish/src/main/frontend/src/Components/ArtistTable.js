// tag::react-library[]
import React, { useEffect, useMemo, useState } from 'react';
// end::react-library[]
// tag::axios-library[]
import axios from 'axios';
// end::axios-library[]
// tag::react-table[]
import { useTable, usePagination, useSortBy } from 'react-table';
// end::react-table[]
// tag::custom-style[]
import '../Styles/table.css'
// end::custom-styly[]

// tag::ArtistTable[]
export function ArtistTable() {
  // end::ArtistTable[]

  // tag::posts[]
  const [posts, setPosts] = useState([]);
  // end::posts[]

  // tag::get-posts[]
  const GetArtistsInfo = async () => {
    // tag::axios[]
    const response = await axios.get('http://localhost:9080/artists')
      // end::axios[]
      .then(response => {
        // tag::response-data[]
        const artists = response.data;
        // end::response-data[]
        // tag::for-artists[]
        for (const artist of artists) {
          // tag::spread-one[]
          const { albums, ...rest } = artist;
          // end::spread-one[]
          for (const album of albums) {
            //tag::setState[]
            setPosts([...posts, { ...rest, ...album }]);
            // end::setState[]
            // tag::spread-two[]
            posts.push({ ...rest, ...album });
            // end::spread-two[]
          }
        };
        // end::for-artists[]
      }).catch(error => { console.log(error); });
  };
  // end::get-posts[]

  // tag::useMemo[]
  const data = useMemo(() => [...posts], [posts]);
  // end::useMemo[]

  // tag::table-info[]
  const columns = useMemo(() => [{
    Header: 'Artist Info',
    columns: [
      {
        Header: 'Artist ID',
        accessor: 'id'
      },
      {
        Header: 'Artist Name',
        accessor: 'name'
      },
      {
        Header: 'Genres',
        accessor: 'genres',
      }
    ]
  },
  {
    Header: 'Albums',
    columns: [
      {
        Header: 'Number of Tracks',
        accessor: 'ntracks',
      },
      {
        Header: 'Title',
        accessor: 'title',
      }
    ]
  }
  ], []
  );
  // end::table-info[]

  // tag::useTable[]
  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 4 }
    },
    // tag::useSortBy[]
    useSortBy,
    // end::useSortBy[]
    // tag::usePagination[]
    usePagination
    // end::usePagination[]
  )
  // end::useTable[]

  // tag::destructuring[]
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
    state: { pageIndex, pageSize }
  } = tableInstance;
  // end::destructuring[]

  // tag::useEffect[]
  useEffect(() => {
    GetArtistsInfo();
  }, []);
  // end::useEffect[]

  // tag::return-table[]
  return (
    <>
      <h2>Artist Web Service</h2>
      {/* tag::table[] */}
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      {/* end::table[] */}
      <div className="pagination">
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'Previous'}
        </button>{' '}
        <div class="page-info">
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <span>
            | Go to page:{' '}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                gotoPage(page)
              }}
              style={{ width: '100px' }}
            />
          </span>{' '}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
          >
            {[4, 5, 6, 9].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'Next'}
        </button>{' '}
      </div>
    </>
  );
  // end::return-table[]
}