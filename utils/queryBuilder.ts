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
  // static buildSQL(
  //   queryObj: QueryObject, 
  //   filterValues: Record<string, any> = {},
  //   numericFields: string[] = []
  // ): string {
  //   // ✅ CRITICAL CHECK: Verify FROM source exists
  //   if (!queryObj.from || !queryObj.from.source) {
  //     console.error('❌ CRITICAL: Missing FROM source in queryObject!');
  //     throw new Error('Query object must have a valid FROM source');
  //   }
    
    
  //   // ✅ Auto-detect numeric fields from filterValues with BETWEEN operator
  //   const detectedNumericFields = Object.keys(filterValues).filter(field => 
  //     filterValues[field] && filterValues[field].operator === 'BETWEEN'
  //   );
    
  //   // Combine provided numeric fields with detected ones
  //   const allNumericFields = [...new Set([...numericFields, ...detectedNumericFields])];

  //   // ✅ DEFINE HELPER FUNCTIONS FIRST - BEFORE ANY OTHER CODE
  //   const needsCasting = (fieldName: string): boolean => {
  //     return allNumericFields.includes(fieldName);
  //   };
    
  //   const getFieldRef = (fieldName: string): string => {
  //     return needsCasting(fieldName) ? `CAST("${fieldName}" AS INTEGER)` : `"${fieldName}"`;
  //   };

  //   // Handle UNION queries
  //   if (queryObj.union && queryObj.union.length > 0) {
  //     const unionQueries = queryObj.union.map((unionPart, idx) => {
  //       return this.buildSQL(unionPart, filterValues, numericFields);
  //     });
  //     const finalQuery = unionQueries.join(' UNION ALL ');
  //     console.groupEnd();
  //     return finalQuery;
  //   }

  //   const parts: string[] = [];

  //   // SELECT clause
  //   const columns = queryObj.select?.columns || [];
  //   const selectCols = columns.map(col => {
  //     let expression = col.expression;
      
  //     // ✅ Check if expression is a simple field reference
  //     const fieldMatch = expression.match(/^"([^"]+)"$/);
  //     if (fieldMatch) {
  //       const fieldName = fieldMatch[1];
  //       if (needsCasting(fieldName)) {
  //         expression = getFieldRef(fieldName);
  //       }
  //     }
      
  //     const colStr = col.alias ? `${expression} as ${col.alias}` : expression;
  //     return colStr;
  //   });
  //   const selectClause = `SELECT ${selectCols.join(', ') || '*'}`;
  //   parts.push(selectClause);

  //   // FROM clause
  //   const from = queryObj.from || { type: 'parquet', source: '' };
  //   let fromClause = '';
  //   if (from.type === 'parquet') {
  //     fromClause = `FROM read_parquet('${from.source}')`;
  //   } else {
  //     fromClause = `FROM ${from.source}`;
  //   }
  //   parts.push(fromClause);
  //   // WHERE clause - combine static and dynamic conditions
  //   const whereConditions: string[] = [];
    
  //   // Add static conditions from query object
  //   (queryObj.where || []).forEach((condition, idx) => {
  //     if (condition.type === 'static') {
  //       const { field, operator, value } = condition;
  //       let conditionStr = '';
        
  //       // ✅ Use helper function for field reference
  //       const fieldRef = getFieldRef(field);
        
  //       if (operator === 'IS NOT NULL') {
  //         conditionStr = `${fieldRef} IS NOT NULL`;
  //       } else if (operator === 'IS NULL') {
  //         conditionStr = `${fieldRef} IS NULL`;
  //       } else if (operator === '=' && value !== null && value !== undefined) {
  //         // Handle static equality conditions
  //         if (needsCasting(field)) {
  //           conditionStr = `${fieldRef} = ${value}`;
  //         } else {
  //           conditionStr = `${fieldRef} = '${String(value).replace(/'/g, "''")}'`;
  //         }
  //       }
        
  //       if (conditionStr) {
  //         whereConditions.push(conditionStr);
  //       }
  //     }
  //   });
    
  //   // Add dynamic conditions from filter values
  //   Object.entries(filterValues).forEach(([field, filterDef]: [string, any], idx) => {
      
  //     if (!filterDef || typeof filterDef !== 'object') {
  //       return;
  //     }
      
  //     const { operator, value } = filterDef;
      
  //     if (operator === 'BETWEEN' && value) {
  //       // ✅ FIX: Validate min/max exist and are valid numbers
  //       if (value.min !== undefined && value.min !== null && 
  //           value.max !== undefined && value.max !== null &&
  //           !isNaN(value.min) && !isNaN(value.max)) {
  //         // ✅ Use helper function for field reference with casting
  //         const fieldRef = getFieldRef(field);
  //         const conditionStr = `${fieldRef} BETWEEN ${value.min} AND ${value.max}`;
  //         whereConditions.push(conditionStr);
  //       } else {
  //       }
  //     } else if (operator === 'IN' && value) {
  //       // ✅ FIX: Check that value is an array with items
  //       if (Array.isArray(value) && value.length > 0) {
  //         const values = value
  //           .filter(v => v !== null && v !== undefined)
  //           .map((v: any) => `'${String(v).replace(/'/g, "''")}'`)
  //           .join(', ');
          
  //         if (values) {
  //           const conditionStr = `"${field}" IN (${values})`;
  //           whereConditions.push(conditionStr);
  //         } else {
  //         }
  //       } else {
  //       }
  //     } else if (operator === '=' && value !== null && value !== undefined) {
  //       const conditionStr = `"${field}" = '${String(value).replace(/'/g, "''")}'`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '!=' && value !== null && value !== undefined) {
  //       const conditionStr = `"${field}" != '${String(value).replace(/'/g, "''")}'`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '>' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} > ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '<' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} < ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '>=' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} >= ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '<=' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} <= ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === 'LIKE' && value !== null && value !== undefined) {
  //       const conditionStr = `"${field}" LIKE '%${String(value).replace(/'/g, "''")}%'`;
  //       whereConditions.push(conditionStr);
  //     } else {
  //     }
  //   });
    
  //   if (whereConditions.length > 0) {
  //     const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
  //     parts.push(whereClause);
  //   } else {
  //   }

  //   // GROUP BY clause
  //   if (queryObj.groupBy && queryObj.groupBy.length > 0) {
  //     const groupFields = queryObj.groupBy.map(field => {
  //       const fieldRef = getFieldRef(field);
  //       if (needsCasting(field)) {
  //       }
  //       return fieldRef;
  //     }).join(', ');
  //     const groupByClause = `GROUP BY ${groupFields}`;
  //     parts.push(groupByClause);
  //   } else {
  //   }

  //   // ORDER BY clause
  //   if (queryObj.orderBy && queryObj.orderBy.length > 0) {
  //     const orderParts = queryObj.orderBy.map(order => {
  //       const orderStr = `${order.field} ${order.direction || 'ASC'}`;
  //       return orderStr;
  //     });
  //     const orderByClause = `ORDER BY ${orderParts.join(', ')}`;
  //     parts.push(orderByClause);
  //   } else {
  //   }

  //   if (queryObj.limit) {
  //     const limitClause = `LIMIT ${queryObj.limit}`;
  //     parts.push(limitClause);
  //   } else {
  //   }

  //   const finalQuery = parts.join(' ');
  //   console.groupEnd();
    
  //   return finalQuery;
  // }

  // utils/queryBuilder.ts
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
    const resolveCol = (ref: any): string => {
      if (typeof ref === 'number') {
        const col = columns[ref - 1];
        return col?.alias || col?.expression || String(ref);
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

    // ORDER BY
    if (queryObj.orderBy?.length) {
      const orderParts = queryObj.orderBy.map(o => {
        if (typeof o === 'object' && 'field' in o) {
          return `${o.field || o.column || o.alias} ${o.direction || 'ASC'}`;
        }
        return resolveCol(o);
      });
      parts.push(`ORDER BY ${orderParts.join(', ')}`);
    }

    // LIMIT
    if (queryObj.limit) parts.push(`LIMIT ${queryObj.limit}`);

    const query = parts.join(' ');
    console.log('✅ SQL built:', query);
    return query;
  }
  // static buildSQL(
  //   queryObj: QueryObject, 
  //   filterValues: Record<string, any> = {},
  //   numericFields: string[] = []
  // ): string {
  //   // ✅ CRITICAL CHECK: Verify FROM source exists
  //   if (!queryObj.from || !queryObj.from.source) {
  //     console.error('❌ CRITICAL: Missing FROM source in queryObject!');
  //     throw new Error('Query object must have a valid FROM source');
  //   }
    
  //   // ✅ Extract parquet URL from from.source
  //   const parquetUrl = queryObj.from.source;
    
  //   // ✅ ADD: Helper to replace placeholders
  //   const replacePlaceholders = (text: string): string => {
  //     if (!text) return text;
  //     return text
  //       .replace(/\{\{PARQUET_SOURCE\}\}/g, `read_parquet('${parquetUrl}')`)
  //       .replace(/\{PARQUET_SOURCE\}/g, `read_parquet('${parquetUrl}')`);
  //   };
    
  //   // ✅ Auto-detect numeric fields from filterValues with BETWEEN operator
  //   const detectedNumericFields = Object.keys(filterValues).filter(field => 
  //     filterValues[field] && filterValues[field].operator === 'BETWEEN'
  //   );
    
  //   // Combine provided numeric fields with detected ones
  //   const allNumericFields = [...new Set([...numericFields, ...detectedNumericFields])];

  //   // ✅ DEFINE HELPER FUNCTIONS
  //   const needsCasting = (fieldName: string): boolean => {
  //     return allNumericFields.includes(fieldName);
  //   };
    
  //   const getFieldRef = (fieldName: string): string => {
  //     return needsCasting(fieldName) ? `CAST("${fieldName}" AS INTEGER)` : `"${fieldName}"`;
  //   };

  //   // Handle UNION queries
  //   if (queryObj.union && queryObj.union.length > 0) {
  //     const unionQueries = queryObj.union.map((unionPart, idx) => {
  //       return this.buildSQL(unionPart, filterValues, numericFields);
  //     });
  //     const finalQuery = unionQueries.join(' UNION ALL ');
  //     return finalQuery;
  //   }

  //   const parts: string[] = [];

  //   // SELECT clause - ✅ REPLACE PLACEHOLDERS IN EXPRESSIONS
  //   const columns = queryObj.select?.columns || [];
  //   const selectCols = columns.map(col => {
  //     // ✅ CRITICAL FIX: Replace placeholders in the ENTIRE expression (including subqueries)
  //     let expression = replacePlaceholders(col.expression);
      
  //     // Check if expression is a simple field reference
  //     const fieldMatch = expression.match(/^"([^"]+)"$/);
  //     if (fieldMatch) {
  //       const fieldName = fieldMatch[1];
  //       if (needsCasting(fieldName)) {
  //         expression = getFieldRef(fieldName);
  //       }
  //     }
      
  //     const colStr = col.alias ? `${expression} as ${col.alias}` : expression;
  //     return colStr;
  //   });
  //   const selectClause = `SELECT ${selectCols.join(', ') || '*'}`;
  //   parts.push(selectClause);

  //   // FROM clause
  //   const from = queryObj.from || { type: 'parquet', source: '' };
  //   let fromClause = '';
  //   if (from.type === 'parquet') {
  //     fromClause = `FROM read_parquet('${from.source}')`;
  //   } else {
  //     fromClause = `FROM ${from.source}`;
  //   }
  //   parts.push(fromClause);
    
  //   // WHERE clause - combine static and dynamic conditions
  //   const whereConditions: string[] = [];
    
  //   // Add static conditions from query object
  //   (queryObj.where || []).forEach((condition, idx) => {
  //     if (condition.type === 'static') {
  //       const { field, operator, value } = condition;
  //       let conditionStr = '';
        
  //       // Use helper function for field reference
  //       const fieldRef = getFieldRef(field);
        
  //       if (operator === 'IS NOT NULL') {
  //         conditionStr = `${fieldRef} IS NOT NULL`;
  //       } else if (operator === 'IS NULL') {
  //         conditionStr = `${fieldRef} IS NULL`;
  //       } else if (operator === '=' && value !== null && value !== undefined) {
  //         // Handle static equality conditions
  //         if (needsCasting(field)) {
  //           conditionStr = `${fieldRef} = ${value}`;
  //         } else {
  //           conditionStr = `${fieldRef} = '${String(value).replace(/'/g, "''")}'`;
  //         }
  //       }
        
  //       if (conditionStr) {
  //         whereConditions.push(conditionStr);
  //       }
  //     }
  //   });
    
  //   // Add dynamic conditions from filter values
  //   Object.entries(filterValues).forEach(([field, filterDef]: [string, any], idx) => {
  //     if (!filterDef || typeof filterDef !== 'object') {
  //       return;
  //     }
      
  //     const { operator, value } = filterDef;
      
  //     if (operator === 'BETWEEN' && value) {
  //       // Validate min/max exist and are valid numbers
  //       if (value.min !== undefined && value.min !== null && 
  //           value.max !== undefined && value.max !== null &&
  //           !isNaN(value.min) && !isNaN(value.max)) {
  //         const fieldRef = getFieldRef(field);
  //         const conditionStr = `${fieldRef} BETWEEN ${value.min} AND ${value.max}`;
  //         whereConditions.push(conditionStr);
  //       }
  //     } else if (operator === 'IN' && value) {
  //       // Check that value is an array with items
  //       if (Array.isArray(value) && value.length > 0) {
  //         const values = value
  //           .filter(v => v !== null && v !== undefined)
  //           .map((v: any) => `'${String(v).replace(/'/g, "''")}'`)
  //           .join(', ');
          
  //         if (values) {
  //           const conditionStr = `"${field}" IN (${values})`;
  //           whereConditions.push(conditionStr);
  //         }
  //       }
  //     } else if (operator === '=' && value !== null && value !== undefined) {
  //       const conditionStr = `"${field}" = '${String(value).replace(/'/g, "''")}'`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '!=' && value !== null && value !== undefined) {
  //       const conditionStr = `"${field}" != '${String(value).replace(/'/g, "''")}'`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '>' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} > ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '<' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} < ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '>=' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} >= ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === '<=' && value !== null && value !== undefined && !isNaN(value)) {
  //       const fieldRef = getFieldRef(field);
  //       const conditionStr = `${fieldRef} <= ${value}`;
  //       whereConditions.push(conditionStr);
  //     } else if (operator === 'LIKE' && value !== null && value !== undefined) {
  //       const conditionStr = `"${field}" LIKE '%${String(value).replace(/'/g, "''")}%'`;
  //       whereConditions.push(conditionStr);
  //     }
  //   });
    
  //   if (whereConditions.length > 0) {
  //     const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
  //     parts.push(whereClause);
  //   }

  //   // GROUP BY clause
  //   if (queryObj.groupBy && queryObj.groupBy.length > 0) {
  //     const groupFields = queryObj.groupBy.map(field => {
  //       const fieldRef = getFieldRef(field);
  //       return fieldRef;
  //     }).join(', ');
  //     const groupByClause = `GROUP BY ${groupFields}`;
  //     parts.push(groupByClause);
  //   }

  //   // ORDER BY clause
  //   if (queryObj.orderBy && queryObj.orderBy.length > 0) {
  //     const orderParts = queryObj.orderBy.map(order => {
  //       const orderStr = `${order.field} ${order.direction || 'ASC'}`;
  //       return orderStr;
  //     });
  //     const orderByClause = `ORDER BY ${orderParts.join(', ')}`;
  //     parts.push(orderByClause);
  //   }

  //   if (queryObj.limit) {
  //     const limitClause = `LIMIT ${queryObj.limit}`;
  //     parts.push(limitClause);
  //   }

  //   const finalQuery = parts.join(' ');
    
  //   return finalQuery;
  // }

  /**
   * Convert filter UI values to filter definition object
   */
  static buildFilterValues(filters: any[], userSelections: FilterState): Record<string, any> {
    console.log('🔧 Building filter values...');
    
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
    
    console.log('✅ Filter values built:', Object.keys(filterValues).length);
    return filterValues;
  }
  // static buildFilterValues(filters: any[], userSelections: FilterState): Record<string, any> {
    
  //   const filterValues: Record<string, any> = {};
    
  //   if (!filters || !Array.isArray(filters)) {
  //     console.groupEnd();
  //     return filterValues;
  //   }
    
  //   if (!userSelections || typeof userSelections !== 'object') {
  //     console.groupEnd();
  //     return filterValues;
  //   }
    
  //   filters.forEach((filter, idx) => {
  //     if (!filter || !filter.field) {
  //       return;
  //     }
      
  //     const userValue = userSelections[filter.field];
      
  //     if (userValue === null || userValue === undefined) {
  //       return;
  //     }
      
  //     // Handle different filter types
  //     if (filter.whereClause && filter.whereClause.operator) {
        
  //       const operator = filter.whereClause.operator;
        
  //       // Special handling for BETWEEN operator
  //       if (operator === 'BETWEEN') {
  //         if (typeof userValue === 'object' && userValue.min !== undefined && userValue.max !== undefined) {
  //           filterValues[filter.field] = {
  //             operator: operator,
  //             value: {
  //               min: userValue.min,
  //               max: userValue.max
  //             }
  //           };
  //         } else {
  //         }
  //       }
  //       // Special handling for IN operator
  //       else if (operator === 'IN') {
  //         if (Array.isArray(userValue) && userValue.length > 0) {
  //           filterValues[filter.field] = {
  //             operator: operator,
  //             value: userValue
  //           };
  //         } else {
  //         }
  //       }
  //       // All other operators (=, !=, >, <, >=, <=, LIKE)
  //       else {
  //         filterValues[filter.field] = {
  //           operator: operator,
  //           value: userValue
  //         };
  //       }
  //     } else {
  //     }
  //   });
    
  //   console.groupEnd();
    
  //   return filterValues;
  // }
}