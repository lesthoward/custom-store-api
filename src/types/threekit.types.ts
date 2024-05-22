export interface ColumnInfo {
    name: string;
    type: string;
}

export enum CustomerConfigurationsColumnNames {
    'customer_id' = 'customer_id',
    'configuration_id' = 'configuration_id',
    'configuration_name' = 'configuration_name',
    'configuration_data' = 'configuration_data',
    'created_at' = 'created_at',
    'updated_at' = 'updated_at',
}

export type CustomerConfigurationsColumnInfo = [
    { name: CustomerConfigurationsColumnNames.customer_id; type: 'String' },
    {
        name: CustomerConfigurationsColumnNames.configuration_id;
        type: 'String';
    },
    {
        name: CustomerConfigurationsColumnNames.configuration_name;
        type: 'String';
    },
    {
        name: CustomerConfigurationsColumnNames.configuration_data;
        type: 'String';
    },
    { name: CustomerConfigurationsColumnNames.created_at; type: 'String' },
    { name: CustomerConfigurationsColumnNames.updated_at; type: 'String' },
];

export enum StoresColumnNames {
    'store_id' = 'store_id',
    'store_name' = 'store_name',
    'customer_configurations_datatable_id' = 'customer_configurations_datatable_id',
    'created_at' = 'created_at',
    'updated_at' = 'updated_at',
}

export type StoresColumnInfo = [
    { name: StoresColumnNames.store_id; type: 'String' },
    { name: StoresColumnNames.store_name; type: 'String' },
    {
        name: StoresColumnNames.customer_configurations_datatable_id;
        type: 'String';
    },
    { name: StoresColumnNames.created_at; type: 'String' },
    { name: StoresColumnNames.updated_at; type: 'String' },
];

export type CreateDatatableParams =
    | SaveCustomerConfigurationsDatatable
    | StoreDatatable;

export interface SaveCustomerConfigurationsDatatable {
    storeId: string;
    type: 'save_customer_configurations';
}

interface StoreDatatable {
    type: 'store';
}

export type UpdateDatatableUnion = UpdateStoreDatatable & {
    datatableName: string;
    datatableId: string;
};

interface UpdateStoreDatatable {
    type: 'store';
    data: Record<StoresColumnNames, string>;
}

interface GetDatatableRow<T extends string | number | symbol> {
    id: string;
    orgId: string;
    tableId: string;
    value: Record<T, string | undefined>;
    version: number;
    createdAt: string;
}

export interface TheekitGetDatatableRows<T extends string | number | symbol> {
    count: number;
    sort: string;
    rows: GetDatatableRow<T>[];
}

export interface ThreekitGetDatatableByName {
    id: string;
    orgId: string;
    name: string;
    version: number;
    columnInfo: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: any;
    deletedBy: any;
}

export interface GetDatatableByNameResponse {
    datatable: ThreekitGetDatatableByName | undefined;
}

export interface ThreekitCreateDatatable {
    id: string;
    orgId: string;
    name: string;
    version: number;
    columnInfo: ColumnInfo[];
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    deletedBy: string | null;
}

export interface CreateDatatableResponse {
    datatableColumnInfo: ColumnInfo[];
    datatableName: string;
    apiResponse: ThreekitCreateDatatable;
}

export interface ThreekitUpdateDatatable {
    id: string;
    orgId: string;
    name: string;
    version: number;
    columnInfo: ColumnInfo[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: string | null;
    deletedBy: string | null;
}

export interface UpdateDatatableResponse {
    apiResponse: ThreekitUpdateDatatable;
}
