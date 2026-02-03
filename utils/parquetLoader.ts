//utils/parquetLoader.ts
import * as duckdb from '@duckdb/duckdb-wasm';

let db: duckdb.AsyncDuckDB | null = null;

// No-op logger for production - prevents DuckDB from logging to console
class NoOpLogger {
  log() {}
  warn() {}
  error() {}
}

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
  
  // Use no-op logger in production to prevent DuckDB structured logs
  // In development, use ConsoleLogger for debugging
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === 'production';
  
  const logger = isProduction 
    ? (new NoOpLogger() as any)  // Cast to match DuckDB's logger interface
    : new duckdb.ConsoleLogger();
  
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  console.groupEnd();

  return db;
}

/**
 * Execute multiple queries in batch (for drilldown charts)
 * Useful for loading multiple chart data at once
 */
export async function executeBatchQueries(queries: string[]): Promise<any[][]> {
  console.log('Executing batch queries, count:', queries.length);
  
  try {
    const db = await initializeDuckDB();
    const conn = await db.connect();
    const results: any[][] = [];
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`Executing query ${i + 1}/${queries.length}`);
      
      try {
        const result = await conn.query(query);
        
        // Convert BigInt to regular numbers
        const data = result.toArray().map((row) => {
          const obj = row.toJSON();
          
          Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'bigint') {
              obj[key] = Number(obj[key]);
            }
          });
          
          return obj;
        });
        
        results.push(data);
      } catch (queryError) {
        console.error(`Query ${i + 1} failed:`, queryError);
        console.error('Failed query:', query);
        results.push([]); // Push empty array for failed query
      }
    }

    await conn.close();
    console.log('Batch execution complete. Result is', results);
    return results;
  } catch (error) {
    console.error('Batch execution failed:', error);
    throw error;
  }
}

/**
 * Generate cards from JSON config and Parquet URL
 */
export async function generateCardsFromParquet(cardsQueries: any, parquetUrl: string) {
  try {
    const db = await initializeDuckDB();
    const conn = await db.connect();
    
    const colors = ["blue", "green", "purple", "orange", "red", "teal"];
    const iconMap: Record<string, string> = {
      "Users": "Users",
      "PieChart": "Activity", 
      "TrendingUp": "TrendingUp",
      "TrendingDown": "TrendingDown",
      "BarChart": "BarChart",
      "Briefcase": "Briefcase",
      "Clock": "Clock",
      "Globe": "Globe",
      "Award": "Award"
    };

    // const config = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;

    const results = await Promise.all(
      cardsQueries.map(async (card: any, index: number) => {
        const { query_obj, id, title, icon, value_format } = card;

        // Build SELECT clause with safety transformations
        const selectClause = query_obj.select.columns
          .map((c: any) => {
            let expr = c.expression;
            
            // Fix date_diff without TRY_CAST
            if (expr.includes('date_diff') && !expr.includes('TRY_CAST')) {
              expr = expr.replace(/date_diff\('(\w+)',\s*(\w+),/g, "date_diff('$1', TRY_CAST($2 AS DATE),");
            }
            
            // Ensure float division in CASE statements
            expr = expr.replace(/THEN 1 ELSE 0/g, 'THEN 1.0 ELSE 0.0')
                       .replace(/\/ COUNT\(\*\)/g, '/ CAST(COUNT(*) AS DOUBLE)');
            
            // Ensure AVG uses TRY_CAST
            if (!expr.includes('TRY_CAST') && expr.match(/AVG\([a-z_]+\)/i)) {
              expr = expr.replace(/AVG\(([a-z_]+)\)/gi, 'AVG(TRY_CAST($1 AS DOUBLE))');
            }
            
            return `${expr} AS ${c.alias}`;
          })
          .join(", ");

        // Build WHERE clause
        const whereClause = query_obj.where && query_obj.where.length
          ? "WHERE " + query_obj.where
              .map((w: any) => {
                if (w.operator === "IS" && w.value === "NULL") {
                  return `${w.column} IS NULL`;
                }
                if (w.operator === "IS NOT" && w.value === "NULL") {
                  return `${w.column} IS NOT NULL`;
                }
                return `${w.column} ${w.operator} '${w.value}'`;
              })
              .join(" AND ")
          : "";

        // Construct final query
        const query = `
          SELECT ${selectClause}
          FROM read_parquet('${parquetUrl}')
          ${whereClause}
        `.trim();

        console.log(`Executing card query for ${title}:`, query);

        // Execute query
        const result = await conn.query(query);
        const data = result.toArray().map((row) => {
          const obj = row.toJSON();
          // Convert BigInt to numbers
          Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'bigint') {
              obj[key] = Number(obj[key]);
            }
          });
          return obj;
        });

        const rawValue = data[0]?.value ?? 0;

        // Format value based on value_format
        let formattedValue: string;
        if (value_format?.includes('%')) {
          formattedValue = `${(rawValue * 100).toFixed(1)}%`;
        } else if (value_format?.includes('$')) {
          formattedValue = `$${Math.round(rawValue).toLocaleString()}`;
        } else if (value_format?.includes('₹')) {
          formattedValue = `₹${Math.round(rawValue).toLocaleString()}`;
        } else if (value_format === '0.0') {
          formattedValue = rawValue.toFixed(1);
        } else {
          formattedValue = Math.round(rawValue).toLocaleString();
        }

        return {
          id,
          icon: iconMap[icon] || "Users",
          color: colors[index % colors.length],
          title,
          value: formattedValue,
        };
      })
    );

    await conn.close();
    console.log("Cards generated:", results);
    return { cards: results };

  } catch (error) {
    console.error('Error generating cards:', error);
    throw error;
  }
}

