//utils/queryBuilder.ts
interface QueryColumn {
  expression: string;
  alias: string;
}

interface QueryFrom {
  type: string;
  source: string;
}

interface QueryWhere {
  field: string;
  operator: string;
  type: string;
  value?: any;
}

interface QueryOrderBy {
  field: string;
  direction: string;
}

interface QueryObject {
  select: {
    columns: QueryColumn[];
  };
  from: QueryFrom;
  where: QueryWhere[];
  groupBy: string[];
  orderBy: QueryOrderBy[];
  limit: number | null;
  parameters?: Record<string, any>;
  union?: QueryObject[];
}

interface FilterState {
  [key: string]: any;
}

export class DynamicQueryBuilder {
  /**
   * Build SQL from query object with dynamic filter parameters
   * @param queryObj - The query object structure
   * @param filterValues - User-selected filter values
   * @param numericFields - Optional array of field names that should be cast to INTEGER
   */
  static buildSQL(
    queryObj: QueryObject, 
    filterValues: Record<string, any> = {},
    numericFields: string[] = []
  ): string {
    if (!queryObj.from?.source) throw new Error('Missing FROM source');
    
    const parquetUrl = queryObj.from.source;
    const replacePlaceholder = (text: string) => text?.replace(/\{\{?PARQUET_SOURCE\}\}?/g, `read_parquet('${parquetUrl}')`) || '';
    
    // Detect numeric fields from BETWEEN filters
    const allNumericFields = [...new Set([
      ...numericFields, 
      ...Object.keys(filterValues).filter(f => filterValues[f]?.operator === 'BETWEEN')
    ])];
    
    const castField = (field: string) => allNumericFields.includes(field) ? `CAST("${field}" AS INTEGER)` : `"${field}"`;

    // Handle UNION
    if (queryObj.union?.length) {
      return queryObj.union.map(u => this.buildSQL(u, filterValues, numericFields)).join(' UNION ALL ');
    }

    const parts: string[] = [];
    const columns = queryObj.select?.columns || [];

    // SELECT
    const selectCols = columns.map(c => {
      const expr = replacePlaceholder(c.expression);
      return c.alias ? `${expr} as ${c.alias}` : expr;
    });
    parts.push(`SELECT ${selectCols.join(', ') || '*'}`);

    // FROM
    parts.push(`FROM read_parquet('${parquetUrl}')`);

    // WHERE - Static + Dynamic
    const whereConditions: string[] = [];
    
    // Static conditions
    (queryObj.where || []).forEach(w => {
      if (w.condition) whereConditions.push(w.condition);
      else if (w.field && w.operator === 'IS NOT NULL') whereConditions.push(`${castField(w.field)} IS NOT NULL`);
      else if (w.field && w.operator === 'IS NULL') whereConditions.push(`${castField(w.field)} IS NULL`);
    });
    
    // Dynamic filters
    Object.entries(filterValues).forEach(([field, filter]) => {
      if (!filter?.operator || !filter?.value) return;
      
      const { operator, value } = filter;
      
      if (operator === 'BETWEEN' && value.min != null && value.max != null) {
        whereConditions.push(`${castField(field)} BETWEEN ${value.min} AND ${value.max}`);
      } else if (operator === 'IN' && Array.isArray(value) && value.length) {
        const vals = value.map(v => `'${String(v).replace(/'/g, "''")}'`).join(', ');
        whereConditions.push(`"${field}" IN (${vals})`);
      } else if (['=', '!=', '>', '<', '>=', '<='].includes(operator) && value != null) {
        const fieldRef = ['>', '<', '>=', '<='].includes(operator) ? castField(field) : `"${field}"`;
        const valStr = typeof value === 'number' ? value : `'${String(value).replace(/'/g, "''")}'`;
        whereConditions.push(`${fieldRef} ${operator} ${valStr}`);
      } else if (operator === 'LIKE') {
        whereConditions.push(`"${field}" LIKE '%${String(value).replace(/'/g, "''")}%'`);
      }
    });
    
    if (whereConditions.length) parts.push(`WHERE ${whereConditions.join(' AND ')}`);

    // Resolve column reference (number → alias/expression)
    const resolveCol = (ref: any): string|number => {
      if (typeof ref === 'number') {
        return ref;
      }
      if (typeof ref === 'string') {
        const match = ref.match(/^(\d+)\s+(ASC|DESC)$/i);
        if (match) {
          const col = columns[parseInt(match[1]) - 1];
          return `${col?.alias || col?.expression || match[1]} ${match[2]}`;
        }
      }
      return String(ref);
    };

    // GROUP BY
    if (queryObj.groupBy?.length) {
      parts.push(`GROUP BY ${queryObj.groupBy.map(resolveCol).join(', ')}`);
    }

    // ORDER BY - must match parquetLoader (buildQueryFromQueryObj / generateChartsFromParquet)
    // so main chart filters produce same SQL shape as drilldown and never get "[object Object]"
    if (queryObj.orderBy?.length) {
      const orderParts = queryObj.orderBy.map((o: any) => {
        if (typeof o === 'string') return o;
        if (typeof o === 'number') return `${o} ASC`;
        if (typeof o === 'object' && o !== null) {
          const col = o.position ?? o.column ?? o.alias ?? o.field;
          const dir = (o.direction ?? o.Direction ?? 'ASC').toString().toUpperCase();
          if (col != null && col !== undefined) return `${col} ${dir}`;
          // unexpected shape: avoid stringifying object
          return '1 ASC';
        }
        return typeof o === 'number' ? `${o} ASC` : '1 ASC';
      });
      parts.push(`ORDER BY ${orderParts.join(', ')}`);
    }

    // LIMIT
    if (queryObj.limit) parts.push(`LIMIT ${queryObj.limit}`);

    const query = parts.join(' ');
    console.log('SQL built:', query);
    return query;
  }

  /**
   * Convert filter UI values to filter definition object
   */
  static buildFilterValues(filters: any[], userSelections: FilterState): Record<string, any> {
    console.log('Building filter values...');
    
    const filterValues: Record<string, any> = {};
    
    if (!filters || !Array.isArray(filters)) {
      return filterValues;
    }
    
    if (!userSelections || typeof userSelections !== 'object') {
      return filterValues;
    }
    
    filters.forEach((filter) => {
      if (!filter || !filter.field) {
        return;
      }
      
      const userValue = userSelections[filter.field];
      
      if (userValue === null || userValue === undefined) {
        return;
      }
      
      // Handle different filter types
      if (filter.whereClause && filter.whereClause.operator) {
        const operator = filter.whereClause.operator;
        
        // Special handling for BETWEEN operator
        if (operator === 'BETWEEN') {
          if (typeof userValue === 'object' && userValue.min !== undefined && userValue.max !== undefined) {
            filterValues[filter.field] = {
              operator: operator,
              value: {
                min: userValue.min,
                max: userValue.max
              }
            };
          }
        }
        // Special handling for IN operator
        else if (operator === 'IN') {
          if (Array.isArray(userValue) && userValue.length > 0) {
            filterValues[filter.field] = {
              operator: operator,
              value: userValue
            };
          }
        }
        // All other operators (=, !=, >, <, >=, <=, LIKE)
        else {
          filterValues[filter.field] = {
            operator: operator,
            value: userValue
          };
        }
      }
    });
    
    console.log('Filter values built:', Object.keys(filterValues).length);
    return filterValues;
  }
}