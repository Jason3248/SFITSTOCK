// utils/api.js
export const fetchData = async (endpoint) => {
  const token = localStorage.getItem('token');

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // Handle the response as needed
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch data');
  }
  return data;
};
