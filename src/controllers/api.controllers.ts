import { Request, Response } from 'express';
import {
    createDatatableSchema,
    getStoreSchema,
    updateDatatableSchema,
} from '../validators/index.validator';
import {
    createDatatable,
    getDatatableByName,
    getDatatableRows,
    updateDatatable,
} from '../helpers/threekit.helpers';
import { storesDatatableName } from '../constants/threekit.constants';
import { StoresColumnNames } from '../types/threekit.types';
import { CatchError } from '../helpers/catch.helpers';

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

        // Get the store from the datatable
        const datatableByNameResponse =
            await getDatatableByName(storesDatatableName);

        if (!datatableByNameResponse.datatable)
            throw new Error(`Datatable ${storesDatatableName} not found.`);

        const storesDatatableRows = await getDatatableRows<StoresColumnNames>(
            datatableByNameResponse.datatable?.id
        );
        const store = storesDatatableRows.rows.find(
            row => row.value.store_id === req.params.storeId
        );

        if (!store)
            throw new Error(`Store with id ${req.params.storeId} not found.`);

        const storeRows = await getDatatableRows<StoresColumnNames>(
            datatableByNameResponse.datatable?.id
        );

        res.json({
            info: store,
            data: storeRows,
        });
    } catch (error: any) {
        res.json(
            new CatchError({
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
        const storeRows = datatableRows.rows.find(
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
            data: {
                customer_configurations_datatable_id:
                    customerConfigurationsDatatableResponse.apiResponse.id,
                created_at: new Date().toISOString(),
                store_id: req.body.storeId,
                store_name: req.body.storeName,
                updated_at: 'null',
            },
        });

        res.json(response.apiResponse);
    } catch (error) {
        const knownError = error as any;
        res.status(knownError.status || 500).json(
            new CatchError({
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
            new CatchError({
                message: error?.response?.data?.message || error?.message,
                details: error,
            })
        );
    }
};