/**
 * Generate charts from JSON config and Parquet URL
 */
export async function generateChartsFromParquet(chartsQueries: any, parquetUrl: string) {
  try {
    const db = await initializeDuckDB();
    const conn = await db.connect();

    // const config = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;

    const results = await Promise.all(
      chartsQueries.map(async (chart: any) => {
        const { query_obj, id, title, icon, type, field, xLabel, yLabel } = chart;

        const selectClause = query_obj.select.columns
          .map((c: any) => {
            const expression = c.expression.replace(/{PARQUET_SOURCE}/g, `read_parquet('${parquetUrl}')`);
            return `${expression} AS ${c.alias}`;
          })
          .join(", ");

        let whereClause = "";
        if (query_obj.where && query_obj.where.length) {
          const firstWhere = query_obj.where[0];
          
          if (typeof firstWhere === 'string') {
            whereClause = "WHERE " + query_obj.where.join(" AND ");
          } else if (firstWhere.condition) {
            whereClause = "WHERE " + query_obj.where.map((w: any) => w.condition).join(" AND ");
          } else if (firstWhere.column) {
            whereClause = "WHERE " + query_obj.where
              .map((w: any) => {
                if (w.operator === "IS" && w.value === "NULL") {
                  return `${w.column} IS NULL`;
                }
                if (w.operator === "IS NOT" && w.value === "NULL") {
                  return `${w.column} IS NOT NULL`;
                }
                return `${w.column} ${w.operator} '${w.value}'`;
              })
              .join(" AND ");
          }
        }

        const groupByClause = query_obj.groupBy && query_obj.groupBy.length
          ? "GROUP BY " + query_obj.groupBy
              .map((g: any) => {
                if (typeof g === 'number') return g;
                if (typeof g === 'string') return g;
                return g.expression || g.column || g.position;
              })
              .join(", ")
          : "";

        const orderByClause = query_obj.orderBy && query_obj.orderBy.length
          ? "ORDER BY " + query_obj.orderBy
              .map((o: any) => {
                if (typeof o === 'string') return o;
                if (typeof o === 'number') return o;
                
                const col = o.position || o.column || o.alias;
                const dir = o.direction || 'ASC';
                return `${col} ${dir}`;
              })
              .join(", ")
          : "";

        const limitClause = query_obj.parameters?.limit 
          ? `LIMIT ${query_obj.parameters.limit}` 
          : "";

        const query = `
          SELECT ${selectClause}
          FROM read_parquet('${parquetUrl}')
          ${whereClause}
          ${groupByClause}
          ${orderByClause}
          ${limitClause}
        `.trim();

        console.log(`Executing chart query for ${title}:`, query);

        const result = await conn.query(query);
        const data = result.toArray().map((row) => {
          const obj = row.toJSON();
          Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'bigint') {
              obj[key] = Number(obj[key]);
            }
          });
          return obj;
        });

        const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

        const dataWithPercentage = data.map(item => {
          let formattedName = item.name;
          
          // Handle timestamp conversion
          if (typeof item.name === 'number' && item.name > 1000000000000) {
            const date = new Date(item.name);
            formattedName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          } else if (typeof item.name === 'number') {
            formattedName = item.name;
          } else {
            formattedName = String(item.name);
          }
          
          // ALWAYS round to 2 decimal places (fallback protection)
          const roundedValue = typeof item.value === 'number' 
            ? parseFloat(item.value.toFixed(2)) 
            : 0;
          
          return {
            name: formattedName,
            value: roundedValue,
            percentage: total > 0 ? parseFloat(((roundedValue / total) * 100).toFixed(1)) : 0
          };
        });

        const colors = ["#3b82f6", "#10b981", "#f43f5e", "#8b5cf6", "#22d3ee"];

        return {
          id: id || chart.semantic_id,
          title,
          type,
          field,
          icon,
          xLabel,
          yLabel,
          data: dataWithPercentage,
          colors: colors.slice(0, data.length)
        };
      })
    );

    await conn.close();
    console.log("Charts generated:", results);
    return results;

  } catch (error) {
    console.error('Error generating charts:', error);
    throw error;
  }
}

