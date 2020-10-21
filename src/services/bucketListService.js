import http from './httpService';

const apiEndpoint = "/bucketList";
const apiEndpointListItems = "/ListItem";

export async function getListItems(user, jwt) {
  let response = [];
  try {
     response = await http.get(`${apiEndpoint}/${user._id}`,
      { 'headers': {'x-auth-token': jwt } });
  } catch (err) {
    console.log("unable to retrieve list item response", err);
  }
  return response;
}

export async function getListItemsByID(userID, jwt) {
  const response = await http.get(`${apiEndpoint}/${userID}`,
     { 'headers': {'x-auth-token': jwt } });
  return response;
}

export async function getLikeTasks(item) {
  const response = await http.get(`${apiEndpointListItems}/task?q=${item}`);
  return response;
}

export async function getListItem(itemid) {
  const response = await http.get(`${apiEndpointListItems}/${itemid}`);
  return response;
}

export async function getTaskUsers(taskid) {
  const response = await http.get(`${apiEndpoint}/users/${taskid}`);
  return response;
}

export async function getTaskUsersLazy(taskid, pagenum) {
  const response = await http.get(`${apiEndpoint}/users/${taskid}/${pagenum}`);
  return response;
}

export async function getRecentTaskUsers(taskid) {
  const response = await http.get(`${apiEndpoint}/users/${taskid}/latest`);
  return response;
}

export async function findOrCreateTask(user, name, jwt) {
  const response = await http.post(`${apiEndpoint}/${user._id}`,
    { taskName: name },
    { 'headers': {'x-auth-token': jwt }
  });
  return response;
}

export async function removeTask(user, item, jwt) {
  const response = await http.post(`${apiEndpoint}/remove/${user._id}`,
    {
      item: item,
    },
    { 'headers': {'x-auth-token': jwt }
  });

  return response;
}

export async function toggleComplete(user, item, jwt) {
  const response = await http.put(`${apiEndpoint}/${user._id}`,
    {
      item: item
    }, { 'headers': {'x-auth-token': jwt }
  });

  return response;
}

export async function updateTask(user, item, newText, jwt) {
  const response = await http.post(`${apiEndpoint}/update/${user._id}`,
    { item, newText },
    { 'headers': {'x-auth-token': jwt }
  });

  return response;
}
