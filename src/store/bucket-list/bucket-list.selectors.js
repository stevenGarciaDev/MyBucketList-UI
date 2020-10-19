import { createSelector } from 'reselect';

export const selectBucketList = state => state.bucketList.list;

export const selectBucketListOperationError = state => state.bucketList.error;
