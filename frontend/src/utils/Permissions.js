// utils/ is meant for pure JavaScript helper functions that have zero UI or JSX (thats why its .js not .jsx)

// inspect the logged-in user saved in localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// check the spesific group user belong to
export const hasGroup = (groupName) => {
  const user = getUser();
  return user?.groups?.includes(groupName) || false;
};

// role shortcut
export const isSuperUser = () => {
  const user = getUser();
  return Boolean(user?.is_superuser);
};
export const isManager = () => hasGroup('Manager');
export const isWorker = () => hasGroup('Worker');
export const isManagerOrWorker = () => isManager() || isWorker();
export const isNormalUser = () => !isManagerOrWorker() && !isSuperUser();
