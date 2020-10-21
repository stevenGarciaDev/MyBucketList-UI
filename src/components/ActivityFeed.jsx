import React, { Component } from 'react';
import { getPosts, remove } from '../services/postService';
import Post from './post';
import PostForm from './postForm';

class ActivityFeed extends Component {

  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };
  }

  async componentDidMount() {
    const { taskId } = this.props;
    const jwt = localStorage.getItem("token");

    let posts = await getPosts(taskId, jwt);
    posts = posts.data;
    this.setState({ posts });
  }

  onNewPost = async (post) => {
    const posts = [...this.state.posts];
    posts.unshift(post);
    this.setState({ posts });
  }

  handleDelete = async (post_id) => {
    let updatedPosts = [];
    const { posts } = this.state;
    
    try {
      remove(post_id);
      updatedPosts = posts.filter(p => p._id !== post_id);
    } catch (err) {
      updatedPosts = posts;
    }

    this.setState({ posts: updatedPosts });
  }

  render() {
    const { posts } = this.state;
    const { taskId } = this.props;

    return (
      <div className="ActivityFeed">
        <div className="activity-content">

          <PostForm taskId={taskId} onNewPost={this.onNewPost} />

          {posts.length > 0 && this.state.posts.map((post) => (
            <Post
              key={post._id}
              id={post._id}
              author={post.author}
              image={post.image}
              dateCreated={post.dateCreated}
              text={post.text}
              likes={post.likes}
              comments={post.comments}
              onDelete={this.handleDelete}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default ActivityFeed;
