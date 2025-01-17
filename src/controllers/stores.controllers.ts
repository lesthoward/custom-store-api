import { Request, Response } from 'express';
import {
    createDatatableSchema,
    deleteStoreSchema,
    getStoreSchema,
    updateDatatableSchema,
} from '../validators/joi.validators';
import {
    createDatatable,
    deleteDatatableById,
    getDatatableByName,
    getDatatableRows,
    getStoreRows,
    updateDatatable,
} from '../helpers/threekit.helpers';
import { storesDatatableName } from '../constants/threekit.constants';
import { StoresColumnNames } from '../types/threekit.types';
import { RequestResponse } from '../helpers/catch.helpers';

interface DeleteStoreParams {
    storeId: string;
}

export const deleteStoreHandler = async (
    req: Request<any, any, any, DeleteStoreParams, any>,
    res: Response
) => {
    try {
        await deleteStoreSchema.validateAsync(req.query);

        // Get the store from the datatable
        const datatableByNameResponse =
            await getDatatableByName(storesDatatableName);

        if (!datatableByNameResponse.datatable)
            throw new Error(`Datatable ${storesDatatableName} not found.`);

        const storesDatatableRows = await getDatatableRows<StoresColumnNames>(
            datatableByNameResponse.datatable?.id
        );

        const store = storesDatatableRows?.rows.find(
            row => row.value.store_id === req.query.storeId
        );

        if (!store) {
            throw new Error('Could not find the store to delete');
        }

        if (store?.value.customer_configurations_datatable_id) {
            await deleteDatatableById(
                store.value.customer_configurations_datatable_id
            );
        }

        const newStoresDatatableRows = storesDatatableRows?.rows.filter(
            row => row.value.store_id !== req.query.storeId
        );

        if (!newStoresDatatableRows) {
            throw new Error('Could not find the store to delete');
        }

        await updateDatatable({
            action: 'replaceRecords',
            datatableId: datatableByNameResponse.datatable.id,
            datatableName: datatableByNameResponse.datatable.name,
            type: 'store',
            data: newStoresDatatableRows.map(row => row.value),
        });

        res.send('ok');
    } catch (error: any) {
        res.json(
            new RequestResponse({
                message:
                    error?.message ||
                    'An error occurred while deleting the store.',
                details: error,
            })
        );
    }
};

interface GetStoreParams {
    storeId: string;
}

export const getStoreHandler = async (
    req: Request<GetStoreParams, any, any, any, any>,
    res: Response
) => {
    try {
        req.params.storeId = decodeURIComponent(req.params.storeId);

        // Validate the request params
        await getStoreSchema.validateAsync(req.params);

        const storeRows = await getStoreRows({
            storeId: req.params.storeId,
        });

        res.json(storeRows);
    } catch (error: any) {
        res.json(
            new RequestResponse({
                message: error?.message,
                details: error,
            })
        );
    }
};

interface CreateStoreBody {
    storeId: string;
    storeName: string;
}

export const createStoreHandler = async (
    req: Request<any, unknown, CreateStoreBody>,
    res: Response
) => {
    try {
        const datatable: {
            id: string | undefined;
            name: string | undefined;
        } = {
            id: undefined,
            name: undefined,
        };
        await updateDatatableSchema.validateAsync(req.body);

        const datatableByNameResponse =
            await getDatatableByName(storesDatatableName);
        datatable.id = datatableByNameResponse.datatable?.id;
        datatable.name = datatableByNameResponse.datatable?.name;

        if (!datatableByNameResponse.datatable) {
            const { apiResponse } = await createDatatable({
                type: 'store',
            });
            datatable.id = apiResponse.id;
            datatable.name = apiResponse.name;
        }

        if (!datatable.id || !datatable.name)
            throw new Error('Could not create datatable');

        // Check if an item with the specified store id already exists in the datatable
        const datatableRows = await getDatatableRows<StoresColumnNames>(
            datatable.id
        );
        const storeRows = datatableRows?.rows.find(
            row => row.value.store_id === req.body.storeId
        );

        if (storeRows) {
            throw new Error('Store already exists');
        }

        // Create a customer configuration datatable for the store
        const customerConfigurationsDatatableResponse = await createDatatable({
            type: 'save_customer_configurations',
            storeId: req.body.storeId,
        });

        // Create a record in the stores datatable
        const response = await updateDatatable({
            datatableId: datatable.id,
            // TODO: change datatableName
            datatableName: datatable.name,
            type: 'store',
            data: [
                {
                    customer_configurations_datatable_id:
                        customerConfigurationsDatatableResponse.apiResponse.id,
                    created_at: new Date().toISOString(),
                    store_id: req.body.storeId,
                    store_name: req.body.storeName,
                    updated_at: 'null',
                },
            ],
        });

        res.json(response.apiResponse);
    } catch (error) {
        const knownError = error as any;
        res.status(knownError.status || 500).json(
            new RequestResponse({
                message: knownError?.message,
                details: knownError,
            })
        );
    }
};

export type CreateDatatableTypes = 'save_customer_configurations';

export interface CreateDatatableBody {
    // Unique identifier for the datatable
    storeId: string;
    // Which type of datatable to create
    type: CreateDatatableTypes;
}

export const createDatatableHandler = async (
    req: Request<any, any, CreateDatatableBody>,
    res: Response
) => {
    try {
        // Validate the request body
        await createDatatableSchema.validateAsync(req.body);

        // Create the datatable
        const { apiResponse } = await createDatatable({
            type: req.body.type,
            storeId: req.body.storeId,
        });

        // Catch any unexpected responses
        if ((apiResponse as any).status !== 200) {
            throw new Error(
                'Unexpected response from Threekit API when creating datatable'
            );
        }

        res.json(apiResponse);
    } catch (error: any) {
        res.json(
            new RequestResponse({
                message: error?.response?.data?.message || error?.message,
                details: error,
            })
        );
    }
};
