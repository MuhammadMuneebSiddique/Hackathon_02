// // Client-side database operations using API routes
// // We can't connect directly to the database from client-side code in Next.js
// // Instead, we'll use API routes to interact with the database

// // Base API helper functions
// const API_BASE = '/api/users';

// // CRUD Operations for Users using API routes
// export const userDb = {
//   // Create a new user
//   createUser: async (userData) => {
//     try {
//       const response = await fetch(API_BASE, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to create user');
//       }

//       return result.user;
//     } catch (error) {
//       console.error('Error creating user:', error);
//       throw error;
//     }
//   },

//   // Get user by ID
//   getUserById: async (userId) => {
//     try {
//       const response = await fetch(`${API_BASE}?id=${encodeURIComponent(userId)}`);

//       if (!response.ok) {
//         throw new Error('Failed to fetch user');
//       }

//       const result = await response.json();
//       return Array.isArray(result.users) && result.users.length > 0 ? result.users[0] : null;
//     } catch (error) {
//       console.error('Error getting user by ID:', error);
//       throw error;
//     }
//   },

//   // Get user by email
//   getUserByEmail: async (email) => {
//     try {
//       const response = await fetch(`${API_BASE}?email=${encodeURIComponent(email)}`);

//       if (!response.ok) {
//         throw new Error('Failed to fetch user');
//       }

//       const result = await response.json();
//       return Array.isArray(result.users) && result.users.length > 0 ? result.users[0] : null;
//     } catch (error) {
//       console.error('Error getting user by email:', error);
//       throw error;
//     }
//   },

//   // Update user
//   updateUser: async (userId, userData) => {
//     try {
//       const response = await fetch(API_BASE, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: userId, ...userData }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to update user');
//       }

//       return result.user;
//     } catch (error) {
//       console.error('Error updating user:', error);
//       throw error;
//     }
//   },
// };