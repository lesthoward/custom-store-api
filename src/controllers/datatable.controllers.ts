import { Request, Response } from 'express';
import joi from 'joi';
import { createDatatableSchema } from '../validators/index.validator';
import { createDatatable } from '../helpers/threekit.helpers';

export type CreateDatatableTypes = 'save_customer_configurations';

export interface CreateDatatableBody {
    // Unique identifier for the datatable
    unique_id: string;
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
        const { response } = await createDatatable(req.body);

        if (response.status !== 200) {
            console.error(response);
            throw new Error(
                'Unexpected response from Threekit API when creating datatable'
            );
        }

        res.send('ok');
    } catch (error) {
        const knownError = error as any;
        console.info(knownError);
        if (error instanceof joi.ValidationError) {
            res.json(error.details);
        }

        if (knownError?.response?.data?.message) {
            res.send(knownError.response.data.message);
        } else {
            res.send(knownError.message);
        }
    }
};
