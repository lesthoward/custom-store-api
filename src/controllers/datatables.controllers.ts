import { Request, Response } from 'express';
import {
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
import { StoresColumnNames } from '../types/threekit.types';

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

        const customerConfigurationsDatatableData = await getDatatableById(
            customerConfigurationsDatatableId
        );

        if (!customerConfigurationsDatatableData?.id) {
            throw new Error(
                `Customer configurations datatable not found for store ${req.query.storeId}`
            );
        }

        const customerConfigurationsDatatableRows = await getDatatableRows(
            customerConfigurationsDatatableData.id
        );

        const rows = customerConfigurationsDatatableRows?.rows.filter(
            row => row.value.customer_id === req.query.customerId
        );

        res.json(rows || []);
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
                'Not customer configurations datatable found to save customer configuration'
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
                    configuration_data: req.body.data,
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
