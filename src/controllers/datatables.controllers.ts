import { Request, Response } from 'express';
import {
    deleteConfigurationSchema,
    getConfigurationByIdSchema,
    getCustomerConfigSchema,
    saveCustomerConfigSchema,
} from '../validators/joi.validators';
import { RequestResponse } from '../helpers/catch.helpers';
import {
    getDatatableById,
    getDatatableByName,
    getDatatableRows,
    getStoreRows,
    updateDatatable,
} from '../helpers/threekit.helpers';
import { storesDatatableName } from '../constants/threekit.constants';
import {
    CustomerConfigurationsColumnNames,
    StoresColumnNames,
} from '../types/threekit.types';
import { BusinessApi } from '../services/business.services';

interface GetCustomerConfigQuery {
    storeId: string;
    customerId: string;
}

export const getCustomerConfigHandler = async (
    req: Request<any, any, any, GetCustomerConfigQuery>,
    res: Response
) => {
    try {
        await getCustomerConfigSchema.validateAsync(req.query);

        const storeRows = await getStoreRows({ storeId: req.query.storeId });

        const customerConfigurationsDatatableId =
            storeRows.info.value.customer_configurations_datatable_id;

        const customerConfigurationsDatatableDatatable = await getDatatableById(
            customerConfigurationsDatatableId
        );

        if (!customerConfigurationsDatatableDatatable?.id) {
            throw new Error(
                `Customer configurations datatable not found for store ${req.query.storeId}`
            );
        }

        const customerConfigurationsDatatableRows = await getDatatableRows(
            customerConfigurationsDatatableDatatable.id
        );

        const rows = customerConfigurationsDatatableRows?.rows.filter(
            row => row.value.customer_id === req.query.customerId
        );

        const configuratios = [];
        for (const row of rows || []) {
            const configurationId = row.value.configuration_id;

            const configuration =
                await BusinessApi.getThreekitConfigurationById(configurationId);

            if (!configuration.ok) {
                return res.json(
                    new RequestResponse({
                        message: 'Error getting configuration',
                        details: configuration,
                    })
                );
            }

            const data = await configuration.json();

            configuratios.push({
                ...row.value,
                configuration_data: data,
            });
        }

        res.json(configuratios);
    } catch (error: any) {
        res.status(500).json(
            new RequestResponse({
                message: error?.message,
                details: error,
            })
        );
    }
};

interface SaveCustomerConfigParams {
    storeId: string;
    picture: string;
    id: string;
    name: string;
    data: any;
    customerId: string;
}

export const saveCustomerConfigHandler = async (
    req: Request<any, any, SaveCustomerConfigParams>,
    res: Response
) => {
    try {
        await saveCustomerConfigSchema.validateAsync(req.body);

        // Get the store from the datatable
        const storesDatatable = await getDatatableByName(storesDatatableName);

        if (!storesDatatable.datatable)
            throw new Error(`Datatable ${storesDatatableName} not found.`);

        const storesDatatableRows = (
            await getDatatableRows<StoresColumnNames>(
                storesDatatable.datatable?.id
            )
        )?.rows;

        if (!storesDatatableRows) {
            throw new Error('Not stores found to save customer configuration');
        }

        // Get store reference from stores datatable
        const foundStoreDatatable = storesDatatableRows.find(
            row => row.value.store_id === req.body.storeId
        );

        if (!foundStoreDatatable) {
            throw new Error('Not store found to save customer configuration');
        }

        // Get the customer configurations datatable
        const customersConfigurationsDatatable = await getDatatableById(
            foundStoreDatatable.value.customer_configurations_datatable_id
        );

        if (!customersConfigurationsDatatable) {
            throw new Error(
                'No customer configurations datatable found to save customer configuration'
            );
        }

        // Get customer configurations datatable rows
        const customersConfigurationsDatatableRows = (
            await getDatatableRows(customersConfigurationsDatatable.id)
        )?.rows;

        // Check if the customer configuration name already exists
        const existingCustomerConfiguration =
            customersConfigurationsDatatableRows?.find(
                row =>
                    row.value.configuration_name.trim().toLowerCase() ===
                    req.body.name.trim().toLowerCase()
            );

        if (existingCustomerConfiguration) {
            throw new Error(
                `Configuration "${req.body.name.trim()}" already exists`
            );
        }

        await updateDatatable({
            action: 'addRecord',
            type: 'customer_configurations',
            datatableId: customersConfigurationsDatatable.id,
            datatableName: customersConfigurationsDatatable.name,
            data: [
                {
                    customer_id: req.body.customerId,
                    configuration_id: req.body.id,
                    configuration_name: req.body.name.trim(),
                    configuration_data: JSON.stringify(req.body.data),
                    created_at: new Date().toISOString(),
                    picture: req.body.picture,
                    updated_at: 'null',
                },
            ],
        });

        res.json(
            new RequestResponse({
                message: 'Customer configuration saved successfully',
                isError: false,
            })
        );
    } catch (error: any) {
        res.status(500).json(
            new RequestResponse({
                message: error?.message,
                details: error,
            })
        );
    }
};

