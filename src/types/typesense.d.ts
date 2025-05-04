declare module "typesense" {
  export class Client {
    constructor(config: {
      nodes: Array<{
        host: string;
        port: number;
        protocol: string;
      }>;
      apiKey: string;
      connectionTimeoutSeconds?: number;
    });

    collections(collectionName?: string): {
      create(schema: any): Promise<any>;
      documents(): {
        create(document: any): Promise<any>;
        upsert(document: any): Promise<any>;
      };
      documents(documentId: string): {
        delete(): Promise<any>;
      };
    };
  }
}
