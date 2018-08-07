import React, {Component} from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';
// required to build search query
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';
// required to build comment link
const PATH_BASE_HN = 'https://news.ycombinator.com/';
const PATH_ITEM_ID = 'item?id=';

const item_url = `${PATH_BASE_HN}${PATH_ITEM_ID}`;

// const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;

class App extends Component {
  _isMounted = false;
  // Constructor
  constructor (props) {
    super (props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind (this);
    this.setSearchTopStories = this.setSearchTopStories.bind (this);
    this.fetchSearchTopStores = this.fetchSearchTopStores.bind (this);
    this.onSearchChange = this.onSearchChange.bind (this);
    this.onSearchSubmit = this.onSearchSubmit.bind (this);
    this.onDismiss = this.onDismiss.bind (this);
  }

  needsToSearchTopStories (searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories (result) {
    const {hits, page} = result;
    const {searchKey, results} = this.state;
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
    const updatedHits = [...oldHits, ...hits];
    this.setState ({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page},
      },
    });
  }

  fetchSearchTopStores (searchTerm, page = 0) {
    axios (
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}\
${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then (
        result => this._isMounted && this.setSearchTopStories (result.data)
      )
      .catch (error => this._isMounted && this.setState ({error}));
  }

  componentDidMount () {
    this._isMounted = true;
    const {searchTerm} = this.state;
    this.setState ({searchKey: searchTerm});
    this.fetchSearchTopStores (searchTerm);
  }

  componentWillUnmount () {
    this._isMounted = false;
  }

  // App class methods
  onSearchChange (event) {
    this.setState ({searchTerm: event.target.value});
  }

  onSearchSubmit (event) {
    const {searchTerm} = this.state;
    this.setState ({searchKey: searchTerm});

    if (this.needsToSearchTopStories (searchTerm)) {
      this.fetchSearchTopStores (searchTerm);
    }
    event.preventDefault ();
  }

  onDismiss (id) {
    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter (isNotId);

    this.setState ({
      results: {...results, [searchKey]: {hits: updatedHits, page}},
    });
  }

  // App render
  render () {
    const {searchTerm, results, searchKey, error} = this.state;
    const page =
      (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results &&
      results[searchKey] &&
      results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Table list={list} onDismiss={this.onDismiss} />
        {error
          ? <div className="interactions">
              <p>Oops! Something went wrong.</p>
            </div>
          : <Table list={list} onDismiss={this.onDismiss} />}
        <div className="interactions">
          <Button
            onClick={() => this.fetchSearchTopstories (searchKey, page + 1)}
          >
            More
          </Button>
        </div>
      </div>
    );
  }
}
// App class ends

const Search = ({value, onChange, onSubmit, children}) => (
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange} />
    <button type="submit">{children}</button>
  </form>
);

const Table = ({list, pattern, onDismiss}) => (
  <div className="table">
    {list.map (item => (
      <div key={item.objectID} className="table-row">
        <span style={{width: '40%'}}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={{width: '30%'}}>
          {item.author}
        </span>
        <span style={{width: '10%'}}>
          <a href={`${item_url}${item.objectID}`}>{item.num_comments}</a>
        </span>
        <span style={{width: '10%'}}>
          {item.points}
        </span>
        <span style={{width: '10%'}}>
          <Button
            onClick={() => onDismiss (item.objectID)}
            className="button-inline"
          >
            Dismiss
          </Button>
        </span>
      </div>
    ))}
  </div>
);

const Button = ({onClick, className, children}) => (
  <button onClick={onClick} className={className} type="button">
    {' '}{children}
  </button>
);

Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Table.propTypes = {
  list: PropTypes.arrayOf (
    PropTypes.shape ({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func,
};

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default App;
export {Button, Search, Table};
