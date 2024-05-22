import {
    ColumnInfo,
    CreateDatatableParams,
    GetDatatableByNameResponse,
    TheekitGetDatatableRows,
    SaveCustomerConfigurationsDatatable,
    ThreekitGetDatatableByName,
    UpdateDatatableUnion,
    CreateDatatableResponse,
    ThreekitCreateDatatable,
    UpdateDatatableResponse,
    ThreekitUpdateDatatable,
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

export const getDatatableRows = async <T extends string | number | symbol>(
    datatableId: string
) => {
    const getDatatableRowsEndpoint = `${apiURL}/datatables/${datatableId}/rows?org_id=${process.env.THREEKIT_ORG_ID}&all=true`;
    const response = await axios.get(getDatatableRowsEndpoint, {
        headers: {
            Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
        },
    });

    return response.data as TheekitGetDatatableRows<T>;
};

export const updateDatatable = async ({
    datatableId,
    datatableName,
    type,
    data,
}: UpdateDatatableUnion): Promise<UpdateDatatableResponse> => {
    const updateDatatableEndpoint = `${apiURL}/datatables/${datatableId}?org_id=${process.env.THREEKIT_ORG_ID}`;
    const datatableRows = await getDatatableRows(datatableId);
    let datatableColumnInfo: ColumnInfo[] = [];

    switch (type) {
        case 'store':
            datatableColumnInfo = storesColumnInfo;
            break;
    }

    if (datatableColumnInfo.length) {
        const form = new FormData();
        form.append('name', datatableName);
        form.append('columnInfo', JSON.stringify(datatableColumnInfo));
        const file = papaparse.unparse([
            data,
            ...datatableRows.rows.map(row => row.value),
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
    ) as ThreekitGetDatatableByName;

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
