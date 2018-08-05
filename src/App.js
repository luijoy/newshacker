import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'ruby on rails';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

// const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;

const isSearched = searchTerm => item =>
  item.title.toLowerCase ().includes (searchTerm.toLowerCase ());

class App extends Component {
  // Constructor
  constructor (props) {
    super (props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind (this);
    this.fetchSearchTopStores = this.fetchSearchTopStores.bind (this);
    this.onSearchChange = this.onSearchChange.bind (this);
    this.onSearchSubmit = this.onSearchSubmit.bind (this);
    this.onDismiss = this.onDismiss.bind (this);
  }

  setSearchTopStories (result) {
    this.setState ({result});
  }

  fetchSearchTopStores (searchTerm) {
    fetch (`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then (response => response.json ())
      .then (result => this.setSearchTopStories (result))
      .catch (error => error);
  }

  componentDidMount () {
    const {searchTerm} = this.state;
    this.fetchSearchTopStores (searchTerm);
  }

  // App class methods
  onSearchChange (event) {
    this.setState ({searchTerm: event.target.value});
  }

  onSearchSubmit (event) {
    const {searchTerm} = this.state;
    this.fetchSearchTopStores (searchTerm);
    event.preventDefault ();
  }

  onDismiss (id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter (isNotId);
    this.setState ({
      result: {...this.state.result, hits: updatedHits},
    });
  }

  // App render
  render () {
    const {searchTerm, result} = this.state;
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
        {result && <Table list={result.hits} onDismiss={this.onDismiss} />}
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
          {item.num_comments}
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

function Button({onClick, className = '', children}) {
  return <button onClick={onClick} className={className} type="button" />;
}

export default App;
