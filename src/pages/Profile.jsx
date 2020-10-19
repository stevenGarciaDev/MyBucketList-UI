import React, { Component } from 'react';
import { getUser, uploadNewProfileImage, updateProfileImage, updateProfile } from "../services/userService";
import ImageInput from "../components/common/imageInput";
import { connect } from 'react-redux';
import { selectUserToken, selectCurrentUser } from '../store/user/user.selectors';
import { fetchBucketListAsync } from '../store/bucket-list/bucket-list.actions';
import { selectBucketList } from '../store/bucket-list/bucket-list.selectors';

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: { image: '' },
      imageToDisplay: '',
      imageToUpload: false,
      user: {},
      isEditing: false,
      bio: "",
    }
  }

  async componentDidMount() {
    const { currentUser, token, fetchBucketListAsync } = this.props;

    const user = await getUser(currentUser._id);
    fetchBucketListAsync(currentUser, token);

    console.log("@user", user);

    this.setState({ 
      user: user.data, 
      imageToDisplay: user.data.photo, 
      bio: user.data.bio
    });
  }

  toggleEdit = () => {
    const { isEditing } = this.state;
    this.setState({ isEditing: !isEditing });
  }

  handleFileSubmit = async (e) => {
    e.preventDefault();
    const { token: jwt } = this.props;
    const { image } = this.state.data;

    if (image !== "") {
      const photoResponse = await uploadNewProfileImage(image, jwt);
      this.setState({ imageToDisplay: photoResponse, imageToUpload: false });
      this.updateUserProfileImage(photoResponse, jwt);
    }
  }

  updateUserProfileImage = async (photo, jwt) => {
    await updateProfileImage(photo, jwt);
  }

  handleBioChange = (e) => {
    const bio = e.target.value;
    this.setState({ bio });
  }

  handleBioUpdate = async () => {
    this.toggleEdit();
 
    const { user, bio } = this.state;
    const { token: jwt } = this.props;
    await updateProfile(user, bio, jwt);
  }

  handleFileChange = async (event) => {
    if (!this.state.imageToUpload) {
      const imageFile = event.target.files[0];
      const data = { ...this.state.data };
      data['image'] = imageFile;

      this.setState({ data: data, imageToUpload: true });
    }
    else
    {
      const data = { ...this.state.data };
      data['image'] = '';

      this.setState({ data: data, imageToUpload: false});
    }
  }

  displayEditOption = () => {
    const { currentUser } = this.props;
    // get user that profile belongs to
    const { user, isEditing } = this.state;

    try {
      if (currentUser.email === user.email) {
        return (
          <React.Fragment>
            {
              isEditing ?
                <span>
                  <i className="fa fa-check-circle-o fa-2x"
                    aria-hidden="true"
                    onClick={() => this.handleBioUpdate()}></i>
                </span>
              :
                <span>
                  <i className="fa fa-pencil-square-o fa-2x"
                    aria-hidden="true"
                    onClick={() => this.toggleEdit()}></i>
                </span>
            }
          </React.Fragment>
        );
      }
    } catch (e) {
      console.log("Unable to compare users", e);
    }
  }

  displayUserBio = () => {
    const { bio, isEditing } = this.state;
    if (isEditing) {
      return <div><textarea name = "noResize" rows="3" cols="90" maxlength = {255} value={bio} onChange={this.handleBioChange}/></div>;
    } else {
      return <p className="card-text">{bio || 'No bio available'}</p>;
    }
  }

  render() {
    const { listItems } = this.props;
    const { imageToDisplay, imageToUpload } = this.state;

    return (
      <div className="container">

        <div className="row profile-container">
          <div className="col-md-4 col-md-push-8">
            <img
              alt="profile"
              className="profile-image"
              src={imageToDisplay || "https://pbs.twimg.com/profile_images/901947348699545601/hqRMHITj_400x400.jpg"} />
          </div>

          <div className="col-md-8 col-md-pull-4">
            <div className="card text-left">
       
              <div name = "cardHeaderColor" className="card-header" >
                About Me
              </div>
              <div className="card-body">
                { this.displayUserBio() }
                { this.displayEditOption() }
              </div>
            </div>
          </div>
        </div>

        <div className="row profile-container">
          <div className="col-md-4">

            <form onSubmit={(e) => {
              this.handleFileSubmit(e);
            }}>
              <ImageInput
                onFileChange={(e) => this.handleFileChange(e)}
                imageToUpload={imageToUpload} />
              <button className="btn btn-info btn-block" type="submit">Update Profile Image</button>
            </form>
          </div>

          <div className="col-md-8">
            <div  className="card text-left">
              <div name = "cardHeaderColor" className="card-header">
                My Bucket List
              </div>
              <div  className="card-body">
                <p className="card-text">
                  {
                    listItems.length > 0 ?
                      <ul>
                        { listItems.map(item => <li>{item.taskName}</li>) }
                      </ul>
                    :
                      <span>Not available.</span>
                  }
                </p>
              </div>
            </div>
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
  fetchBucketListAsync: (user, token) => dispatch(fetchBucketListAsync(user, token))
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
