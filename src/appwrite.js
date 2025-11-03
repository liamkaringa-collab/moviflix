import {Client, Databases, ID, Query} from 'appwrite'

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  console.log('updateSearchCount called with:', searchTerm);
  console.log('Environment variables:', { DATABASE_ID, TABLE_ID, PROJECT_ID });
  try {
    const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [ 
        Query.equal('searchTerm', searchTerm)
    ]);
    console.log('Search result:', result);
  
    if(result.documents.length > 0) {
      const doc = result.documents[0];
      console.log('Updating existing document:', doc.$id);
      
      await database.updateDocument(DATABASE_ID, TABLE_ID, doc.$id, {
        count: doc.count + 1
      });
      console.log('Document updated successfully');
    } else {
      console.log('Creating new document');
      await database.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      });
      console.log('Document created successfully');
    }
  } catch (error) {
    console.error('Appwrite error:', error);
  }
} 