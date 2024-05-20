import { CreateDatatableBody } from '../controllers/datatable.controllers';
import { ColumnInfo } from '../types/threekit.types';
import { customerConfigurationsColumnInfo } from '../constants/threekit.constants';
import axios from 'axios';
import FormData from 'form-data';
import papaparse from 'papaparse';

const apiURL = `https://${process.env.THREEKIT_ENVIRONMENT}.threekit.com/api`;

export const createDatatable = async ({
    type,
    unique_id,
}: CreateDatatableBody) => {
    const createDatatableEndpoint = `${apiURL}/datatables?org_id=${process.env.THREEKIT_ORG_ID}`;
    console.info('createDatatableEndpoint', createDatatableEndpoint);
    let datatableName: string;
    let datatableColumnInfo: ColumnInfo[];

    switch (type) {
        case 'save_customer_configurations':
            datatableName = `customer_configurations_${unique_id}`;
            datatableColumnInfo = customerConfigurationsColumnInfo;
            break;
    }

    const form = new FormData();
    form.append('name', datatableName);
    form.append('columnInfo', JSON.stringify(datatableColumnInfo));

    // Create a csv file with the column names
    const file = papaparse.unparse({
        ...datatableColumnInfo.map(column => column.name),
    });
    form.append('file', file, {
        filename: `${datatableName}.csv`,
        contentType: 'text/csv',
    });

    const response = await axios.post(createDatatableEndpoint, form, {
        headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.THREEKIT_PRIVATE_TOKEN}`,
        },
    });

    return {
        datatableColumnInfo,
        datatableName,
        response,
    };
};
