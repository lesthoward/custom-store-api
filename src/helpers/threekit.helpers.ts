import {
    ColumnInfo,
    CreateDatatableParams,
    GetDatatableByNameResponse,
    TheekitGetDatatableRows,
    SaveCustomerConfigurationsDatatable,
    ThreekitGetDatatableResponse,
    CreateDatatableResponse,
    ThreekitCreateDatatable,
    UpdateDatatableResponse,
    ThreekitUpdateDatatable,
    UpdateDatatableParams,
    StoresColumnNames,
} from '../types/threekit.types';
import {
    customerConfigurationsColumnInfo,
    customerConfigurationsDatatableName,
    storesColumnInfo,
    storesDatatableName,
} from '../constants/threekit.constants';
import axios from 'axios';
import FormData from 'form-data';
import papaparse from 'papaparse';

const apiURL = `https://${process.env.THREEKIT_ENVIRONMENT}.threekit.com/api`;

interface GetStoreRowsParams {
    storeId: string;
}

export const getStoreRows = async ({ storeId }: GetStoreRowsParams) => {
    // Get the store from the datatable
    const datatableByNameResponse =
        await getDatatableByName(storesDatatableName);

    if (!datatableByNameResponse.datatable)
        throw new Error(`Datatable ${storesDatatableName} not found.`);

    const storesDatatableRows = await getDatatableRows<StoresColumnNames>(
        datatableByNameResponse.datatable?.id
    );

    const store = storesDatatableRows?.rows.find(
        row => row.value.store_id === storeId
    );

    if (!store) throw new Error(`Store with id ${storeId} not found.`);

    const storeRows = await getDatatableRows<StoresColumnNames>(
        datatableByNameResponse.datatable?.id
    );
    return {
        info: store,
        data: storeRows,
    };
};

export const getDatatableById = async (datatableId: string) => {
    const getDatatableEndpoint = `${apiURL}/datatables/${datatableId}?org_id=${process.env.THREEKIT_ORG_ID}`;
    const response = await axios.get<ThreekitGetDatatableResponse>(
        getDatatableEndpoint,
        {
            headers: {
                Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
            },
        }
    );

    return response.data;
};

export const deleteDatatableById = async (datatableId: string) => {
    const deleteDatatableEndpoint = `${apiURL}/datatables/${datatableId}?org_id=${process.env.THREEKIT_ORG_ID}`;
    const response = await axios.delete(deleteDatatableEndpoint, {
        headers: {
            Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
        },
    });

    return {
        apiResponse: response.data,
    };
};

export const getDatatableRows = async <T extends string | number | symbol>(
    datatableId: string
) => {
    const getDatatableRowsEndpoint = `${apiURL}/datatables/${datatableId}/rows?org_id=${process.env.THREEKIT_ORG_ID}&all=true`;
    const response = await axios.get(getDatatableRowsEndpoint, {
        headers: {
            Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
        },
    });

    return response.data as TheekitGetDatatableRows<T> | undefined;
};

export const updateDatatable = async ({
    action = 'addRecord',
    datatableId,
    datatableName,
    type,
    data,
}: UpdateDatatableParams): Promise<UpdateDatatableResponse> => {
    const updateDatatableEndpoint = `${apiURL}/datatables/${datatableId}?org_id=${process.env.THREEKIT_ORG_ID}`;
    // If the action is addRecord, get the existing rows, otherwise, update the datatable with the provided data from params only
    const datatableRows =
        action === 'addRecord'
            ? (await getDatatableRows(datatableId))?.rows
            : [];

    let datatableColumnInfo: ColumnInfo[] = [];

    switch (type) {
        case 'store':
            datatableColumnInfo = storesColumnInfo;
            break;
        case 'customer_configurations':
            datatableColumnInfo = customerConfigurationsColumnInfo;
            break;
    }

    if (datatableColumnInfo.length) {
        const form = new FormData();
        form.append('name', datatableName);
        form.append('columnInfo', JSON.stringify(datatableColumnInfo));
        const file = papaparse.unparse([
            ...data,
            ...(datatableRows ? datatableRows.map(row => row.value) : []),
        ]);
        form.append('file', file, {
            filename: `${datatableName}.csv`,
            contentType: 'text/csv',
        });

        const response = await axios.put<ThreekitUpdateDatatable>(
            updateDatatableEndpoint,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
                },
            }
        );

        return {
            apiResponse: response.data,
        };
    } else {
        throw new Error('Invalid column info');
    }
};

/**
 * Check if a datatable with the specified name exists
 */
export const getDatatableByName = async (
    datatableName: string
): Promise<GetDatatableByNameResponse> => {
    const resultsPerPage = 100;
    const page = 1;
    const getDatatableEndpoint = `${apiURL}/datatables?org_id=${process.env.THREEKIT_ORG_ID}&resultsPerPage=${resultsPerPage}&page=${page}`;
    const response = await axios.get(getDatatableEndpoint, {
        headers: {
            Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
        },
    });
    const datatablesCount = response.data.count;
    const countPages = Math.ceil(datatablesCount / resultsPerPage);

    let datatable = response.data.datatables.find(
        (datatable: any) => datatable.name === datatableName
    ) as ThreekitGetDatatableResponse | undefined;

    // If the datatable is not found on the first page, check the rest of the pages
    if (!datatable && countPages > 1) {
        for (let i = 2; i <= countPages; i++) {
            const response = await axios.get(getDatatableEndpoint, {
                headers: {
                    Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
                },
            });
            datatable = response.data.datatables.find(
                (datatable: any) => datatable.name === datatableName
            );
            if (datatable) {
                break;
            }
        }
    }

    return {
        datatable,
    };
};

export const createDatatable = async ({
    type,
    ...params
}: CreateDatatableParams): Promise<CreateDatatableResponse> => {
    const createDatatableEndpoint = `${apiURL}/datatables?org_id=${process.env.THREEKIT_ORG_ID}`;
    let datatableName: string = '';
    let datatableColumnInfo: ColumnInfo[] = [];

    switch (type) {
        case 'save_customer_configurations':
            const localParams = params as SaveCustomerConfigurationsDatatable;
            datatableName = `${customerConfigurationsDatatableName}${localParams.storeId}`;
            datatableColumnInfo = customerConfigurationsColumnInfo;
            break;
        case 'store':
            datatableName = storesDatatableName;
            datatableColumnInfo = storesColumnInfo;
            break;
    }

    if (datatableName.length && datatableColumnInfo.length) {
        const form = new FormData();
        form.append('name', datatableName);
        form.append('columnInfo', JSON.stringify(datatableColumnInfo));

        // Create a csv file with the column names
        const file = papaparse.unparse<string>({
            fields: [...datatableColumnInfo.map(column => column.name)],
            data: [],
        });
        form.append('file', file, {
            filename: `${datatableName}.csv`,
            contentType: 'text/csv',
        });

        const response = await axios.post<ThreekitCreateDatatable>(
            createDatatableEndpoint,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
                },
            }
        );

        return {
            datatableColumnInfo,
            datatableName,
            apiResponse: response.data,
        };
    } else {
        throw new Error('Invalid datatable name or column info');
    }
};
