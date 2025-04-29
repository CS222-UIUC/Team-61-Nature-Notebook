import pandas as pd
import psycopg2

# Read the CSV file
df = pd.read_csv('birds.csv')

# Clean column names if needed (e.g., removing leading/trailing spaces)
df.columns = df.columns.str.strip()

# Database connection parameters
DB_NAME = "bird_database"
DB_USER = "team61"
DB_PWD = "cs222"
DB_HOST = "localhost"
DB_PORT = "5432"
connection = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PWD, host=DB_HOST, port=DB_PORT)
cursor = connection.cursor()
    
create_table_query = """
    CREATE TABLE IF NOT EXISTS birds_database (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
    );
    """
cursor.execute(create_table_query)
connection.commit()
    
for index, row in df.iterrows():
    insert_query = """
        INSERT INTO birds (id, name, description)
        VALUES (%s, %s, %s)
        ON CONFLICT (id) DO NOTHING;
        """
    cursor.execute(insert_query, (row['ID'], row['Name'], row['Description']))
    connection.commit()
    
cursor.close()
connection.close()
print("Connection closed.")
