import { UserActionTypes } from './user.types';

const INITIAL_STATE = {
    token: null
};

const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case UserActionTypes.SET_USER_TOKEN:
            return {
                ...state,
                token: action.payload
            }
        default:
            return state;
    }
}

export default userReducer;