import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './user/user.reducer';
import bucketListReducer from './bucket-list/bucket-list.reducer';

const persistConfig = {
    key: 'root',
    storage,
    whieList: ['bucketList']
}

const rootReducer = combineReducers({
    user: userReducer,
    bucketList: bucketListReducer
});

export default persistReducer(persistConfig, rootReducer);