import React, { Component } from "react";
import ListItem from "../components/ListItem";
import Pagination from "../components/Pagination";
import Downshift from "downshift";
import { Dropdown } from 'react-bootstrap';
import {
  getListItems,
  getLikeTasks,
} from "../services/bucketListService";
import { DropDown, DropDownItem, SearchStyles } from "../components/styles/DropDown";
import {createPublicGroupChat, removeFromChat } from '../services/messageService';
import _ from "lodash";

import { connect } from 'react-redux';
import { selectCurrentUser, selectUserToken } from '../store/user/user.selectors';
import { selectBucketList } from '../store/bucket-list/bucket-list.selectors';
import { 
  fetchBucketListAsync, 
  updateListItemStatusAsync,
  removeBucketListItemAsync,
  addBucketListItemAsync,
  updateListItemsAsync
} from '../store/bucket-list/bucket-list.actions';

// max length for taskName is 60 char
class BucketList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTaskInput: '', // "Add New Task" form
      searchResults: [], // for autocomplete search NOT BucketList search
      loading: "",
      listFilterSearch: '',
      listFilterItems: [],
      inputError: null,
      filter: 2,
      selectedFilter:'',
      listItemsRenderType: 0, // Flag for type of tasks to render
      currentPage: 1,
      pageSize: 10,
      paginatedItems: []
    };
  }

  async componentDidMount() {
    const { currentUser: user, token: jwt, fetchBucketListAsync } = this.props;

    fetchBucketListAsync(user, jwt);
  }

  paginateData = (items, pageNumber, pageSize) => {
    const startIndex = (pageNumber - 1) * pageSize;
    const result = _(items)
      .slice(startIndex)
      .take(pageSize)
      .value();
    return result;
  }

  handleAdd = e => {
    e.preventDefault();
    const minTaskNameLength = 5;
    const maxTaskNameLength = 50;
    const newTaskName = document.getElementById("new_task").value;

    let errorMessage = '';
    if (newTaskName.length === 0) {
      errorMessage = "Must add a task first";
    } else if (newTaskName.length < minTaskNameLength) {
      errorMessage = `Task must be more than ${minTaskNameLength} letters`;
    } else if (newTaskName.length > maxTaskNameLength) {
      errorMessage = `Task must be less than ${maxTaskNameLength} letters`;
    }

    if (errorMessage) {
      this.setState({ inputError: errorMessage });
      return;
    }

    const { currentUser: user, token: jwt, addBucketListItemAsync } = this.props;
    addBucketListItemAsync(user, newTaskName, jwt);
    createPublicGroupChat(user._id , newTaskName);

    this.setState({ newTaskInput: '' });

    // try {
    //   const { currentUser: user, token: jwt } = this.props;

    //   // create a new list item
    //   const response = findOrCreateTask(user, newTaskName, jwt);

    //   // create a new message group for that task
    //   createPublicGroupChat( user._id , newTaskName);// make new group chat

    //   response.then(result => {
    //     const listItems = result.data;
    //     var newlist = this.listsort(listItems,this.state.filter);
    //     this.setState({listItems: newlist });
    //   });
    //   this.setState({newTaskInput: ''}); // resets form value
    // } catch (ex) {
    //   alert("Unable to add item.");
    //   //this.setState({ listItems: originalList });
    // }
  };

  listsort = (list,value) =>{
    console.log("listsort!!!");
    switch(value) {
      case 0: // Alphabetical sort (ascending)
        list.sort(function (a, b) {
                    var textA = a.taskName.toUpperCase();
                    var textB = b.taskName.toUpperCase();

                    return textA.localeCompare(textB);
                  });
        return list;
      case 1: // Alphabetical sort (descending)
        list.sort(function (a, b) {
                    var textA = a.taskName.toUpperCase();
                    var textB = b.taskName.toUpperCase();

                    return textB.localeCompare(textA);
                  });
        return list;
        case 3: // sorted by datta added
            list.sort(function (a, b) {
              var textA = a.dateAdded;
              var textB = b.dateAdded;

              return textB.localeCompare(textA);
            });
            return list;
      default:
        console.log("Sorting: invalid");
        return list;
    }
  }

  handleUpdate = (item, newText) => {
    const { currentUser: user, token: jwt, updateListItemsAsync } = this.props;

    updateListItemsAsync(user, item, newText, jwt);

    removeFromChat(item.taskName, user._id);
    createPublicGroupChat( user._id , newText);
  };

  handleDelete = async item => {
    const { currentUser, token, removeBucketListItemAsync } = this.props;
    removeBucketListItemAsync(currentUser, item, token);

    try {
      removeFromChat(item.taskName, currentUser._id);
    } catch (ex) {
      console.log(`Cannot remove user from group chat: ${item.taskName}`);
    }
  };

  handleCompleted = item => {
    const { 
      currentUser,
      token,
      updateListItemStatusAsync 
    } = this.props;

    updateListItemStatusAsync(currentUser, item, token);
  };

  confirmDelete = item => {
    const answer = window.confirm(
      `Are you sure you want to delete task, "${item.taskName}?"`
    );

    return (answer) ? true : false;
  };

  // onChange function for Add New Task input
  onChange = e => {
    if (!e) {
      return;
    }
    var newTaskInput = e.target.value;

    this.setState({newTaskInput: newTaskInput});
    newTaskInput = newTaskInput.toLowerCase(); // Lowercase for uniform search
    if (newTaskInput.length > 0) {
      const response = getLikeTasks(newTaskInput); // Query from
      response.then(
        function(results) {
          this.setState({ searchResults: results.data });
        }.bind(this)
      );
    }
  };

  // onChange function for user list filter search.
  onFilterSearch = e => {
    var searchInput = e.target.value;
    if (searchInput.length > 0) {
      this.setState({listFilterSearch: searchInput})
    } else {
      this.setState({listFilterSearch: ''})
    }
  }

  async filterSort(value) {
    console.log("filterSort!!!");
    this.setState({ filter: value });
    let sortedArray = this.props.listItems;
    switch (value) {
      case 0: // Alphabetical sort (ascending)
        sortedArray.sort(function (a, b) {
                    var textA = a.taskName.toUpperCase();
                    var textB = b.taskName.toUpperCase();

                    return textA.localeCompare(textB);
                  });
        return;
      case 1: // Alphabetical sort (descending)
        sortedArray.sort(function (a, b) {
                    var textA = a.taskName.toUpperCase();
                    var textB = b.taskName.toUpperCase();

                    return textB.localeCompare(textA);
                  });
        return;
      case 2:
        // get bucket list items
        const { currentUser: user, token: jwt } = this.props;

        // need to pass request headers
        return;
        case 3:
            this.state.selectedFilter = 'Newest';
            sortedArray.sort(function (a, b) {
              var textA = a.dateAdded;
              var textB = b.dateAdded;

              return textB.localeCompare(textA);
            });
            return;
      default:
        console.log("Sorting: invalid");
        return;
    }
  }

  setSelectedFilter(e) {
    if (e != null)
      this.setState({ selectedFilter: e.target.value });
    else
      return;
  }

  taskItemRenderTypeFilter(item) {
    console.log("taskItemRenderTypeFilter!!");
    try {
      // Filter by type will be determined by this switch statement
      switch(this.state.listItemsRenderType) {
        case 0: // All
          return (<ListItem key={item._id}  task={item} onDelete={this.handleDelete} onComplete={this.handleCompleted} onUpdate={this.handleUpdate}/>);
        case 1: // Complete
          if (item.isCompleted) {
            return (<ListItem key={item._id}  task={item} onDelete={this.handleDelete} onComplete={this.handleCompleted} onUpdate={this.handleUpdate}/>);
          }
          return;
        case 2: // Incomplete
          if (!item.isCompleted) {
            return (<ListItem key={item._id}  task={item} onDelete={this.handleDelete} onComplete={this.handleCompleted} onUpdate={this.handleUpdate}/>);
          }
          return;
        default:
          console.log("Sorting: invalid");
          return;
      }
    } catch (e) {
      console.log("Error: Cannot filter by task type", e)
    }
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }

  displayItems = (items, listFilterSearch, filterType, currentPage, pageSize) => {
    // loop through the items and filter
    let filteredItems = [];

    if (listFilterSearch) {
      // Regex
      const regex = new RegExp(`${listFilterSearch.toLowerCase()}`, 'g');
      // filter through items
      filteredItems = items.filter(item => item.taskName.toLowerCase().match(regex));

    } else {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        switch (filterType) {
          case 1: // Complete
            if (item.isCompleted)
              filteredItems.push(item);
              break;
          case 2: // Incomplete
            if (!item.isCompleted)
              filteredItems.push(item);
              break;
          default: // 0 is default for All
            filteredItems.push(item);
        }
      }
    }

    // then paginate data and display
    const paginatedData = this.paginateData(filteredItems, currentPage, pageSize);

    return (
      <div className="col-md-12 nopadding">
        {paginatedData.length > 0 &&
          paginatedData.map(item => (
            <ListItem
              key={item._id}
              task={item}
              onDelete={this.handleDelete}
              onUpdate={this.handleUpdate}
              onComplete={this.handleCompleted}
            />
          ))}
        {paginatedData.length < 1 &&
          <p>Sorry, nothing was found. Try a different search term.</p>
        }
      </div>
    );
  }


  render() {
    const { currentUser: user, listItems } = this.props;
    const {
      inputError,
      filter,
      listItemsRenderType,
      listFilterSearch,
      currentPage,
      pageSize
    } = this.state;

    return (
      <div>
        <div className="jumbotron text-center" id="bucket-list-jumbotron">
          <div className="jumbotron-content">
            <h1 className="page-title"> {`${user.name}'s bucket list.`}</h1>
            <h2 className="sub-header">What have you always wanted to do?</h2>
            <SearchStyles>
              <Downshift
                itemToString={item => (item === null ? "" : item.title)}
                onChange={selection =>
                  ( this.setState({newTaskInput: selection.taskName}))
                }
              >
                {({
                  getInputProps,
                  getItemProps,
                  getLabelProps,
                  getMenuProps,
                  isOpen,
                  inputValue,
                  highlightedIndex,
                  selectedItem
                }) => (
                  <div>
                    <form
                      onSubmit={this.handleAdd}
                      className="input-group col-md-6 col-md-offset-3"
                    >
                      <input
                        {...getInputProps({
                          type: "search",
                          placeholder: "Enter a bucket list item!",
                          id: "new_task",
                          name: "new_task",
                          value: this.state.newTaskInput,
                          className: this.state.loading ? "loading" : "",
                          onChange: e => {
                            e.persist();
                            this.onChange(e);
                          }
                        })}
                        autoComplete="off"
                        className="form-control"
                        aria-describedby="inputGroup-sizing-default"
                      />

                      <div>
                        <button className="btn btn-outline-success" type="submit">
                          Add New Task
                        </button>
                      </div>

                      {isOpen && (
                        <DropDown>
                          {this.state.searchResults.map((item, index) => (
                            <DropDownItem
                              {...getItemProps({ item })}
                              key={item.taskName}
                              highlighted={index === highlightedIndex}
                            >
                              {item.taskName}
                            </DropDownItem>
                          ))}
                          {!this.state.searchResults.length &&
                            !this.state.loading && (
                              <DropDownItem>
                                {" "}
                                Nothing Found For: {inputValue}
                              </DropDownItem>
                            )}
                        </DropDown>
                      )}
                    </form>
                    {inputError &&
                      <div id="alert-container" className="col-md-6 col-md-offset-3 alert alert-danger">
                        <strong>{inputError}</strong>
                      </div>}
                  </div>
                )}

              </Downshift>
            </SearchStyles>
          </div>
        </div>

        <div className="bucket-list-content">
          <div className="row nopadding">
            <div className="bucket-list-count col-md-12">
              <p>
                {`There are currently ${
                  listItems.length
                } items in your bucket list`}
              </p>
            </div>
          </div>
          <ul id="bucket-list-items" className="bucket-list-items">
            <div className="row container-list-filter">
              {/* Search bar to filter user's list items. */}
              <input    onChange={this.onFilterSearch}
                        type="text"
                        placeholder="Search for an item on your list..."
                        id="filter_list"
                        name="filter_list"
                        autoComplete="off"
                        className="list-filter col-md-8 mb-1"
                        aria-describedby="inputGroup-sizing-default"
                />
                {/* Drop down for task type filter */}
                <Dropdown className="col-md-2 mb-1" selectedvalue = {filter}>
                  <Dropdown.Toggle className="btn btn-info list-filter-dropdown" variant="success" id="dropdown-basic">
                    Show...
                  </Dropdown.Toggle>
                  <Dropdown.Menu  className="col-md-2">
                  {listItemsRenderType === 0 ?
                    <Dropdown.Item active onClick={() => { this.setState({listItemsRenderType: 0})}} value={0}>All</Dropdown.Item>
                    :
                    <Dropdown.Item onClick={() => { this.setState({listItemsRenderType: 0})}} value={0}>All</Dropdown.Item>
                  }
                  {listItemsRenderType === 1 ?
                    <Dropdown.Item active onClick={() => { this.setState({listItemsRenderType: 1})}} value={1}>Completed</Dropdown.Item>
                    :
                    <Dropdown.Item onClick={() => { this.setState({listItemsRenderType: 1})}} value={1}>Completed</Dropdown.Item>
                  }
                  {listItemsRenderType === 2 ?
                    <Dropdown.Item active onClick={() => { this.setState({listItemsRenderType: 2})}} value={2}>Incomplete</Dropdown.Item>
                    :
                    <Dropdown.Item onClick={() => { this.setState({listItemsRenderType: 2})}} value={2}>Incomplete</Dropdown.Item>
                  }
                  </Dropdown.Menu>
                </Dropdown>

                {/* Drop down for filter type */}
                <Dropdown className="col-md-2 mb-1" selectedvalue = {filter}>
                  <Dropdown.Toggle className="btn btn-info list-filter-dropdown" variant="success" id="dropdown-basic">
                    Filter by..
                  </Dropdown.Toggle>
                  <Dropdown.Menu  className="col-md-2">
                  <Dropdown.Item disabled >Select a Filter</Dropdown.Item>
                  <Dropdown.Item divider />
                  {filter === 3?
                    <Dropdown.Item active onClick={() => { this.filterSort(3) }}value={3}>Newest</Dropdown.Item>
                    :<Dropdown.Item onClick={() => { this.filterSort(3) }}value={3}>Newest</Dropdown.Item>
                  }
                  {filter === 2?
                    <Dropdown.Item active onClick={() => { this.filterSort(2) }}value={2}>Default</Dropdown.Item>
                    : <Dropdown.Item onClick={() => { this.filterSort(2) }}value={2}>Default</Dropdown.Item>
                  }
                  {filter === 0?
                    <Dropdown.Item active onClick={() => { this.filterSort(0) }}value={0}>A &rarr; Z</Dropdown.Item>
                    :<Dropdown.Item onClick={() => { this.filterSort(0) }}value={0}>A &rarr; Z</Dropdown.Item>
                  }
                  {filter === 1?
                    <Dropdown.Item active onClick={() => { this.filterSort(1) }}value={1}>Z &rarr; A</Dropdown.Item>
                    :<Dropdown.Item onClick={() => { this.filterSort(1) }}value={1}>Z &rarr; A</Dropdown.Item>
                  }


                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {
                listItems.length > 0 &&
                this.displayItems(listItems, listFilterSearch, listItemsRenderType, currentPage, pageSize)
              }

              
             
          </ul>
          <div>
            <Pagination
              itemsCount={listItems.length}
              pageSize={this.state.pageSize}
              currentPage={this.state.currentPage}
              onPageChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: selectCurrentUser(state),
  token: selectUserToken(state),
  listItems: selectBucketList(state)
});

const mapDispatchToProps = dispatch => ({
  fetchBucketListAsync: (user, token) => dispatch(fetchBucketListAsync(user, token)),
  updateListItemStatusAsync: (user, item, token) => dispatch(updateListItemStatusAsync(user, item, token)),
  removeBucketListItemAsync: (user, item, token) => dispatch(removeBucketListItemAsync(user, item, token)),
  addBucketListItemAsync: (user, item, token) => dispatch(addBucketListItemAsync(user, item, token)),
  updateListItemsAsync: (user, item, newTask, token) => dispatch(updateListItemsAsync(user, item, newTask, token))
});

export default connect(mapStateToProps, mapDispatchToProps)(BucketList);
