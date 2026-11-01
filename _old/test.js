// import React, { useState, useEffect, useCallback } from 'react';

// function debounceSearch(func, delay = 500) {
//   let timeoutId;

//   return function (...args) {
//     clearTimeout(timeoutId);

//     timeoutId = setTimeout(() => {
//       func.apply(this, args);
//     }, delay);
//   };
// }

// const API_URL = (query) =>
//   `https://dummyjson.com/users/search?q=${encodeURIComponent(query)}`;

// function App() {
//   const [inputText, setInputText] = useState('');
//   const [searchData, setSearchData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const triggerSearchApi = async (query) => {
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(API_URL(query));

//       if (!response.ok) {
//         throw new Error('Failed to fetch users');
//       }

//       const result = await response.json();

//       const filteredUsers = result.users.map((user) => ({
//         firstName: user.firstName,
//         lastName: user.lastName,
//       }));

//       setSearchData(filteredUsers);
//     } catch (error) {
//       setError(error.message);
//       setSearchData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const debouncedSearch = useCallback(
//     debounceSearch(triggerSearchApi, 500),
//     [],
//   );

//   useEffect(() => {
//     const query = inputText.trim();

//     if (query.length >= 3) {
//       debouncedSearch(query);
//     } else {
//       setSearchData([]);
//       setLoading(false);
//       setError('');
//     }
//   }, [inputText, debouncedSearch]);

//   return (
//     <div>
//       <input
//         type="text"
//         value={inputText}
//         onChange={(e) => setInputText(e.target.value)}
//         placeholder="Search users..."
//       />

//       {loading && <div>Loading...</div>}

//       {error && <div>{error}</div>}

//       {!loading && !error && searchData.length > 0 && (
//         <div>
//           {searchData.map((user, index) => (
//             <div key={`${user.firstName}-${user.lastName}-${index}`}>
//               {user.firstName} {user.lastName}
//             </div>
//           ))}
//         </div>
//       )}

//       {!loading &&
//         !error &&
//         inputText.trim().length >= 3 &&
//         searchData.length === 0 && <div>No such users found</div>}
//     </div>
//   );
// }

// export default App;
