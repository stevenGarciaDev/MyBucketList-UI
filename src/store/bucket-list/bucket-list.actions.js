import BucketListActions from './bucket-list.types';
import { 
    getListItems, 
    toggleComplete,
    removeTask,
    findOrCreateTask,
    updateTask
} from '../../services/bucketListService';

export const fetchBucketListSuccess = (list) => ({
    type: BucketListActions.FETCH_BUCKET_LIST_SUCCESS,
    payload: {
        list
    }
});

export const fetchBucketListFailure = () => ({
    type: BucketListActions.FETCH_BUCKET_LIST_FAILURE
});

export const addBucketListItem = item => ({
    type: BucketListActions.ADD_LIST_ITEM,
    payload: {
        item
    }
});

export const removeBucketListItem = id => ({
    type: BucketListActions.REMOVE_LIST_ITEM,
    payload: {
        id
    }
});

export const updateListItemsSuccess = updatedList => ({
    type: BucketListActions.UPDATE_LIST_ITEMS_SUCCESS,
    payload: {
        updatedList
    }
});

export const bucketListOperationError = error => ({
    type: BucketListActions.BUCKET_LIST_OPERATION_ERROR,
    payload: {
        error
    }
});

export const fetchBucketListAsync = (user, token) => {
    return async (dispatch, getState) => {
        const state = getState();

        if (state.bucketList.list.length === 0) {
            try {
                const response = await getListItems(user, token);
                const list = response.data[0].listItems;

                dispatch(fetchBucketListSuccess(list));
            } catch (error) {
                dispatch(bucketListOperationError(`Unable to retrieve bucket list right now. Please try again later.`));
            }
        }
   }
}

export const updateListItemsAsync = (user, item, newTask, token) => {
    return async (dispatch) => {
        try {
            const response = await updateTask(user, item, newTask, token);

            dispatch(updateListItemsSuccess(response.data));
        } catch (error) {
            dispatch(bucketListOperationError(`Unable to perform bucket list operation right now. Please try again later.`))
        }
    }
}

export const updateListItemStatusAsync = (user, item, token) => {
    return async (dispatch) => {
        try {
            const response = await toggleComplete(user, item, token);

            dispatch(updateListItemsSuccess(response.data));
        } catch (error) {
            dispatch(bucketListOperationError(`Unable to perform bucket list operation right now. Please try again later.`));
        }
    }
}

export const removeBucketListItemAsync = (user, item, token) => {
    return async (dispatch) => {
        try {
            const response = await removeTask(user, item, token);

            dispatch(removeBucketListItem(item._id));
        } catch (error) {
            dispatch(bucketListOperationError(`Unable to perform bucket list operation right now. Please try again later.`));
        }
    }
}

export const addBucketListItemAsync = (user, taskName, token) => {
    return async (dispatch) => {
        try {
            const response = await findOrCreateTask(user, taskName, token);
        
            dispatch(addBucketListItem(response.data));
        }  catch (error) {
            dispatch(bucketListOperationError(`Unable to perform bucket list operation right now. Please try again later.`));
        }
    }
}