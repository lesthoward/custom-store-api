import {
    CustomerConfigurationsColumnInfo,
    CustomerConfigurationsColumnNames,
    StoresColumnInfo,
    StoresColumnNames,
} from '../types/threekit.types';

export const storesDatatableName = 'stores';
export const customerConfigurationsDatatableName = 'customer_configurations_';

export const customerConfigurationsColumnInfo: CustomerConfigurationsColumnInfo =
    [
        { name: CustomerConfigurationsColumnNames.customer_id, type: 'String' },
        {
            name: CustomerConfigurationsColumnNames.configuration_id,
            type: 'String',
        },
        {
            name: CustomerConfigurationsColumnNames.configuration_name,
            type: 'String',
        },
        {
            name: CustomerConfigurationsColumnNames.configuration_data,
            type: 'String',
        },
        { name: CustomerConfigurationsColumnNames.created_at, type: 'String' },
        { name: CustomerConfigurationsColumnNames.updated_at, type: 'String' },
    ];

export const storesColumnInfo: StoresColumnInfo = [
    { name: StoresColumnNames.store_id, type: 'String' },
    { name: StoresColumnNames.store_name, type: 'String' },
    {
        name: StoresColumnNames.customer_configurations_datatable_id,
        type: 'String',
    },
    { name: StoresColumnNames.created_at, type: 'String' },
    { name: StoresColumnNames.updated_at, type: 'String' },
];
