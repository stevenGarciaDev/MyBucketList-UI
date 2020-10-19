import BucketListActions from './bucket-list.types';

const INITIAL_STATE = {
    list: [],
    error: ''
};

const BucketListReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case BucketListActions.ADD_LIST_ITEM:
            return {
                ...state,
                list: [...state.list, action.payload.item]
            }
        case BucketListActions.REMOVE_LIST_ITEM:
            return {
                ...state,
                list: state.list.filter(item => item._id !== action.payload.id)
            }
        case BucketListActions.FETCH_BUCKET_LIST_SUCCESS:
            return {
                ...state,
                list: action.payload.list
            }
        case BucketListActions.UPDATE_LIST_ITEMS_SUCCESS:
            return {
                ...state,
                list: action.payload.updatedList
            }
        case BucketListActions.BUCKET_LIST_OPERATION_ERROR:
            return {
                ...state,
                error: action.payload.error
            }
        default:
            return state;
    }
};

export default BucketListReducer;

