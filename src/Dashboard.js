import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import GetAppIcon from '@material-ui/icons/GetApp';
import { CSVLink } from "react-csv";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'state', label: 'State' },
  { id: 'confirmed', label: 'Confirmed Cases' },
  { id: 'recovered', label: 'Recovered Cases' },
  { id: 'deaths', label: 'Deaths Cases' },
  { id: 'active', label: 'Active Cases' },
  // { id: 'export', numeric: true, disablePadding: false, label: 'Export To Excel' },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  tablePadding: {
    padding: '10px'
  },
  header: {
    padding: '10px',
    backgroundColor: '#cccccc'
  },
  bodyTable: {
    padding: '10px',
  }
}));

export default function EnhancedTable() {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [covidData, setCovidData] = useState([]);
  const [covidRealData, setCovidRealData] = useState([]);
  const [totalCases, setTotalCases] = useState(0);
  
  useEffect(() => {
    if(!covidData.length > 0){
      Axios.post('https://api.rootnet.in/covid19-in/unofficial/covid19india.org/statewise')
      .then((response) => { 
        setCovidData(response.data.data.statewise)
        setCovidRealData(response.data.data.statewise)
        setTotalCases(response.data.data.total)
      })
      .catch((error) => {
        console.log('====================================');
        console.log(error);
      });
    }
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, covidData.length - page * rowsPerPage);
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const onSearchChange = (searchText) => {
    let typedText = searchText.target.value;
    let dataFiltered = covidRealData.filter(data => {
      let stateNme = data.state;
      return stateNme.includes(typedText)
    })
    if(dataFiltered.length > 0){
      setCovidData(dataFiltered)
    }
  };
  return (
    <div className={classes.root} style={{padding: '20px'}}>
      <Row>
        <Col md={12} className="text-center"><h2>Covid Dashboard Of India</h2></Col>
      </Row>
      <Row>
        <Col md={3} className="text-center"><h5>Total Cases</h5>{totalCases.confirmed}</Col>
        <Col md={3} className="text-center"><h5>Total Recovered</h5>{totalCases.recovered}</Col>
        <Col md={3} className="text-center"><h5>Total Active</h5>{totalCases.active}</Col>
        <Col md={3} className="text-center"><h5>Total Deaths</h5>{totalCases.deaths}</Col>
      </Row>
      <Paper className={classes.paper}>
        <Toolbar className="text-right">
          <input
            placeholder="Search"
            aria-label="Search"
            aria-describedby="basic-addon1"
            onChange={onSearchChange}
          />
          <Tooltip title="Export">
            <IconButton aria-label="export">
              <CSVLink data={covidData}><GetAppIcon /></CSVLink>
            </IconButton>
          </Tooltip>

        </Toolbar>

        <TableContainer>
          <Table
            className={classes.tablePadding}
            aria-labelledby="tableTitle"
            size={'medium'}
            aria-label="enhanced table"
          >
            <TableHead
            className={classes.header}>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    padding={headCell.disablePadding ? 'none' : 'default'}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={createSortHandler(headCell.id)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <span className={classes.visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </span>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(covidData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.state}
                    >
                      <TableCell component="th" scope="row">{row.state}</TableCell>
                      <TableCell>{row.confirmed}</TableCell>
                      <TableCell>{row.recovered}</TableCell>
                      <TableCell>{row.deaths}</TableCell>
                      <TableCell>{row.active}</TableCell>
                      {/* <TableCell align="right"><CSVLink data={data}><GetAppIcon /></CSVLink></TableCell> */}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={covidData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}