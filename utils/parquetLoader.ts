import * as duckdb from '@duckdb/duckdb-wasm';

let db: duckdb.AsyncDuckDB | null = null;

export async function initializeDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) {
    return db;
  }

  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: 'text/javascript',
    })
  );

  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  console.groupEnd();

  return db;
}

export async function loadParquetData(
  parquetUrl: string, 
  tokenMapsUrl?: string
): Promise<any[]> {
  
  try {
    const db = await initializeDuckDB();
    const conn = await db.connect();

    const query = `SELECT * FROM read_parquet('${parquetUrl}')`;

    const result = await conn.query(query);
    const data = result.toArray().map((row) => row.toJSON());

    await conn.close();

    // Unmask PII if token maps are available
    if (tokenMapsUrl && data.length > 0) {
      const tokenMapsResponse = await fetch(tokenMapsUrl);
      const tokenMaps = await tokenMapsResponse.json();
      
      const unmaskedData = data.map(row => {
        const unmaskedRow = { ...row };
        Object.keys(tokenMaps).forEach(field => {
          if (unmaskedRow[field] && tokenMaps[field][unmaskedRow[field]]) {
            unmaskedRow[field] = tokenMaps[field][unmaskedRow[field]];
          }
        });
        return unmaskedRow;
      });
      
      console.groupEnd();
      return unmaskedData;
    }

    console.groupEnd();
    return data;
  } catch (error) {
    console.error('❌ Error loading Parquet data:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * Execute a custom SQL query on the Parquet file
 */
export async function executeQuery(query: string): Promise<any[]> {
  
  try {
    const db = await initializeDuckDB();
    const conn = await db.connect();
    const result = await conn.query(query);
    
    // ✅ FIX: Convert BigInt to regular numbers
    const data = result.toArray().map((row) => {
      const obj = row.toJSON();
      
      // Convert all BigInt values to numbers
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'bigint') {
          obj[key] = Number(obj[key]);
        }
      });
      
      return obj;
    });
    
    await conn.close();

    console.groupEnd();
    return data;
  } catch (error) {
    console.error('❌ Query execution failed:', error);
    console.error('📝 Failed query was:', query);
    console.groupEnd();
    throw error;
  }
}

/**
 * Execute multiple queries in batch (for drilldown charts)
 */
export async function executeBatchQueries(queries: string[]): Promise<any[][]> {
  
  try {
    const db = await initializeDuckDB();
    const conn = await db.connect();

    const results: any[][] = [];
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      try {
        const result = await conn.query(query);
        
        // ✅ FIX: Convert BigInt to regular numbers
        const data = result.toArray().map((row) => {
          const obj = row.toJSON();
          
          // Convert all BigInt values to numbers
          Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'bigint') {
              obj[key] = Number(obj[key]);
            }
          });
          
          return obj;
        });
        
        results.push(data);
      } catch (queryError) {
        console.error('❌ Query failed:', queryError);
        console.error('📝 Failed query:', query);
        results.push([]); // Push empty array for failed query
      }
      console.groupEnd();
    }

    await conn.close();
    return results;
  } catch (error) {
    console.error('❌ Batch execution failed:', error);
    console.groupEnd();
    throw error;
  }
}