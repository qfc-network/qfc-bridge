declare module "sql.js" {
  interface QueryResult {
    columns: string[];
    values: unknown[][];
  }

  interface Database {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): QueryResult[];
    export(): Uint8Array;
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }

  function initSqlJs(): Promise<SqlJsStatic>;
  export default initSqlJs;
  export type { Database };
}