interface GetConfigurationByIdQuery {
    configurationId: string;
    storeId: string;
}

export const getConfigurationById = async (
    req: Request<any, any, any, GetConfigurationByIdQuery>,
    res: Response
) => {
    try {
        await getConfigurationByIdSchema.validateAsync(req.query);

        // Get the store from the stores datatable
        const storesDatatable = await getDatatableByName(storesDatatableName);

        if (!storesDatatable.datatable) {
            return res.status(404).json(
                new RequestResponse({
                    message: `Datatable ${storesDatatableName} not found.`,
                })
            );
        }

        const storesDatatableRows = (
            await getDatatableRows<StoresColumnNames>(
                storesDatatable.datatable?.id
            )
        )?.rows;

        if (!storesDatatableRows) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No stores found',
                })
            );
        }

        // Get store reference from stores datatable
        const foundStoreDatatable = storesDatatableRows.find(
            row => row.value.store_id === req.query.storeId
        );

        if (!foundStoreDatatable) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No store found with the provided ID',
                })
            );
        }

        // Get the configurations datatable
        const configurationsDatatable = await getDatatableById(
            foundStoreDatatable.value.customer_configurations_datatable_id
        );

        if (!configurationsDatatable) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No configurations datatable found',
                })
            );
        }

        const configurationsDatatableRows = (
            await getDatatableRows(configurationsDatatable.id)
        )?.rows;

        if (!configurationsDatatableRows) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No configurations found',
                })
            );
        }

        const getConfigurationById = configurationsDatatableRows.find(
            row =>
                row.value.configuration_id.toLocaleLowerCase().trim() ===
                req.query.configurationId.toLocaleLowerCase().trim()
        );

        if (!getConfigurationById) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No configuration found',
                })
            );
        }

        res.json(
            new RequestResponse({
                message: 'Configuration found successfully',
                details: getConfigurationById,
                isError: false,
            })
        );
    } catch (error: any) {
        res.status(error.status || 500).json(
            new RequestResponse({
                message: error?.message,
                details: error,
            })
        );
    }
};

interface DeleteConfigurationQuery {
    configurationId: string;
    customerId: string;
    storeId: string;
}

export const deleteConfigurationHandler = async (
    req: Request<any, any, any, DeleteConfigurationQuery>,
    res: Response
) => {
    try {
        await deleteConfigurationSchema.validateAsync(req.query);

        // Get the store from the stores datatable
        const storesDatatable = await getDatatableByName(storesDatatableName);

        if (!storesDatatable.datatable) {
            return res.status(404).json(
                new RequestResponse({
                    message: `Datatable ${storesDatatableName} not found.`,
                })
            );
        }

        const storesDatatableRows = (
            await getDatatableRows<StoresColumnNames>(
                storesDatatable.datatable?.id
            )
        )?.rows;

        if (!storesDatatableRows) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No stores found',
                })
            );
        }

        // Get store reference from stores datatable
        const foundStoreDatatable = storesDatatableRows.find(
            row => row.value.store_id === req.query.storeId
        );

        if (!foundStoreDatatable) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No store found with the provided ID',
                })
            );
        }

        // Get the configurations datatable
        const configurationsDatatable = await getDatatableById(
            foundStoreDatatable.value.customer_configurations_datatable_id
        );

        if (!configurationsDatatable) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'No configurations datatable found',
                })
            );
        }

        const getConfigurationRows = (
            await getDatatableRows<CustomerConfigurationsColumnNames>(
                configurationsDatatable.id
            )
        )?.rows;

        console.info('getConfigurationRows', getConfigurationRows);

        console.info('row.value.configuration_id', req.query.configurationId);
        console.info('req.query.configurationId', req.query.configurationId);
        const getConfigurationById = getConfigurationRows?.find(
            row =>
                row.value.configuration_id.toLocaleLowerCase().trim() ===
                req.query.configurationId.toLocaleLowerCase().trim()
        );

        console.info('getConfigurationById', getConfigurationById);

        // if (!getConfigurationById) {
        //     return res.status(404).json(
        //         new RequestResponse({
        //             message: 'No configuration found',
        //         })
        //     );
        // }

        if (getConfigurationById?.value.customer_id !== req.query.customerId) {
            return res.status(404).json(
                new RequestResponse({
                    message: 'Not authorized to delete this configuration',
                })
            );
        }

        const filteredConfigurations =
            getConfigurationRows?.filter(
                row =>
                    row.value.configuration_id.toLocaleLowerCase().trim() !==
                    getConfigurationById.value.configuration_id
                        .toLocaleLowerCase()
                        .trim()
            ) || [];

        await updateDatatable({
            action: 'replaceRecords',
            type: 'customer_configurations',
            datatableId: configurationsDatatable.id,
            datatableName: configurationsDatatable.name,
            data: filteredConfigurations.map(row => row.value),
        });

        return res.json(getConfigurationById);
    } catch (error: any) {
        console.error('Error deleting configuration', error);
        res.status(error.status || 500).json(
            new RequestResponse({
                message: error?.message,
                details: error,
            })
        );
    }
};
