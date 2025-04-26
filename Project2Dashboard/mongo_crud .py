from pymongo import MongoClient
from bson.objectid import ObjectId

class AnimalShelter(object):
    """ CRUD operations for Animal collection in MongoDB """

    def __init__(self, username, password):
        # Initializing the MongoClient. This helps to 
        # access the MongoDB databases and collections.
        # This is hard-wired to use the aac database, the 
        # animals collection, and the aac user.
        # Definitions of the connection string variables are
        # unique to the individual Apporto environment.
        #
        # You must edit the connection variables below to reflect
        # your own instance of MongoDB!
        #
        # Connection Variables
        #
        USER = f'{username}'
        PASS = f'{password}'
        HOST = 'nv-desktop-services.apporto.com'
        PORT = 32966
        DB = 'aac'
        COL = 'animals'
        #
        # Initialize Connection
        #
        self.client = MongoClient('mongodb://%s:%s@%s:%d' % (USER,PASS,HOST,PORT))
        self.database = self.client['%s' % (DB)]
        self.collection = self.database['%s' % (COL)]

# Complete this create method to implement the C in CRUD.
    def create(self, data):
        if data is not None:
            try:
                self.database.animals.insert_one(data)  # data should be dictionary
                return True
            except Exception as e:
                print(f"An error occurred during insert: {e}")
                return False
        else:
            raise ValueError("Nothing to save, because data parameter is empty.")
        
# Create method to implement the R in CRUD.            
    def read(self, query):
        if query is not None:
            try:
                results = self.collection.find(query)
                return [doc for doc in results]   # List of documents
            except Exception as e:
                print(f"An error occurred during query: {e}")
                return []
        else:
            raise ValueError("Query parameter is empty.")

# Update Method for U
    def update(self, filter, query):
        if query is not None:
            try: 
                results = self.database.animals.update_many(filter, query)
                return results
            except Exception as e:
                print(f"An error occurred during update: {e}")
                return False
        else:
            raise ValueError("Query parameter is empty.")
        
# Delete Method 
    def delete(self, filter):
        if filter is not None:
            try: 
                results = self.database.animals.delete_many(filter)
                return results
            except Exception as e:
                print(f"An error occurred during delete: {e}")
                return False
        else:
            raise ValueError("Filter parameter is empty.")