/**
 * Build SQL query from query_obj structure
 */
export function buildQueryFromQueryObj(queryObj: any, parquetUrl: string): string {
  const { select, where, groupBy, orderBy, parameters } = queryObj;

  console.log("Select clause received in buildQueryFromQueryObj is", select)
  
  // CRITICAL FIX: Create a helper to replace ALL placeholders recursively
  const replacePlaceholders = (text: string): string => {
    if (!text) return text;
    return text
      .replace(/\{\{PARQUET_SOURCE\}\}/g, `read_parquet('${parquetUrl}')`)
      .replace(/\{PARQUET_SOURCE\}/g, `read_parquet('${parquetUrl}')`);
  };
  
  // Build SELECT clause - replace placeholders in ENTIRE expression (including subqueries)
  const selectClause = select.columns
    .map((col: any) => {
      // Replace placeholders in the FULL expression string (handles nested subqueries)
      const expression = replacePlaceholders(col.expression);
      return `${expression} AS ${col.alias}`;
    })
    .join(", ");
  
  // Build WHERE clause - also replace placeholders in WHERE conditions
  let whereClause = "";
  if (where && where.length > 0) {
    const conditions = where.map((w: any) => {
      const condition = w.condition || '';
      // Replace placeholders in WHERE conditions
      return replacePlaceholders(condition);
    }).join(" AND ");
    whereClause = `WHERE ${conditions}`;
  }
  
  // Build GROUP BY clause
  const groupByClause = groupBy && groupBy.length > 0
    ? `GROUP BY ${groupBy.join(", ")}`
    : "";
  
  // Build ORDER BY clause - handle string format like "2 DESC"
  const orderByClause = orderBy && orderBy.length > 0
    ? `ORDER BY ${orderBy.map((o: any) => {
        if (typeof o === 'string') return o;
        if (typeof o === 'number') return `${o} ASC`;
        if (o.position || o.column || o.alias) {
          const col = o.position || o.column || o.alias;
          const dir = o.direction || 'ASC';
          return `${col} ${dir}`;
        }
        return String(o);
      }).join(", ")}`
    : "";
  
  // Build LIMIT clause
  const limitClause = parameters?.limit ? `LIMIT ${parameters.limit}` : "";
  
  const query = `
    SELECT ${selectClause}
    FROM read_parquet('${parquetUrl}')
    ${whereClause}
    ${groupByClause}
    ${orderByClause}
    ${limitClause}
  `.trim();

  console.log("Query built for drilldown chart", query)
  
  return query;
}


/**
 * Generate data for drilldown charts
 */
export async function generateDrilldownChartsData(
  chartsWithQueries: any[],
  parquetUrl: string
): Promise<any[]> {
  try {
    const db = await initializeDuckDB();
    const conn = await db.connect();
    
    const results = await Promise.all(
      chartsWithQueries.map(async (chart) => {
        // Use the pre-built query OR build from queryObject
        const query = chart.query || buildQueryFromQueryObj(chart.queryObject || chart.query_obj, parquetUrl);

        console.log(`Executing drilldown query for ${chart.title}:`, query);
        
        const result = await conn.query(query);
        const data = result.toArray().map((row) => {
          const obj = row.toJSON();
          Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'bigint') {
              obj[key] = Number(obj[key]);
            }
          });
          return obj;
        });
        
        // Calculate percentages
        const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
        const dataWithPercentage = data.map(item => ({
          name: item.name,
          value: item.value || 0,
          percentage: total > 0 ? parseFloat(((item.value / total) * 100).toFixed(1)) : 0
        }));
        
        return {
          id: chart.semantic_id || chart.id,
          title: chart.title,
          type: chart.type,
          field: chart.field,
          icon: chart.icon,
          xLabel: chart.xLabel,
          yLabel: chart.yLabel,
          description: chart.description,
          data: dataWithPercentage,
          colors: ["#3b82f6", "#10b981", "#f43f5e", "#8b5cf6", "#22d3ee"],
          queryObject: chart.queryObject  // ✅ CRITICAL: Pass through the updated queryObject with actual URL
        };
      })
    );
    
    await conn.close();
    console.log("Drilldown charts generated:", results);
    return results;
    
  } catch (error) {
    console.error('Error generating drilldown charts:', error);
    throw error;
  }
}